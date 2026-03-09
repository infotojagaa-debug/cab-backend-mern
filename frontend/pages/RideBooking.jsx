import React from "react";
function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ArrowRight,

  Star,
  ChevronLeft,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";












export default function RideBooking() {
  const navigate = useNavigate();
  const { setCurrentRide } = useApp();
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingInfo, setBookingInfo] = useState({
    pickupLocation: "",
    dropoffLocation: "",
  });

  useEffect(() => {
    const info = localStorage.getItem("bookingInfo");
    if (info) {
      setBookingInfo(JSON.parse(info));
    }
  }, []);

  const rideOptions = [
    {
      id: "1",
      type: "economy",
      name: "Economy",
      icon: "🚗",
      price: 65,
      distance: 12.5,
      estimatedTime: 18,
      description: "Affordable & comfortable",
    },
    {
      id: "2",
      type: "premium",
      name: "Premium",
      icon: "🚕",
      price: 135,
      distance: 12.5,
      estimatedTime: 16,
      description: "Premium comfort & newer vehicles",
    },
    {
      id: "3",
      type: "xl",
      name: "XL",
      icon: "🚙",
      price: 200,
      distance: 12.5,
      estimatedTime: 20,
      description: "Space for up to 6 passengers",
    },
    {
      id: "4",
      type: "auto",
      name: "Auto",
      icon: "🛺",
      price: 50,
      distance: 12.5,
      estimatedTime: 22,
      description: "Affordable auto rickshaws",
    },
    {
      id: "5",
      type: "bike",
      name: "Bike",
      icon: "🏍️",
      price: 35,
      distance: 12.5,
      estimatedTime: 15,
      description: "Quick bike rides",
    },
  ];

  const handleSelectRide = (rideId) => {
    setSelectedRide(rideId);
  };

  const handleContinue = () => {
    if (!selectedRide) {
      alert("Please select a ride");
      return;
    }

    const selected = rideOptions.find((r) => r.id === selectedRide);
    if (selected) {
      const rideData = {
        id: `ride_${Date.now()}`,
        userId: "user_1",
        pickupLocation: {
          name: bookingInfo.pickupLocation,
          lat: 13.0827,
          lng: 80.2707,
        },
        dropoffLocation: {
          name: bookingInfo.dropoffLocation,
          lat: 13.1939,
          lng: 80.1828,
        },
        distance: selected.distance,
        estimatedFare: selected.price,
        selectedRideType: selected.type,
        status: "pending",
      };

      setCurrentRide(rideData);
      localStorage.setItem("rideData", JSON.stringify(rideData));
      navigate("/otp-verification");
    }
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-background" }
      /* Header */
      , React.createElement('div', { className: "border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" }
          , React.createElement('button', {
            onClick: () => navigate("/home"),
            className: "flex items-center gap-2 hover:opacity-80 transition"
          }

            , React.createElement(ChevronLeft, { className: "w-6 h-6 text-primary" })
            , React.createElement('span', { className: "font-semibold text-foreground" }, "Back")
          )
          , React.createElement('h1', { className: "text-xl font-bold text-foreground" }, "Select Your Ride")
          , React.createElement('div', { className: "w-20" })
        )
      )

      /* Main Content */
      , React.createElement('div', { className: "max-w-3xl mx-auto px-6 py-8 space-y-8" }
        /* Journey Details */
        , React.createElement('div', { className: "rounded-xl border border-border bg-card p-6 space-y-4" }
          , React.createElement('h2', { className: "text-lg font-bold text-foreground" }, "Journey Details")

          , React.createElement('div', { className: "space-y-3" }
            , React.createElement('div', { className: "flex items-start gap-4" }
              , React.createElement(MapPin, { className: "w-5 h-5 text-primary mt-1 flex-shrink-0" })
              , React.createElement('div', {}
                , React.createElement('p', { className: "text-xs font-semibold text-muted-foreground uppercase" }, "From"

                )
                , React.createElement('p', { className: "text-foreground font-medium" }
                  , bookingInfo.pickupLocation || "Not selected"
                )
              )
            )

            , React.createElement('div', { className: "h-8 flex items-center justify-center mx-4" }
              , React.createElement('div', { className: "w-0.5 h-full bg-border" })
            )

            , React.createElement('div', { className: "flex items-start gap-4" }
              , React.createElement(MapPin, { className: "w-5 h-5 text-accent mt-1 flex-shrink-0" })
              , React.createElement('div', {}
                , React.createElement('p', { className: "text-xs font-semibold text-muted-foreground uppercase" }, "To"

                )
                , React.createElement('p', { className: "text-foreground font-medium" }
                  , bookingInfo.dropoffLocation || "Not selected"
                )
              )
            )
          )

          , React.createElement('div', { className: "pt-4 border-t border-border flex items-center justify-between text-sm" }
            , React.createElement('span', { className: "text-muted-foreground" }, "Estimated Distance")
            , React.createElement('span', { className: "font-semibold text-foreground" }, "12.5 km")
          )
        )

        /* Ride Options */
        , React.createElement('div', { className: "space-y-4" }
          , React.createElement('h2', { className: "text-lg font-bold text-foreground" }, "Choose Your Ride")

          , rideOptions.map((ride) => (
            React.createElement('button', {
              key: ride.id,
              onClick: () => handleSelectRide(ride.id),
              className: `w-full rounded-lg border-2 p-6 transition-all ${selectedRide === ride.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
                }`
            }

              , React.createElement('div', { className: "flex items-start justify-between gap-4" }
                , React.createElement('div', { className: "flex items-start gap-4 flex-1 text-left" }
                  , React.createElement('div', { className: "text-4xl" }, ride.icon)

                  , React.createElement('div', { className: "flex-1" }
                    , React.createElement('div', { className: "flex items-center gap-2 mb-1" }
                      , React.createElement('h3', { className: "text-lg font-bold text-foreground" }
                        , ride.name
                      )
                      , React.createElement('span', { className: "text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded" }
                        , ride.description
                      )
                    )

                    , React.createElement('div', { className: "flex items-center gap-4 text-sm text-muted-foreground" }
                      , React.createElement('span', {}, "⏱️ ", ride.estimatedTime, " min")
                      , React.createElement('span', {}, "🛣️ ", ride.distance, " km")
                      , React.createElement('span', { className: "flex items-center gap-1" }
                        , React.createElement(Star, { className: "w-4 h-4 fill-yellow-400 text-yellow-400" }), "4.8"

                      )
                    )
                  )
                )

                , React.createElement('div', { className: "text-right" }
                  , React.createElement('div', { className: "text-2xl font-bold text-primary" }, "₹"
                    , ride.price
                  )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Estimated")
                )
              )
            )
          ))
        )

        /* Fare Breakdown */
        , selectedRide && (
          React.createElement('div', { className: "rounded-xl border border-border bg-card p-6 space-y-4" }
            , React.createElement('h3', { className: "font-bold text-foreground" }, "Fare Breakdown")

            , [
              { label: "Base Fare", value: "₹20" },
              { label: "Distance (12.5 km @ ₹3.6/km)", value: "₹45" },
              { label: "Taxes & Fees", value: "₹0" },
            ].map((item, idx) => (
              React.createElement('div', {
                key: idx,
                className: "flex items-center justify-between text-sm"
              }

                , React.createElement('span', { className: "text-muted-foreground" }, item.label)
                , React.createElement('span', { className: "text-foreground" }, item.value)
              )
            ))

            , React.createElement('div', { className: "pt-4 border-t border-border flex items-center justify-between" }
              , React.createElement('span', { className: "font-semibold text-foreground" }, "Total Fare")
              , React.createElement('span', { className: "text-2xl font-bold text-primary" }, "₹"
                , _optionalChain([rideOptions, 'access', _ => _.find, 'call', _2 => _2((r) => r.id === selectedRide), 'optionalAccess', _3 => _3.price])
              )
            )
          )
        )

        /* Action Buttons */
        , React.createElement('div', { className: "flex gap-4" }
          , React.createElement(Button, {
            variant: "outline",
            className: "flex-1",
            onClick: () => navigate("/home")
          }

            , React.createElement(ChevronLeft, { className: "w-4 h-4 mr-2" }), "Back"

          )
          , React.createElement(Button, {
            disabled: !selectedRide,
            className: "flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all",
            onClick: handleContinue
          }
            , "Continue to Payment"

            , React.createElement(ArrowRight, { className: "w-4 h-4 ml-2" })
          )
        )
      )
    )
  );
}
