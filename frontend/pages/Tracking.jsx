import React from "react";
 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  MessageSquare,
  AlertTriangle,
  Star,
  Clock,
  Navigation,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function Tracking() {
  const navigate = useNavigate();
  const { currentRide } = useApp();
  const [rideStatus, setRideStatus] = useState("finding_driver");
  const [driverLocation, setDriverLocation] = useState({ lat: 13.0827, lng: 80.2707 });
  const [progress, setProgress] = useState(0);

  // Simulate status progression
  useEffect(() => {
    const statuses = [
      "finding_driver",
      "driver_found",
      "driver_arriving",
      "driver_arrived",
      "ride_in_progress",
      "ride_completed",
    ];
    const currentIndex = statuses.indexOf(rideStatus);

    const timer = setTimeout(() => {
      if (currentIndex < statuses.length - 1) {
        setRideStatus(statuses[currentIndex + 1]);
        setProgress(((currentIndex + 1) / (statuses.length - 1)) * 100);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [rideStatus]);

  const driverInfo = {
    id: "driver_1",
    name: "Rajesh Kumar",
    phone: "+91 9876543210",
    vehicle: "Hyundai i20",
    licensePlate: "TN05AB1234",
    rating: 4.8,
    currentLocation: driverLocation,
  };

  const statusMessages = {
    finding_driver: {
      title: "Finding Your Driver",
      subtitle: "Looking for nearby drivers...",
      icon: "🔍",
    },
    driver_found: {
      title: "Driver Found",
      subtitle: "Rajesh Kumar is heading your way",
      icon: "✓",
    },
    driver_arriving: {
      title: "Driver Arriving",
      subtitle: "ETA 2 minutes",
      icon: "📍",
    },
    driver_arrived: {
      title: "Driver Arrived",
      subtitle: "Your driver is here",
      icon: "🚗",
    },
    ride_in_progress: {
      title: "Ride in Progress",
      subtitle: "Your driver is taking you to your destination",
      icon: "🛣️",
    },
    ride_completed: {
      title: "Ride Completed",
      subtitle: "Thank you for riding with us",
      icon: "✅",
    },
  };

  const currentStatus = statusMessages[rideStatus ];

  const handleCompleteRide = () => {
    navigate("/home");
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-background" }
      /* Header */
      , React.createElement('div', { className: "border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40"      }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"      }
          , React.createElement('h1', { className: "text-xl font-bold text-foreground"  }, "Live Tracking" )
          , React.createElement('div', { className: "flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"      }
            , React.createElement('span', { className: "relative flex h-3 w-3"   }
              , React.createElement('span', { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"       })
              , React.createElement('span', { className: "relative inline-flex rounded-full h-3 w-3 bg-primary"     })
            )
            , React.createElement('span', { className: "text-sm font-medium text-foreground"  }, "Live")
          )
        )
      )

      /* Main Content */
      , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-8"   }
        , React.createElement('div', { className: "grid md:grid-cols-3 gap-8"  }
          /* Map Area */
          , React.createElement('div', { className: "md:col-span-2"}
            , React.createElement('div', { className: "w-full h-96 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden"            }
              , React.createElement('div', { className: "absolute inset-0 flex items-center justify-center"    }
                , React.createElement('div', { className: "text-center space-y-4" }
                  , React.createElement(Navigation, { className: "w-16 h-16 text-primary mx-auto opacity-50 animate-bounce"     } )
                  , React.createElement('div', { className: "text-lg font-bold text-foreground"  }
                    , currentStatus.title
                  )
                  , React.createElement('div', { className: "text-sm text-muted-foreground" }
                    , currentStatus.subtitle
                  )
                )
              )
            )

            /* Progress Bar */
            , React.createElement('div', { className: "mt-8 space-y-4" }
              , React.createElement('div', { className: "w-full bg-muted rounded-full h-2"   }
                , React.createElement('div', {
                  className: "bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"      ,
                  style: { width: `${progress}%` }}
)
              )

              /* Status Steps */
              , React.createElement('div', { className: "grid grid-cols-3 gap-4 text-center text-sm"    }
                , React.createElement('div', { className: "space-y-1"}
                  , React.createElement('p', { className: "font-semibold text-foreground" }, "Finding Driver" )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Starting")
                )
                , React.createElement('div', { className: "space-y-1"}
                  , React.createElement('p', { className: "font-semibold text-foreground" }, "On the Way"  )
                  , React.createElement('p', { className: "text-xs text-muted-foreground" }
                    , ["driver_arriving", "driver_arrived"].includes(rideStatus)
                      ? "Arriving..."
                      : "Waiting"
                  )
                )
                , React.createElement('div', { className: "space-y-1"}
                  , React.createElement('p', { className: "font-semibold text-foreground" }, "Destination")
                  , React.createElement('p', { className: "text-xs text-muted-foreground" }
                    , ["ride_in_progress", "ride_completed"].includes(rideStatus)
                      ? "Heading there..."
                      : "Waiting"
                  )
                )
              )
            )
          )

          /* Ride Details Panel */
          , React.createElement('div', { className: "space-y-6"}
            /* Driver Card */
            , ["driver_found", "driver_arriving", "driver_arrived", "ride_in_progress"].includes(
              rideStatus
            ) && (
              React.createElement('div', { className: "rounded-xl border border-border bg-card p-6 space-y-4"     }
                , React.createElement('h3', { className: "font-bold text-foreground" }, "Your Driver" )

                , React.createElement('div', { className: "flex items-center gap-4"  }
                  , React.createElement('img', {
                    src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${driverInfo.name}`,
                    alt: driverInfo.name,
                    className: "w-16 h-16 rounded-full border border-border"    }
                  )
                  , React.createElement('div', { className: "flex-1"}
                    , React.createElement('p', { className: "font-bold text-foreground" }, driverInfo.name)
                    , React.createElement('div', { className: "flex items-center gap-1 text-sm text-muted-foreground"    }
                      , React.createElement(Star, { className: "w-4 h-4 fill-yellow-400 text-yellow-400"   } )
                      , React.createElement('span', {}, driverInfo.rating)
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-2 py-4 border-y border-border text-sm"    }
                  , React.createElement('p', { className: "text-muted-foreground"}
                    , React.createElement('span', { className: "font-semibold text-foreground" }
                      , driverInfo.vehicle
                    ), " ", "("
                    , driverInfo.licensePlate, ")"
                  )
                  , React.createElement('p', { className: "text-muted-foreground"}, "ETA: "
                     , React.createElement('span', { className: "font-semibold text-foreground" }, "2 min" )
                  )
                )

                , React.createElement('div', { className: "flex gap-2" }
                  , React.createElement(Button, { variant: "outline", size: "sm", className: "flex-1"}
                    , React.createElement(Phone, { className: "w-4 h-4 mr-2"  } ), "Call"

                  )
                  , React.createElement(Button, { variant: "outline", size: "sm", className: "flex-1"}
                    , React.createElement(MessageSquare, { className: "w-4 h-4 mr-2"  } ), "Message"

                  )
                )
              )
            )

            /* Ride Summary */
            , React.createElement('div', { className: "rounded-xl border border-border bg-card p-6 space-y-4"     }
              , React.createElement('h3', { className: "font-bold text-foreground" }, "Ride Summary" )

              , React.createElement('div', { className: "space-y-4"}
                , React.createElement('div', { className: "flex items-start gap-4"  }
                  , React.createElement(MapPin, { className: "w-5 h-5 text-primary mt-1 flex-shrink-0"    } )
                  , React.createElement('div', { className: "text-sm"}
                    , React.createElement('p', { className: "text-xs font-semibold text-muted-foreground uppercase"   }, "From"

                    )
                    , React.createElement('p', { className: "text-foreground font-medium" }
                      , _optionalChain([currentRide, 'optionalAccess', _ => _.pickupLocation, 'access', _2 => _2.name])
                    )
                  )
                )

                , React.createElement('div', { className: "h-8 flex items-center justify-center mx-4"    }
                  , React.createElement('div', { className: "w-0.5 h-full bg-border"  })
                )

                , React.createElement('div', { className: "flex items-start gap-4"  }
                  , React.createElement(MapPin, { className: "w-5 h-5 text-accent mt-1 flex-shrink-0"    } )
                  , React.createElement('div', { className: "text-sm"}
                    , React.createElement('p', { className: "text-xs font-semibold text-muted-foreground uppercase"   }, "To"

                    )
                    , React.createElement('p', { className: "text-foreground font-medium" }
                      , _optionalChain([currentRide, 'optionalAccess', _3 => _3.dropoffLocation, 'access', _4 => _4.name])
                    )
                  )
                )
              )

              , React.createElement('div', { className: "pt-4 border-t border-border space-y-2 text-sm"    }
                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement('span', { className: "flex items-center gap-2 text-muted-foreground"   }
                    , React.createElement(Clock, { className: "w-4 h-4" } ), "Distance"

                  )
                  , React.createElement('span', { className: "font-semibold text-foreground" }
                    , _optionalChain([currentRide, 'optionalAccess', _5 => _5.distance]), " km"
                  )
                )
                , React.createElement('div', { className: "flex items-center justify-between"  }
                  , React.createElement('span', { className: "text-muted-foreground"}, "Ride Fare" )
                  , React.createElement('span', { className: "font-semibold text-foreground" }, "₹"
                    , _optionalChain([currentRide, 'optionalAccess', _6 => _6.estimatedFare])
                  )
                )
              )
            )

            /* Safety Info */
            , React.createElement('div', { className: "rounded-xl border border-border bg-card p-4 space-y-3"     }
              , React.createElement('div', { className: "flex items-start gap-3"  }
                , React.createElement(AlertTriangle, { className: "w-5 h-5 text-orange-500 flex-shrink-0 mt-1"    } )
                , React.createElement('div', { className: "text-sm"}
                  , React.createElement('p', { className: "font-semibold text-foreground mb-1"  }, "Safety Tips"

                  )
                  , React.createElement('ul', { className: "text-muted-foreground space-y-1 text-xs"  }
                    , React.createElement('li', {}, "• Share your ride details with a trusted contact"        )
                    , React.createElement('li', {}, "• Keep your belongings secure"    )
                    , React.createElement('li', {}, "• Rate your driver after the ride"      )
                  )
                )
              )
            )

            /* Action Button */
            , rideStatus === "ride_completed" && (
              React.createElement(Button, {
                onClick: handleCompleteRide,
                className: "w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"     }
, "Back to Home"

              )
            )
          )
        )
      )
    )
  );
}
