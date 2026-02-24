import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Notes() {
  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-background via-background to-orange-50 dark:to-orange-950"     }
      /* Navigation */
      , React.createElement('nav', { className: "border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50"      }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"      }
          , React.createElement(Link, { to: "/", className: "flex items-center gap-2 hover:opacity-80 transition"    }
            , React.createElement(ArrowLeft, { className: "w-5 h-5 text-primary"  } )
            , React.createElement('span', { className: "text-foreground"}, "Back to Home"  )
          )
          , React.createElement('h1', { className: "text-xl font-bold text-foreground"  }, "Notes Demo" )
          , React.createElement('div', { className: "w-20"})
        )
      )

      /* Main Content */
      , React.createElement('div', { className: "max-w-5xl mx-auto px-6 py-12 text-center space-y-6"     }
        , React.createElement('div', { className: "space-y-4"}
          , React.createElement('h2', { className: "text-4xl font-bold text-foreground"  }, "Notes App" )
          , React.createElement('p', { className: "text-xl text-muted-foreground" }, "This is a placeholder page. The main application is the Cab Booking System."

          )
        )

        , React.createElement(Link, { to: "/"}
          , React.createElement(Button, { className: "bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"    }, "Go to Cab Booking App"

          )
        )
      )
    )
  );
}
