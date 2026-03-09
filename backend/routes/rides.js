import { Router } from "express";
import { Ride } from "../models/Ride.js";
import { DriverProfile } from "../models/DriverProfile.js";
import { AppConfig } from "../models/AppConfig.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/rides/active - Get customer's current active ride
router.get("/active", verifyToken, async (req, res) => {
  try {
    const ride = await Ride.findOne({
      customer: req.user.id,
      status: { $in: ["searching", "driver_assigned", "arriving", "arrived", "ongoing"] }
    }).populate('driver', 'name phone rating avatar');

    if (ride && ride.driver) {
      const driverProfile = await DriverProfile.findOne({ user: ride.driver._id });
      // Map to consistent format used in events
      const rideObj = ride.toObject();
      rideObj.driver = {
        ...rideObj.driver,
        vehicle: driverProfile?.vehicle || 'Standard Sedan',
        rating: driverProfile?.rating || 4.8,
        location: driverProfile?.currentLocation
      };
      return res.json(rideObj);
    }
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active ride" });
  }
});

// GET /api/rides/driver/active - Get driver's current active ride
router.get("/driver/active", verifyToken, async (req, res) => {
  try {
    const ride = await Ride.findOne({
      driver: req.user.id,
      status: { $in: ["driver_assigned", "arriving", "arrived", "ongoing"] }
    }).populate('customer', 'name phone');

    res.json(ride);
  } catch (error) {
    console.error("Error fetching driver active ride:", error);
    res.status(500).json({ error: "Failed to fetch active ride" });
  }
});
// GET /api/rides - Get user's rides
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === "customer") {
      query.customer = id;
    } else if (role === "driver") {
      query.driver = id;
    } else if (role === "admin") {
      // Admin sees all
    }

    const rides = await Ride.find(query).sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rides" });
  }
});

// POST /api/rides - Request a ride
router.post("/", verifyToken, async (req, res) => {
  try {
    const { pickup, dropoff, fare, distance, duration, cabType, scheduledTime } = req.body;

    if (!pickup || !dropoff) {
      console.warn("⚠️ Ride Booking: Missing pickup or dropoff data", req.body);
      return res.status(400).json({ error: "Pickup and Dropoff locations are required" });
    }

    // Fetch dynamic config from Admin Settings
    let config = await AppConfig.findOne({ key: "global" });
    if (!config) {
      config = { fares: { baseFare: 40, perKm: 15, perMinute: 2, surgeMultiplier: 1.0 } };
    }

    // Calculate fare based on dynamic config and cab type
    let calculatedFare = fare || 0;
    if (distance && cabType) {
      const distanceKm = parseFloat(distance.replace(/[^\d.]/g, ''));

      // Scale perKm rate based on cab type multipliers (Standardized to Sedan)
      const multipliers = {
        Mini: 0.8,
        Sedan: 1.0,
        SUV: 1.4,
        Bike: 0.5,
        Auto: 0.7,
      };

      const basePerKm = config.fares.perKm;
      const surge = config.fares.surgeMultiplier || 1.0;
      const ratePerKm = basePerKm * (multipliers[cabType] || 1.0) * surge;

      calculatedFare = Math.round(config.fares.baseFare + (distanceKm * ratePerKm));
    }

    const newRide = new Ride({
      customer: req.user.id,
      pickup: {
        address: pickup.address || pickup,
        lat: pickup.lat || 0,
        lng: pickup.lng || 0
      },
      dropoff: {
        address: dropoff.address || dropoff,
        lat: dropoff.lat || 0,
        lng: dropoff.lng || 0
      },
      fare: calculatedFare,
      distance: distance || "0 km",
      duration: duration || "0 min",
      cabType: cabType || "Sedan",
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      isScheduled: !!scheduledTime,
      status: "searching",
      notifications: [{
        type: "booking_confirmed",
        message: `Your ${cabType || 'Sedan'} ride has been booked successfully!`,
        timestamp: new Date(),
      }],
    });

    await newRide.save();

    // Populate customer details for driver display
    await newRide.populate('customer', 'name phone');

    // Notify all online drivers via Socket.IO (only for instant rides)
    if (!scheduledTime) {
      const io = req.app.get('io');
      if (io) {
        io.emit('newRideRequest', {
          rideId: newRide._id,
          pickup: newRide.pickup,
          dropoff: newRide.dropoff,
          fare: newRide.fare,
          distance: newRide.distance,
          cabType: newRide.cabType,
          customer: newRide.customer
        });
      }
    }

    res.status(201).json(newRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to book ride" });
  }
});

// PUT /api/rides/:id/status - Update ride status
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Logic for assigning driver
    console.log(`Ride ${req.params.id} Status Update:`, { requested: status, current: ride.status, role: req.user.role });
    let updated = false;

    if (status === "driver_assigned" && req.user.role === "driver") {
      // Idempotency check: if already accepted by this driver
      const isAlreadyAssigned = (ride.status === "driver_assigned") && ride.driver?.toString() === req.user.id;
      if (isAlreadyAssigned) {
        console.log("Ride already assigned to this driver, returning 200");
        return res.json(ride);
      }

      // Allow transition from searching to driver_assigned
      if (ride.status !== "searching") {
        console.warn(`Cannot assign driver: ride state is ${ride.status}, requested by: ${req.user.id}, role: ${req.user.role}`);
        return res.status(400).json({
          error: `Ride is no longer available (current status: ${ride.status})`,
          details: { currentStatus: ride.status }
        });
      }

      ride.driver = req.user.id;
      ride.status = "driver_assigned";

      await ride.save();
      // Populate...
      await ride.populate('driver', 'name phone');
      await ride.populate('customer', 'name phone');
      updated = true;

      const driverProfile = await DriverProfile.findOne({ user: req.user.id });
      const driverLocation = driverProfile?.currentLocation || { lat: 13.0827, lng: 80.2707 };

      const io = req.app.get('io');
      if (io) {
        const room = `ride_${ride._id}`;
        // Emit specifically to the ride room for status update
        io.to(room).emit('rideStatusUpdate', {
          rideId: ride._id,
          status: 'driver_assigned',
          driver: {
            id: ride.driver._id,
            name: ride.driver.name,
            phone: ride.driver.phone,
            vehicle: driverProfile?.vehicle || 'Standard Sedan',
            rating: driverProfile?.rating || 4.8,
            location: driverLocation
          },
          message: 'Driver assigned! They will arrive shortly.'
        });

        // Emit dedicated rideAccepted event for the user
        io.to(room).emit('rideAccepted', {
          ...ride.toObject(),
          driver: {
            ...ride.driver.toObject(),
            location: driverLocation,
            vehicle: driverProfile?.vehicle || 'Standard Sedan',
            rating: driverProfile?.rating || 4.8
          }
        });
      }
    }
    // Logic for other status updates
    else if (["arriving", "arrived", "ongoing", "completed"].includes(status)) {
      // Check if driver is assigned
      if (!ride.driver) {
        return res.status(400).json({ error: "Ride has no driver assigned" });
      }
      // Ensure only the assigned driver can update
      if (ride.driver.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      // Logic for OTP Generation on Arrived
      if (status === "arrived") {
        ride.otp = Math.floor(1000 + Math.random() * 9000).toString();
      }

      // Logic for OTP Verification on Ongoing
      if (status === "ongoing") {
        const { otp } = req.body;
        if (!otp || otp !== ride.otp) {
          return res.status(401).json({ error: "Invalid OTP. Verification failed." });
        }
      }

      ride.status = status;
      if (status === "completed") {
        ride.completedAt = new Date();

        // Fetch dynamic config for commission
        let config = await AppConfig.findOne({ key: "global" });
        const commissionFactor = config ? (config.commission.percentage / 100) : 0.2;
        const driverShare = 1 - commissionFactor;

        // Calculate and update driver earnings
        const driverProfile = await DriverProfile.findOne({ user: req.user.id });
        if (driverProfile) {
          const earned = ride.fare * driverShare;
          driverProfile.walletBalance = (driverProfile.walletBalance || 0) + earned;
          driverProfile.totalEarnings = (driverProfile.totalEarnings || 0) + earned;
          driverProfile.totalTrips = (driverProfile.totalTrips || 0) + 1;

          // Sync granular earnings for dashboard visibility
          if (!driverProfile.earnings) {
            driverProfile.earnings = { today: 0, week: 0, month: 0, total: 0 };
          }
          driverProfile.earnings.today = (driverProfile.earnings.today || 0) + earned;
          driverProfile.earnings.week = (driverProfile.earnings.week || 0) + earned;
          driverProfile.earnings.month = (driverProfile.earnings.month || 0) + earned;
          driverProfile.earnings.total = (driverProfile.earnings.total || 0) + earned;

          await driverProfile.save();
        }
      }

      await ride.save();
      updated = true;

      const io = req.app.get('io');
      if (io) {
        const room = `ride_${ride._id}`;
        const eventMap = {
          'arrived': 'driverArrived',
          'ongoing': 'tripStarted',
          'completed': 'tripCompleted'
        };

        const payload = {
          rideId: ride._id,
          status: status,
          otp: ride.otp, // Sync OTP to both parties
          message: `Ride status updated to ${status}`,
          driver: {
            id: req.user.id,
            location: await DriverProfile.findOne({ user: req.user.id }).then(p => p?.currentLocation)
          }
        };

        io.to(room).emit('rideStatusUpdate', payload);

        if (eventMap[status]) {
          io.to(room).emit(eventMap[status], payload);
        }
      }
    }
    else if (status === "cancelled") {
      ride.status = "cancelled";
      await ride.save();
      updated = true;

      const io = req.app.get('io');
      if (io) {
        io.to(`ride_${ride._id}`).emit('rideStatusUpdate', {
          rideId: ride._id,
          status: 'cancelled',
          message: 'Ride has been cancelled'
        });
        io.to(`ride_${ride._id}`).emit('rideCancelled', {
          rideId: ride._id,
          message: 'Ride has been cancelled'
        });
        // Global emit for drivers to clear pending "searching" modals
        io.emit('rideCancelledGlobal', { rideId: ride._id });
      }
    }

    if (!updated) {
      console.warn("Invalid status transition attempt:", { requested: status, current: ride.status, role: req.user.role });
      // Fallthrough means status was not updated (e.g. invalid status or wrong role)
      return res.status(400).json({
        error: "Invalid status transition or role mismatch",
        details: { requested: status, current: ride.status, role: req.user.role }
      });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ error: "Failed to update ride" });
  }
});

// PUT /api/rides/:id/rating - Submit rating and feedback
router.put("/:id/rating", verifyToken, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Only customer can rate
    if (ride.customer.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Only completed rides can be rated
    if (ride.status !== "completed") {
      return res.status(400).json({ error: "Can only rate completed rides" });
    }

    ride.rating = rating;
    ride.feedback = feedback || "";
    await ride.save();

    res.json(ride);
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

// POST /api/rides/:id/sos - Activate emergency SOS
router.post("/:id/sos", verifyToken, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("customer driver");

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Only customer can activate SOS
    if (ride.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    ride.sosActivated = true;
    ride.sosTimestamp = new Date();
    ride.notifications.push({
      type: "sos_alert",
      message: "🚨 Emergency SOS activated! Location shared with emergency contacts.",
      timestamp: new Date(),
    });

    await ride.save();

    // Emit SOS alert via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('sosAlert', {
        rideId: ride._id,
        customer: ride.customer,
        driver: ride.driver,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        timestamp: ride.sosTimestamp,
      });
    }

    res.json({ message: "SOS activated successfully", ride });
  } catch (error) {
    console.error("Error activating SOS:", error);
    res.status(500).json({ error: "Failed to activate SOS" });
  }
});

// GET /api/rides/:id/invoice - Generate invoice
router.get("/:id/invoice", verifyToken, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("driver", "name phone");

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Only customer or admin can view invoice
    if (ride.customer._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${ride._id.toString().slice(-8).toUpperCase()}`,
      date: ride.createdAt,
      completedAt: ride.completedAt,
      customer: {
        name: ride.customer.name,
        email: ride.customer.email,
        phone: ride.customer.phone,
      },
      driver: ride.driver ? {
        name: ride.driver.name,
        phone: ride.driver.phone,
      } : null,
      ride: {
        pickup: ride.pickup.address,
        dropoff: ride.dropoff.address,
        distance: ride.distance,
        duration: ride.duration,
        cabType: ride.cabType,
        status: ride.status,
      },
      fare: {
        baseFare: ride.fare,
        tax: Math.round(ride.fare * 0.05), // 5% tax
        total: Math.round(ride.fare * 1.05),
      },
      paymentStatus: ride.paymentStatus,
    };

    res.json(invoice);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

export { router as rideRoutes };
