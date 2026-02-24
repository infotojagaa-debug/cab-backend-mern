import React from "react";
 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function OtpVerification() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next field
    if (value && index < 5) {
      const nextField = document.getElementById(`otp-${index + 1}`);
      _optionalChain([nextField, 'optionalAccess', _ => _.focus, 'call', _2 => _2()]);
    }
  };

  const handleBackspace = (index) => {
    if (index > 0 && !otp[index]) {
      const prevField = document.getElementById(`otp-${index - 1}`);
      _optionalChain([prevField, 'optionalAccess', _3 => _3.focus, 'call', _4 => _4()]);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Mock OTP verification
      if (otpValue === "123456") {
        setSuccess("OTP verified successfully!");
        setTimeout(() => {
          navigate("/payment");
        }, 1500);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setTimeLeft(120);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccess("");
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-background via-background to-orange-50 dark:to-orange-950 flex flex-col"       }
      /* Header */
      , React.createElement('div', { className: "border-b border-border bg-background/80 backdrop-blur-sm"   }
        , React.createElement('div', { className: "max-w-3xl mx-auto px-6 py-4 flex items-center justify-between"      }
          , React.createElement('button', {
            onClick: () => navigate("/ride-booking"),
            className: "flex items-center gap-2 hover:opacity-80 transition"    }

            , React.createElement(ChevronLeft, { className: "w-6 h-6 text-primary"  } )
            , React.createElement('span', { className: "font-semibold text-foreground" }, "Back")
          )
          , React.createElement('h1', { className: "text-xl font-bold text-foreground"  }, "Verify Your Ride"  )
          , React.createElement('div', { className: "w-20"})
        )
      )

      /* Main Content */
      , React.createElement('div', { className: "flex-1 flex items-center justify-center px-6 py-12"     }
        , React.createElement('div', { className: "w-full max-w-md" }
          , React.createElement('div', { className: "rounded-2xl border border-border bg-card p-8 space-y-6"     }
            , React.createElement('div', { className: "space-y-2 text-center" }
              , React.createElement('h2', { className: "text-3xl font-bold text-foreground"  }, "Verify OTP"

              )
              , React.createElement('p', { className: "text-muted-foreground"}, "We've sent a verification code to"

              )
              , React.createElement('p', { className: "font-semibold text-foreground" }, _optionalChain([user, 'optionalAccess', _5 => _5.phone]))
            )

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

            /* OTP Input */
            , React.createElement('div', { className: "space-y-4"}
              , React.createElement('p', { className: "text-sm text-muted-foreground text-center"  }, "Enter the 6-digit OTP"

              )

              , React.createElement('div', { className: "flex gap-2 justify-center"  }
                , otp.map((digit, index) => (
                  React.createElement('input', {
                    key: index,
                    id: `otp-${index}`,
                    type: "text",
                    maxLength: 1,
                    value: digit,
                    onChange: (e) => handleOtpChange(index, e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Backspace") {
                        handleBackspace(index);
                      }
                    },
                    disabled: loading,
                    className: "w-12 h-12 text-center text-lg font-bold rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition"             }
                  )
                ))
              )
            )

            /* Timer */
            , React.createElement('div', { className: "text-center"}
              , timeLeft > 0 ? (
                React.createElement('p', { className: "text-sm text-muted-foreground" }, "Resend OTP in"
                    , " "
                  , React.createElement('span', { className: "font-bold text-foreground" }
                    , Math.floor(timeLeft / 60), ":", (timeLeft % 60)
                      .toString()
                      .padStart(2, "0")
                  )
                )
              ) : (
                React.createElement('button', {
                  onClick: handleResendOtp,
                  className: "text-sm text-primary font-semibold hover:underline"   }
, "Resend OTP"

                )
              )
            )

            /* Demo OTP Info */
            , React.createElement('div', { className: "p-3 rounded-lg bg-accent/10 border border-accent/20"    }
              , React.createElement('p', { className: "text-xs text-muted-foreground mb-1 font-semibold"   }, "Demo OTP:"

              )
              , React.createElement('p', { className: "text-sm font-mono text-foreground"  }, "1 2 3 4 5 6"     )
            )

            , React.createElement(Button, {
              onClick: handleVerifyOtp,
              disabled: loading || otp.some((d) => !d),
              className: "w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"     }

              , loading ? "Verifying..." : "Verify & Proceed"
            )

            , React.createElement('p', { className: "text-center text-xs text-muted-foreground"  }, "This OTP is valid for 2 minutes"

            )
          )
        )
      )
    )
  );
}
