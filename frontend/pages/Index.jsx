import React from "react";
 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Database,
  Zap,
  Globe,
  BarChart3,
  CheckCircle,
} from "lucide-react";

export default function Index() {
  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-background via-background to-blue-50 dark:to-blue-950"     }
      /* Navigation */
      , React.createElement('nav', { className: "border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50"      }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"      }
          , React.createElement('div', { className: "flex items-center gap-2"  }
            , React.createElement('div', { className: "w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"        }
              , React.createElement(Code2, { className: "w-6 h-6 text-primary-foreground"  } )
            )
            , React.createElement('span', { className: "font-bold text-xl text-foreground"  }, "MernHub")
          )
          , React.createElement('div', { className: "flex items-center gap-6"  }
            , React.createElement(Link, { to: "/", className: "text-foreground hover:text-primary transition"  }, "Home"

            )
            , React.createElement(Link, {
              to: "/notes",
              className: "text-foreground hover:text-primary transition"  }
, "Demo"

            )
            , React.createElement('a', {
              href: "https://www.mongodb.com",
              target: "_blank",
              rel: "noopener noreferrer" ,
              className: "text-foreground hover:text-primary transition"  }
, "Docs"

            )
          )
        )
      )

      /* Hero Section */
      , React.createElement('section', { className: "max-w-7xl mx-auto px-6 py-20 md:py-32"    }
        , React.createElement('div', { className: "grid md:grid-cols-2 gap-12 items-center"   }
          , React.createElement('div', { className: "space-y-8 animate-slide-up" }
            , React.createElement('div', { className: "space-y-4"}
              , React.createElement('h1', { className: "text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"        }, "Build with MERN"

              )
              , React.createElement('p', { className: "text-xl text-muted-foreground max-w-lg"  }, "A modern, production-ready full-stack JavaScript application framework. MongoDB, Express, React, and Node.js working together seamlessly."



              )
            )

            , React.createElement('div', { className: "flex flex-wrap gap-4"  }
              , React.createElement(Link, { to: "/notes"}
                , React.createElement(Button, {
                  size: "lg",
                  className: "bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"    }
, "Try Demo"

                )
              )
              , React.createElement(Button, {
                variant: "outline",
                size: "lg",
                onClick: () => {
                  _optionalChain([document
, 'access', _ => _.getElementById, 'call', _2 => _2("features")
, 'optionalAccess', _3 => _3.scrollIntoView, 'call', _4 => _4({ behavior: "smooth" })]);
                }}
, "Learn More"

              )
            )

            , React.createElement('div', { className: "flex items-center gap-8 pt-4"   }
              , React.createElement('div', {}
                , React.createElement('div', { className: "text-2xl font-bold text-primary"  }, "100%")
                , React.createElement('div', { className: "text-sm text-muted-foreground" }, "Type Safe" )
              )
              , React.createElement('div', {}
                , React.createElement('div', { className: "text-2xl font-bold text-accent"  }, "Full Stack" )
                , React.createElement('div', { className: "text-sm text-muted-foreground" }, "JavaScript")
              )
              , React.createElement('div', {}
                , React.createElement('div', { className: "text-2xl font-bold text-secondary"  }, "Open")
                , React.createElement('div', { className: "text-sm text-muted-foreground" }, "Source")
              )
            )
          )

          , React.createElement('div', { className: "hidden md:block relative h-96"   }
            , React.createElement('div', { className: "absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-xl border border-primary/10 overflow-hidden"         }
              , React.createElement('div', { className: "absolute inset-0 flex flex-col items-center justify-center gap-4 p-8"       }
                , React.createElement('div', { className: "text-4xl font-mono text-primary font-bold"   }, "const app = new MERN()"

                )
                , React.createElement('div', { className: "text-lg text-muted-foreground font-mono"  }, "app.build().deploy()"

                )
                , React.createElement('div', { className: "mt-4 flex gap-2"  }
                  , React.createElement('div', { className: "w-2 h-2 bg-primary rounded-full animate-bounce"    })
                  , React.createElement('div', { className: "w-2 h-2 bg-accent rounded-full animate-bounce delay-100"     })
                  , React.createElement('div', { className: "w-2 h-2 bg-secondary rounded-full animate-bounce delay-200"     })
                )
              )
            )
          )
        )
      )

      /* Features Section */
      , React.createElement('section', {
        id: "features",
        className: "max-w-7xl mx-auto px-6 py-20 md:py-32 scroll-mt-20"     }

        , React.createElement('div', { className: "text-center mb-16 space-y-4"  }
          , React.createElement('h2', { className: "text-4xl md:text-5xl font-bold text-foreground"   }, "Complete Tech Stack"

          )
          , React.createElement('p', { className: "text-xl text-muted-foreground max-w-2xl mx-auto"   }, "Everything you need to build modern, scalable web applications"

          )
        )

        , React.createElement('div', { className: "grid md:grid-cols-3 gap-8"  }
          /* MongoDB */
          , React.createElement('div', { className: "group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"        }
            , React.createElement('div', { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4"         }
              , React.createElement(Database, { className: "w-6 h-6 text-white"  } )
            )
            , React.createElement('h3', { className: "text-xl font-bold mb-2 text-foreground"   }, "MongoDB")
            , React.createElement('p', { className: "text-muted-foreground mb-4" }, "Flexible, document-based database with powerful querying and scalability built-in."


            )
            , React.createElement('ul', { className: "space-y-2"}
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-primary"  } ), "NoSQL Database"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-primary"  } ), "Flexible Schema"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-primary"  } ), "Scalable"

              )
            )
          )

          /* Express */
          , React.createElement('div', { className: "group p-8 rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all"        }
            , React.createElement('div', { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mb-4"         }
              , React.createElement(Zap, { className: "w-6 h-6 text-white"  } )
            )
            , React.createElement('h3', { className: "text-xl font-bold mb-2 text-foreground"   }, "Express")
            , React.createElement('p', { className: "text-muted-foreground mb-4" }, "Minimal and flexible Node.js web application framework with powerful routing and middleware."


            )
            , React.createElement('ul', { className: "space-y-2"}
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-accent"  } ), "RESTful APIs"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-accent"  } ), "Middleware Support"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-accent"  } ), "Easy Routing"

              )
            )
          )

          /* React */
          , React.createElement('div', { className: "group p-8 rounded-xl border border-border bg-card hover:border-secondary/50 hover:shadow-lg transition-all"        }
            , React.createElement('div', { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center mb-4"         }
              , React.createElement(Globe, { className: "w-6 h-6 text-white"  } )
            )
            , React.createElement('h3', { className: "text-xl font-bold mb-2 text-foreground"   }, "React")
            , React.createElement('p', { className: "text-muted-foreground mb-4" }, "Modern, component-based JavaScript library for building dynamic, interactive user interfaces."


            )
            , React.createElement('ul', { className: "space-y-2"}
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-secondary"  } ), "Component-Based"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-secondary"  } ), "React Hooks"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-secondary"  } ), "Fast Rendering"

              )
            )
          )

          /* Node.js */
          , React.createElement('div', { className: "group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"        }
            , React.createElement('div', { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-4"         }
              , React.createElement(Code2, { className: "w-6 h-6 text-white"  } )
            )
            , React.createElement('h3', { className: "text-xl font-bold mb-2 text-foreground"   }, "Node.js")
            , React.createElement('p', { className: "text-muted-foreground mb-4" }, "JavaScript runtime for building fast, scalable server-side applications with non-blocking I/O."


            )
            , React.createElement('ul', { className: "space-y-2"}
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-primary"  } ), "Async/Await"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-primary"  } ), "Event-Driven"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-primary"  } ), "NPM Ecosystem"

              )
            )
          )

          /* TypeScript */
          , React.createElement('div', { className: "group p-8 rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all"        }
            , React.createElement('div', { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4"         }
              , React.createElement(Code2, { className: "w-6 h-6 text-white"  } )
            )
            , React.createElement('h3', { className: "text-xl font-bold mb-2 text-foreground"   }, "TypeScript"

            )
            , React.createElement('p', { className: "text-muted-foreground mb-4" }, "Strongly typed JavaScript superset for safer, more maintainable code across your entire stack."


            )
            , React.createElement('ul', { className: "space-y-2"}
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-accent"  } ), "Type Safety"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-accent"  } ), "IntelliSense Support"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-accent"  } ), "Better Tooling"

              )
            )
          )

          /* Real-Time Features */
          , React.createElement('div', { className: "group p-8 rounded-xl border border-border bg-card hover:border-secondary/50 hover:shadow-lg transition-all"        }
            , React.createElement('div', { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4"         }
              , React.createElement(BarChart3, { className: "w-6 h-6 text-white"  } )
            )
            , React.createElement('h3', { className: "text-xl font-bold mb-2 text-foreground"   }, "Production Ready"

            )
            , React.createElement('p', { className: "text-muted-foreground mb-4" }, "Built with best practices including testing, error handling, and deployment optimization."


            )
            , React.createElement('ul', { className: "space-y-2"}
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-secondary"  } ), "Vitest Integration"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-secondary"  } ), "Error Handling"

              )
              , React.createElement('li', { className: "flex items-center gap-2 text-sm text-muted-foreground"    }
                , React.createElement(CheckCircle, { className: "w-4 h-4 text-secondary"  } ), "Optimized Build"

              )
            )
          )
        )
      )

      /* CTA Section */
      , React.createElement('section', { className: "max-w-7xl mx-auto px-6 py-20 md:py-32"    }
        , React.createElement('div', { className: "rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-12 md:p-16 text-center space-y-8"         }
          , React.createElement('div', { className: "space-y-4"}
            , React.createElement('h2', { className: "text-4xl md:text-5xl font-bold text-foreground"   }, "Ready to Build?"

            )
            , React.createElement('p', { className: "text-xl text-muted-foreground max-w-2xl mx-auto"   }, "Start building with the MERN stack today. Check out our demo application to see the full stack in action."


            )
          )

          , React.createElement('div', { className: "flex flex-wrap justify-center gap-4"   }
            , React.createElement(Link, { to: "/notes"}
              , React.createElement(Button, {
                size: "lg",
                className: "bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"    }
, "View Demo App"

              )
            )
            , React.createElement('a', {
              href: "https://github.com",
              target: "_blank",
              rel: "noopener noreferrer" }

              , React.createElement(Button, { variant: "outline", size: "lg"}, "View on GitHub"

              )
            )
          )
        )
      )

      /* Footer */
      , React.createElement('footer', { className: "border-t border-border bg-card/50 backdrop-blur-sm"   }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4"         }
          , React.createElement('div', { className: "flex items-center gap-2"  }
            , React.createElement('div', { className: "w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"        }
              , React.createElement(Code2, { className: "w-5 h-5 text-primary-foreground"  } )
            )
            , React.createElement('span', { className: "font-bold text-foreground" }, "MernHub")
          )
          , React.createElement('p', { className: "text-sm text-muted-foreground" }, "Built with MongoDB, Express, React, and Node.js"

          )
          , React.createElement('div', { className: "flex items-center gap-6"  }
            , React.createElement('a', {
              href: "https://www.mongodb.com",
              target: "_blank",
              rel: "noopener noreferrer" ,
              className: "text-sm text-muted-foreground hover:text-primary transition"   }
, "MongoDB"

            )
            , React.createElement('a', {
              href: "https://expressjs.com",
              target: "_blank",
              rel: "noopener noreferrer" ,
              className: "text-sm text-muted-foreground hover:text-primary transition"   }
, "Express"

            )
            , React.createElement('a', {
              href: "https://react.dev",
              target: "_blank",
              rel: "noopener noreferrer" ,
              className: "text-sm text-muted-foreground hover:text-primary transition"   }
, "React"

            )
            , React.createElement('a', {
              href: "https://nodejs.org",
              target: "_blank",
              rel: "noopener noreferrer" ,
              className: "text-sm text-muted-foreground hover:text-primary transition"   }
, "Node.js"

            )
          )
        )
      )
    )
  );
}
