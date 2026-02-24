import React from "react";
 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Smartphone,
  Wallet,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function Payment() {
  const navigate = useNavigate();
  const { currentRide } = useApp();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: React.createElement(CreditCard, { className: "w-6 h-6" } ),
      description: "Visa, Mastercard, RuPay",
    },
    {
      id: "upi",
      name: "UPI",
      icon: React.createElement(Smartphone, { className: "w-6 h-6" } ),
      description: "Google Pay, PhonePe, Paytm",
    },
    {
      id: "wallet",
      name: "Wallet",
      icon: React.createElement(Wallet, { className: "w-6 h-6" } ),
      description: "WeeFly Wallet Balance",
    },
  ];

  const handlePayment = async () => {
    if (!currentRide) {
      setError("No ride selected. Please go back.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Mock payment processing
      setTimeout(() => {
        setSuccess("Payment successful!");
        setTimeout(() => {
          navigate("/tracking");
        }, 1500);
      }, 2000);
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-background via-background to-orange-50 dark:to-orange-950 flex flex-col"       }
      /* Header */
      , React.createElement('div', { className: "border-b border-border bg-background/80 backdrop-blur-sm"   }
        , React.createElement('div', { className: "max-w-3xl mx-auto px-6 py-4 flex items-center justify-between"      }
          , React.createElement('button', {
            onClick: () => navigate("/otp-verification"),
            className: "flex items-center gap-2 hover:opacity-80 transition"    }

            , React.createElement(ChevronLeft, { className: "w-6 h-6 text-primary"  } )
            , React.createElement('span', { className: "font-semibold text-foreground" }, "Back")
          )
          , React.createElement('h1', { className: "text-xl font-bold text-foreground"  }, "Payment")
          , React.createElement('div', { className: "w-20"})
        )
      )

      /* Main Content */
      , React.createElement('div', { className: "max-w-3xl mx-auto px-6 py-8 flex-1"    }
        , React.createElement('div', { className: "space-y-8"}
          /* Order Summary */
          , React.createElement('div', { className: "rounded-xl border border-border bg-card p-6 space-y-4"     }
            , React.createElement('h2', { className: "text-lg font-bold text-foreground"  }, "Payment Summary"

            )

            , React.createElement('div', { className: "space-y-3 py-4 border-y border-border"   }
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('span', { className: "text-muted-foreground"}, "Ride Fare" )
                , React.createElement('span', { className: "font-semibold text-foreground" }, "₹"
                  , _optionalChain([currentRide, 'optionalAccess', _ => _.estimatedFare]) || 0
                )
              )
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('span', { className: "text-muted-foreground"}, "Taxes & Fees"  )
                , React.createElement('span', { className: "font-semibold text-foreground" }, "₹0")
              )
              , React.createElement('div', { className: "flex items-center justify-between"  }
                , React.createElement('span', { className: "text-muted-foreground"}, "Discount")
                , React.createElement('span', { className: "font-semibold text-green-600" }, "-₹0")
              )
            )

            , React.createElement('div', { className: "flex items-center justify-between pt-2"   }
              , React.createElement('span', { className: "font-bold text-foreground" }, "Total Amount" )
              , React.createElement('span', { className: "text-3xl font-bold text-primary"  }, "₹"
                , _optionalChain([currentRide, 'optionalAccess', _2 => _2.estimatedFare]) || 0
              )
            )
          )

          /* Payment Method Selection */
          , React.createElement('div', { className: "space-y-4"}
            , React.createElement('h2', { className: "text-lg font-bold text-foreground"  }, "Select Payment Method"

            )

            , React.createElement('div', { className: "space-y-3"}
              , paymentMethods.map((method) => (
                React.createElement('button', {
                  key: method.id,
                  onClick: () => setPaymentMethod(method.id),
                  className: `w-full rounded-lg border-2 p-4 transition-all flex items-start justify-between ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}

                  , React.createElement('div', { className: "flex items-start gap-4 text-left"   }
                    , React.createElement('div', {
                      className: `p-2 rounded-lg ${
                        paymentMethod === method.id
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}

                      , method.icon
                    )
                    , React.createElement('div', {}
                      , React.createElement('p', { className: "font-semibold text-foreground" }
                        , method.name
                      )
                      , React.createElement('p', { className: "text-xs text-muted-foreground" }
                        , method.description
                      )
                    )
                  )
                  , React.createElement('div', {
                    className: `w-5 h-5 rounded-full border-2 mt-1 ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
)
                )
              ))
            )
          )

          /* Payment Details */
          , paymentMethod === "card" && (
            React.createElement('div', { className: "rounded-xl border border-border bg-card p-6 space-y-4"     }
              , React.createElement('h3', { className: "font-bold text-foreground" }, "Card Details" )

              , React.createElement('div', {}
                , React.createElement('label', { className: "block text-sm font-medium text-foreground mb-2"    }, "Card Number"

                )
                , React.createElement('input', {
                  type: "text",
                  placeholder: "1234 5678 9012 3456"   ,
                  className: "w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"           }
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  }
                , React.createElement('div', {}
                  , React.createElement('label', { className: "block text-sm font-medium text-foreground mb-2"    }, "Expiry Date"

                  )
                  , React.createElement('input', {
                    type: "text",
                    placeholder: "MM/YY",
                    className: "w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"           }
                  )
                )
                , React.createElement('div', {}
                  , React.createElement('label', { className: "block text-sm font-medium text-foreground mb-2"    }, "CVV"

                  )
                  , React.createElement('input', {
                    type: "text",
                    placeholder: "123",
                    className: "w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"           }
                  )
                )
              )
            )
          )

          /* Error/Success Messages */
          , error && (
            React.createElement('div', { className: "rounded-lg bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3"       }
              , React.createElement(AlertCircle, { className: "w-5 h-5 text-destructive mt-0.5 flex-shrink-0"    } )
              , React.createElement('p', { className: "text-sm text-destructive" }, error)
            )
          )

          , success && (
            React.createElement('div', { className: "rounded-lg bg-green-500/10 border border-green-500/30 p-4 flex items-start gap-3"       }
              , React.createElement(CheckCircle, { className: "w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"    } )
              , React.createElement('p', { className: "text-sm text-green-600" }, success)
            )
          )

          /* Action Buttons */
          , React.createElement('div', { className: "flex gap-4" }
            , React.createElement(Button, {
              variant: "outline",
              className: "flex-1",
              onClick: () => navigate("/otp-verification")}

              , React.createElement(ChevronLeft, { className: "w-4 h-4 mr-2"  } ), "Back"

            )
            , React.createElement(Button, {
              disabled: loading,
              className: "flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"     ,
              onClick: handlePayment}

              , loading ? "Processing..." : "Pay Now"
            )
          )

          /* Test Card Info */
          , React.createElement('div', { className: "p-4 rounded-lg bg-accent/10 border border-accent/20"    }
            , React.createElement('p', { className: "text-xs text-muted-foreground mb-2 font-semibold"   }, "Test Card Details:"

            )
            , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Card: "
               , React.createElement('code', { className: "bg-black/20 px-1 rounded"  }, "4111111111111111")
            )
            , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Expiry: "
               , React.createElement('code', { className: "bg-black/20 px-1 rounded"  }, "12/25")
            )
            , React.createElement('p', { className: "text-xs text-muted-foreground" }, "CVV: "
               , React.createElement('code', { className: "bg-black/20 px-1 rounded"  }, "123")
            )
          )
        )
      )
    )
  );
}
