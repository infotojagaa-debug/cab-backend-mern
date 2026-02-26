import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Mail,
  MapPinIcon,
  ChevronRight,
  Star,
  Menu,
  X,
} from "lucide-react";
import RoleLogin from "@/components/RoleLogin";
import { useApp } from "../contexts/AppContext";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Travel securely with us!",
      subtitle: "Book your taxi from anywhere today!",
      description:
        "Experience the best ride-hailing service with professional drivers and affordable rates.",
      cta: "Book Your Ride",
    },
    {
      title: "Fast & Reliable Service",
      subtitle: "Get a ride in minutes!",
      description: "Track your driver in real-time and enjoy safe, comfortable travels.",
      cta: "Book Now",
    },
    {
      title: "24/7 Availability",
      subtitle: "Anytime, Anywhere!",
      description:
        "Our drivers are available round the clock to serve you at your convenience.",
      cta: "Start Journey",
    },
  ];

  const services = [
    {
      title: "Airport Transport",
      description: "Reliable airport pickup and drop-off service",
      price: "₹200+",
      icon: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "City Transport",
      description: "Quick city rides for your daily commute",
      price: "₹50+",
      icon: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Business Transport",
      description: "Premium rides for business professionals",
      price: "₹150+",
      icon: "https://images.unsplash.com/photo-1549421484-a42d3c7849cf?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Luggage Transport",
      description: "Transport with extra luggage space",
      price: "₹100+",
      icon: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Local Transport",
      description: "Local area rides with best rates",
      price: "₹40+",
      icon: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Regular Transport",
      description: "Regular commute options available",
      price: "₹60+",
      icon: "https://images.unsplash.com/photo-1554672408-730436b60dde?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Business Professional",
      content:
        "WeeFly Cabs is my go-to app for all my commuting needs. The drivers are professional and the app is very easy to use.",
      rating: 5,
      avatar: "RK",
    },
    {
      name: "Priya Sharma",
      role: "Daily Commuter",
      content:
        "I love the real-time tracking feature. It's so safe and reliable. Highly recommended for everyone!",
      rating: 5,
      avatar: "PS",
    },
    {
      name: "Anil Gupta",
      role: "Frequent Traveler",
      content:
        "The best cab service in town. Affordable prices and punctual drivers. Great work WeeFly!",
      rating: 5,
      avatar: "AG",
    },
  ];

  const blogs = [
    {
      title: "Safety First: Our Commitment to Secure Travel",
      category: "Safety",
      date: "Jan 15, 2024",
      excerpt: "Learn about the safety measures we've implemented for your peace of mind...",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "The Future of Urban Mobility",
      category: "Tech",
      date: "Feb 05, 2024",
      excerpt: "Exploring how technology is changing the way we travel in cities...",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "WeeFly Cabs Launches New Features",
      category: "News",
      date: "Jan 10, 2024",
      excerpt: "We are excited to announce exciting new features for better experience...",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-gray-950" }
      /* Top Bar */
      , React.createElement('div', { className: "bg-gray-900 border-b border-white/5 text-gray-300 py-2 text-sm" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 flex justify-between items-center" }
          , React.createElement('span', { className: "text-amber-400/80 font-medium" }, "🚕 WeeFly Cabs — Your Trusted Ride Partner!")
          , React.createElement('div', { className: "hidden md:flex gap-6" }
            , React.createElement('button', { onClick: () => alert("Help Center: Contact our support team for assistance"), className: "text-gray-400 hover:text-amber-400 transition-colors" }, "Help Center")
            , React.createElement('button', { onClick: () => alert("Support: Available 24/7 at +91 98765 43210"), className: "text-gray-400 hover:text-amber-400 transition-colors" }, "Support")
            , React.createElement('button', { onClick: () => alert("FAQ: Check our website or call support for frequently asked questions"), className: "text-gray-400 hover:text-amber-400 transition-colors" }, "FAQ")
          )
        )
      )

      /* Header with Contact Info */
      , React.createElement('div', { className: "bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border-b border-white/8" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-5" }
          , React.createElement('div', { className: "grid md:grid-cols-4 gap-6 items-center" }

            /* Classic WeeFly Logo */
            , React.createElement('div', { className: "col-span-1" }
              , React.createElement(Link, { to: "/", className: "flex items-center gap-3 group" }

                /* SVG Logo Mark */
                , React.createElement('div', { className: "relative flex-shrink-0" }
                  , React.createElement('svg', {
                    width: "52", height: "52", viewBox: "0 0 52 52",
                    xmlns: "http://www.w3.org/2000/svg"
                  }
                    /* Outer circle */
                    , React.createElement('circle', { cx: "26", cy: "26", r: "25", fill: "#f59e0b", stroke: "#d97706", strokeWidth: "1.5" })
                    /* Taxi top / cab shape */
                    , React.createElement('rect', { x: "14", y: "22", width: "24", height: "13", rx: "3", fill: "#1f2937" })
                    /* Cab roof */
                    , React.createElement('path', { d: "M18 22 L21 16 L31 16 L34 22 Z", fill: "#1f2937" })
                    /* Windshield */
                    , React.createElement('path', { d: "M20 22 L22.5 17.5 L29.5 17.5 L32 22 Z", fill: "#60a5fa", opacity: "0.9" })
                    /* Left wheel */
                    , React.createElement('circle', { cx: "19", cy: "35", r: "4", fill: "#111827", stroke: "#f59e0b", strokeWidth: "1.5" })
                    , React.createElement('circle', { cx: "19", cy: "35", r: "1.5", fill: "#f59e0b" })
                    /* Right wheel */
                    , React.createElement('circle', { cx: "33", cy: "35", r: "4", fill: "#111827", stroke: "#f59e0b", strokeWidth: "1.5" })
                    , React.createElement('circle', { cx: "33", cy: "35", r: "1.5", fill: "#f59e0b" })
                    /* Taxi light on roof */
                    , React.createElement('rect', { x: "22", y: "13", width: "8", height: "3.5", rx: "1", fill: "#f59e0b" })
                    /* W letter */
                    , React.createElement('text', { x: "26", y: "31", textAnchor: "middle", fontSize: "8", fontWeight: "900", fontFamily: "Arial,sans-serif", fill: "white", letterSpacing: "0.5" }, "TAXI")
                  )
                )

                /* Wordmark */
                , React.createElement('div', { className: "flex flex-col" }
                  , React.createElement('span', { className: "text-2xl font-black tracking-tight leading-none" }
                    , React.createElement('span', { className: "text-white" }, "Wee")
                    , React.createElement('span', { className: "text-amber-400" }, "Fly")
                  )
                  , React.createElement('span', { className: "text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase" }, "Cabs")
                )
              )
            )

            /* Contact Info */
            , React.createElement('div', { className: "col-span-3 grid md:grid-cols-3 gap-4" }
              , React.createElement('button', { onClick: () => window.location.href = "tel:+919876543210", className: "flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all" }
                , React.createElement('div', { className: "w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/25 transition-colors" }
                  , React.createElement(Phone, { className: "w-4 h-4 text-amber-400" })
                )
                , React.createElement('div', { className: "text-left" }
                  , React.createElement('p', { className: "text-[10px] text-gray-500 font-bold uppercase tracking-widest" }, "CALL US NOW")
                  , React.createElement('p', { className: "text-white font-semibold text-sm" }, "+91 98765 43210")
                )
              )
              , React.createElement('button', { onClick: () => window.location.href = "mailto:support@weeflycabs.com", className: "flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all" }
                , React.createElement('div', { className: "w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/25 transition-colors" }
                  , React.createElement(Mail, { className: "w-4 h-4 text-amber-400" })
                )
                , React.createElement('div', { className: "text-left" }
                  , React.createElement('p', { className: "text-[10px] text-gray-500 font-bold uppercase tracking-widest" }, "EMAIL NOW")
                  , React.createElement('p', { className: "text-white font-semibold text-sm" }, "support@weeflycabs.com")
                )
              )
              , React.createElement('button', { onClick: () => alert("WeeFly Cabs - Chennai, Tamil Nadu"), className: "flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all" }
                , React.createElement('div', { className: "w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/25 transition-colors" }
                  , React.createElement(MapPinIcon, { className: "w-4 h-4 text-amber-400" })
                )
                , React.createElement('div', { className: "text-left" }
                  , React.createElement('p', { className: "text-[10px] text-gray-500 font-bold uppercase tracking-widest" }, "VISIT US")
                  , React.createElement('p', { className: "text-white font-semibold text-sm" }, "Chennai, TN")
                )
              )
            )
          )
        )
      )

      /* Navigation Bar */
      , React.createElement('nav', { className: "bg-gray-950 text-white sticky top-0 z-40 border-b border-amber-500/30 shadow-lg shadow-black/30" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-4 flex justify-between items-center" }
          , React.createElement('div', { className: "hidden md:flex items-center gap-8" }
            , React.createElement('button', {
              onClick: () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileMenuOpen(false);
              },
              className: "hover:text-amber-400 transition-colors font-semibold text-white/85 hover:text-amber-400 tracking-wide"
            }
              , "Home"

            )
            , React.createElement('button', {
              onClick: () => {
                const element = document.getElementById("about");
                _optionalChain([element, 'optionalAccess', _2 => _2.scrollIntoView, 'call', _3 => _3({ behavior: "smooth" })]);
                setMobileMenuOpen(false);
              },
              className: "hover:text-amber-400 transition-colors font-semibold text-white/85 hover:text-amber-400 tracking-wide"
            }
              , "About"

            )
            , React.createElement('button', {
              onClick: () => {
                const element = document.getElementById("services");
                _optionalChain([element, 'optionalAccess', _4 => _4.scrollIntoView, 'call', _5 => _5({ behavior: "smooth" })]);
                setMobileMenuOpen(false);
              },
              className: "hover:text-amber-400 transition-colors font-semibold text-white/85 hover:text-amber-400 tracking-wide"
            }
              , "Services"

            )
            , React.createElement('button', {
              onClick: () => {
                const element = document.getElementById("blog");
                _optionalChain([element, 'optionalAccess', _6 => _6.scrollIntoView, 'call', _7 => _7({ behavior: "smooth" })]);
                setMobileMenuOpen(false);
              },
              className: "hover:text-amber-400 transition-colors font-semibold text-white/85 hover:text-amber-400 tracking-wide"
            }
              , "Blog"

            )
            , React.createElement('button', {
              onClick: () => {
                const element = document.getElementById("contact");
                _optionalChain([element, 'optionalAccess', _8 => _8.scrollIntoView, 'call', _9 => _9({ behavior: "smooth" })]);
                setMobileMenuOpen(false);
              },
              className: "hover:text-amber-400 transition-colors font-semibold text-white/85 hover:text-amber-400 tracking-wide"
            }
              , "Contact"

            )
          )

          , React.createElement(Link, { to: isAuthenticated ? "/home" : "/register" }
            , React.createElement(Button, { className: "bg-amber-500 hover:bg-amber-400 text-gray-950 font-black tracking-wide shadow-lg shadow-amber-500/30 transition-all" }, "Book a Taxi"
            )
          )

          , React.createElement('button', {
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            className: "md:hidden text-white"
          }

            , mobileMenuOpen ? React.createElement(X, {}) : React.createElement(Menu, {})
          )
        )

        /* Mobile Menu */
        , mobileMenuOpen && (
          React.createElement('div', { className: "md:hidden bg-gray-950/98 border-t border-amber-500/30 py-4" }
            , React.createElement('div', { className: "max-w-7xl mx-auto px-6 space-y-4" }
              , React.createElement('button', {
                onClick: () => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileMenuOpen(false);
                },
                className: "block w-full text-left text-white/80 hover:text-amber-400 transition-colors font-semibold tracking-wide"
              }
                , "Home"

              )
              , React.createElement('button', {
                onClick: () => {
                  const element = document.getElementById("about");
                  _optionalChain([element, 'optionalAccess', _10 => _10.scrollIntoView, 'call', _11 => _11({ behavior: "smooth" })]);
                  setMobileMenuOpen(false);
                },
                className: "block w-full text-left text-white/80 hover:text-amber-400 transition-colors font-semibold tracking-wide"
              }
                , "About"

              )
              , React.createElement('button', {
                onClick: () => {
                  const element = document.getElementById("services");
                  _optionalChain([element, 'optionalAccess', _12 => _12.scrollIntoView, 'call', _13 => _13({ behavior: "smooth" })]);
                  setMobileMenuOpen(false);
                },
                className: "block w-full text-left text-white/80 hover:text-amber-400 transition-colors font-semibold tracking-wide"
              }
                , "Services"

              )
              , React.createElement('button', {
                onClick: () => {
                  const element = document.getElementById("blog");
                  _optionalChain([element, 'optionalAccess', _14 => _14.scrollIntoView, 'call', _15 => _15({ behavior: "smooth" })]);
                  setMobileMenuOpen(false);
                },
                className: "block w-full text-left text-white/80 hover:text-amber-400 transition-colors font-semibold tracking-wide"
              }
                , "Blog"

              )
              , React.createElement('button', {
                onClick: () => {
                  const element = document.getElementById("contact");
                  _optionalChain([element, 'optionalAccess', _16 => _16.scrollIntoView, 'call', _17 => _17({ behavior: "smooth" })]);
                  setMobileMenuOpen(false);
                },
                className: "block w-full text-left text-white/80 hover:text-amber-400 transition-colors font-semibold tracking-wide"
              }
                , "Contact"

              )
            )
          )
        )
      )

      /* Hero Section */
      , React.createElement('div', { className: "relative bg-secondary overflow-hidden min-h-[700px] md:h-[600px] flex flex-col justify-center" }
        /* Background Slider */
        , React.createElement('div', { className: "absolute inset-0" }
          , React.createElement('div', { className: "absolute inset-0 bg-black/60 z-10" })
          , React.createElement('div', {
            className: "absolute inset-0 bg-cover bg-center transition-all duration-1000",
            style: { backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2070')` }
          })
        )

        , React.createElement('div', { className: "relative z-20 max-w-7xl mx-auto px-6 py-12 md:py-0 h-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center" }
          , React.createElement('div', { className: "text-white animate-fade-in-left text-center md:text-left" }
            , React.createElement('div', { className: "inline-block bg-primary text-secondary px-4 py-1 rounded font-bold text-sm mb-6" }
              , slides[currentSlide].subtitle
            )
            , React.createElement('h1', { className: "text-4xl md:text-7xl font-bold mb-6 leading-tight" }
              , slides[currentSlide].title
            )
            , React.createElement('p', { className: "text-base md:text-lg text-white/80 mb-8 max-w-lg leading-relaxed" }
              , slides[currentSlide].description
            )
            , React.createElement('div', { className: "flex gap-4" }
              , React.createElement(Button, {
                onClick: () => isAuthenticated ? navigate("/home") : navigate("/register"),
                className: "bg-primary hover:bg-primary/90 text-secondary px-8 h-14 text-lg font-bold rounded-lg shadow-lg"
              }
                , slides[currentSlide].cta
              )
              , React.createElement(Button, {
                onClick: () => {
                  const element = document.getElementById("contact");
                  element && element.scrollIntoView({ behavior: "smooth" });
                },
                className: "border-2 border-primary bg-white/10 text-white hover:bg-primary hover:text-secondary hover:border-primary px-8 h-14 text-lg font-bold rounded-lg backdrop-blur-sm transition-all duration-300"
              }, "Contact Us")
            )
          )

          /* Role Selection Unit */
          , React.createElement('div', { className: "flex justify-center md:justify-end animate-fade-in-right mt-8 md:mt-0 pb-20 md:pb-0" }
            , React.createElement(RoleLogin, {})
          )
        )

        /* Slider Arrow - Prev */
        , React.createElement('button', {
          onClick: prevSlide,
          "aria-label": "Previous slide",
          className: "absolute bottom-6 right-24 z-30 w-10 h-10 bg-black/50 hover:bg-primary border border-white/30 hover:border-primary text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        }
          , React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5 }
            , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" })
          )
        )

        /* Slider Arrow - Next */
        , React.createElement('button', {
          onClick: nextSlide,
          "aria-label": "Next slide",
          className: "absolute bottom-6 right-12 z-30 w-10 h-10 bg-black/50 hover:bg-primary border border-white/30 hover:border-primary text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        }
          , React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5 }
            , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" })
          )
        )

        /* Slide Dot Indicators */
        , React.createElement('div', { className: "absolute bottom-8 left-6 z-30 flex gap-2" }
          , slides.map((_, i) =>
            React.createElement('button', {
              key: i,
              onClick: () => setCurrentSlide(i),
              className: `h-1 rounded-full transition-all duration-300 ${currentSlide === i ? "w-12 bg-primary" : "w-6 bg-white/30 hover:bg-white/50"}`
            })
          )
        )
      )

      /* Features Stats */
      , React.createElement('div', { className: "bg-gray-900 py-16 border-b border-white/5" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6" }
          , React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-12" }
            , [
              { label: "Satisfied Clients", value: "2500+", color: "text-amber-500" },
              { label: "Active Drivers", value: "450+", color: "text-amber-500" },
              { label: "Years Experience", value: "12+", color: "text-amber-500" },
              { label: "Cities Covered", value: "25+", color: "text-amber-500" }
            ].map((stat, i) => (
              React.createElement('div', { key: i, className: "text-center group" }
                , React.createElement('p', { className: `text-4xl md:text-5xl font-black ${stat.color} mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300` }, stat.value)
                , React.createElement('p', { className: "text-xs font-black text-gray-500 uppercase tracking-[0.2em]" }, stat.label)
              )
            ))
          )
        )
      )

      /* ══════════════════════════════════════════
         SERVICES SECTION — Classic Premium Layout
         ══════════════════════════════════════════ */
      , React.createElement('div', { id: "services", className: "relative overflow-hidden" }

        /* ── Section Header Band ── */
        , React.createElement('div', { className: "bg-gray-950 py-20" }
          , React.createElement('div', { className: "max-w-7xl mx-auto px-6" }
            , React.createElement('div', { className: "flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4" }
              , React.createElement('div', {}
                , React.createElement('span', { className: "inline-flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-[0.35em] mb-4" }
                  , React.createElement('span', { className: "w-8 h-px bg-amber-400" })
                  , "Our Services"
                  , React.createElement('span', { className: "w-8 h-px bg-amber-400" })
                )
                , React.createElement('h2', { className: "text-4xl md:text-5xl font-black text-white leading-tight" }
                  , "A Service for "
                  , React.createElement('span', { className: "text-amber-400 italic" }, "Every Need")
                )
              )
              , React.createElement('p', { className: "text-gray-400 max-w-md text-sm leading-relaxed border-l-2 border-amber-500/40 pl-4" }
                , "From daily commutes to airport transfers — we have the perfect ride for every occasion and budget."
              )
            )

            /* ── Horizontal rule with decorative diamond ── */
            , React.createElement('div', { className: "relative flex items-center gap-4 mt-8" }
              , React.createElement('div', { className: "flex-1 h-px bg-gradient-to-r from-amber-500/60 to-transparent" })
              , React.createElement('div', { className: "w-2 h-2 rotate-45 bg-amber-400" })
              , React.createElement('div', { className: "flex-1 h-px bg-gradient-to-l from-amber-500/60 to-transparent" })
            )
          )
        )

        /* ── Service Cards Grid ── */
        , React.createElement('div', { className: "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20" }
          , React.createElement('div', { className: "max-w-7xl mx-auto px-6" }

            , React.createElement('div', { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6" }
              , services.map((service, i) => {
                const cardThemes = [
                  /* 1 – warm amber-orange */
                  { bg: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100", border: "border-amber-200", num: "text-amber-200", titleHover: "group-hover:text-amber-700", iconBg: "bg-amber-100 border-amber-300 group-hover:bg-amber-500 group-hover:border-amber-600", divider: "bg-amber-100 group-hover:bg-amber-200", badge: "bg-amber-600/10 border-amber-500/30 text-amber-700", top: "from-amber-400 to-orange-400", desc: "text-amber-900/60", cta: "text-amber-700" },
                  /* 2 – teal-sky */
                  { bg: "bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100", border: "border-teal-200", num: "text-teal-200", titleHover: "group-hover:text-teal-700", iconBg: "bg-teal-100 border-teal-300 group-hover:bg-teal-500 group-hover:border-teal-600", divider: "bg-teal-100 group-hover:bg-teal-200", badge: "bg-teal-600/10 border-teal-500/30 text-teal-700", top: "from-teal-400 to-cyan-400", desc: "text-teal-900/60", cta: "text-teal-700" },
                  /* 3 – violet-purple */
                  { bg: "bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100", border: "border-violet-200", num: "text-violet-200", titleHover: "group-hover:text-violet-700", iconBg: "bg-violet-100 border-violet-300 group-hover:bg-violet-500 group-hover:border-violet-600", divider: "bg-violet-100 group-hover:bg-violet-200", badge: "bg-violet-600/10 border-violet-500/30 text-violet-700", top: "from-violet-400 to-purple-400", desc: "text-violet-900/60", cta: "text-violet-700" },
                  /* 4 – rose-pink */
                  { bg: "bg-gradient-to-br from-rose-50 via-pink-50 to-red-100", border: "border-rose-200", num: "text-rose-200", titleHover: "group-hover:text-rose-700", iconBg: "bg-rose-100 border-rose-300 group-hover:bg-rose-500 group-hover:border-rose-600", divider: "bg-rose-100 group-hover:bg-rose-200", badge: "bg-rose-600/10 border-rose-500/30 text-rose-700", top: "from-rose-400 to-pink-400", desc: "text-rose-900/60", cta: "text-rose-700" },
                  /* 5 – indigo-blue */
                  { bg: "bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-100", border: "border-indigo-200", num: "text-indigo-200", titleHover: "group-hover:text-indigo-700", iconBg: "bg-indigo-100 border-indigo-300 group-hover:bg-indigo-500 group-hover:border-indigo-600", divider: "bg-indigo-100 group-hover:bg-indigo-200", badge: "bg-indigo-600/10 border-indigo-500/30 text-indigo-700", top: "from-indigo-400 to-blue-400", desc: "text-indigo-900/60", cta: "text-indigo-700" },
                  /* 6 – emerald-green */
                  { bg: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100", border: "border-emerald-200", num: "text-emerald-200", titleHover: "group-hover:text-emerald-700", iconBg: "bg-emerald-100 border-emerald-300 group-hover:bg-emerald-500 group-hover:border-emerald-600", divider: "bg-emerald-100 group-hover:bg-emerald-200", badge: "bg-emerald-600/10 border-emerald-500/30 text-emerald-700", top: "from-emerald-400 to-green-400", desc: "text-emerald-900/60", cta: "text-emerald-700" },
                ];
                const t = cardThemes[i % cardThemes.length];
                return React.createElement('div', {
                  key: i,
                  className: `group relative ${t.bg} border ${t.border} rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 cursor-pointer`
                }
                  /* Top accent line — sweeps in on hover */
                  , React.createElement('div', { className: `absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.top} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left` })

                  /* Card number watermark */
                  , React.createElement('div', { className: `absolute top-4 right-5 text-6xl font-black ${t.num} select-none leading-none transition-colors` }
                    , String(i + 1).padStart(2, "0")
                  )

                  , React.createElement('div', { className: "p-8" }

                    /* Icon box */
                    , React.createElement('div', { className: "relative w-16 h-16 mb-6" }
                      , React.createElement('div', { className: `absolute inset-0 rounded-2xl border ${t.iconBg} transition-all duration-300 overflow-hidden` }
                        , service.icon.startsWith("http") && React.createElement('img', { src: service.icon, className: "w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" })
                      )
                      , React.createElement('div', { className: "relative w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300" }
                        , !service.icon.startsWith("http") && service.icon
                      )
                    )

                    /* Title + price */
                    , React.createElement('div', { className: "flex items-start justify-between mb-3" }
                      , React.createElement('h3', { className: `text-xl font-black text-gray-900 leading-tight ${t.titleHover} transition-colors` }
                        , service.title
                      )
                      , React.createElement('div', { className: `flex-shrink-0 ml-3 ${t.badge} border rounded-lg px-3 py-1 font-black text-sm` }
                        , service.price
                      )
                    )

                    /* Description */
                    , React.createElement('p', { className: `${t.desc} text-sm leading-relaxed mb-6` }
                      , service.description
                    )

                    /* Divider */
                    , React.createElement('div', { className: `h-px ${t.divider} mb-5 transition-colors` })

                    /* CTA row */
                    , React.createElement('div', { className: "flex items-center justify-between" }
                      , React.createElement('button', {
                        onClick: () => navigate("/register"),
                        className: `flex items-center gap-2 ${t.cta} font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all`
                      }
                        , "Book Now"
                        , React.createElement(ChevronRight, { className: "w-4 h-4" })
                      )
                      , React.createElement('span', { className: "text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1" }
                        , React.createElement('span', { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" })
                        , "Available 24/7"
                      )
                    )
                  )
                )
              })
            )
          )
        )

        /* ── Feature Highlights Strip ── */
        , React.createElement('div', { className: "bg-amber-500 py-10" }
          , React.createElement('div', { className: "max-w-7xl mx-auto px-6" }
            , React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-6" }
              , [
                { icon: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a082d?auto=format&fit=crop&q=80&w=300", title: "Verified Drivers", desc: "Background-checked professionals" },
                { icon: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=300", title: "Live Tracking", desc: "Real-time GPS for every trip" },
                { icon: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=300", title: "Easy Payments", desc: "UPI, card & cash accepted" },
                { icon: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=300", title: "Instant Pickup", desc: "Driver arrives in minutes" }
              ].map((feat, i) =>
                React.createElement('div', { key: i, className: "flex items-start gap-4 group" }
                  , React.createElement('div', { className: "w-11 h-11 rounded-xl bg-black/15 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-black/25 transition-colors overflow-hidden" }
                    , feat.icon.startsWith("http") ? React.createElement('img', { src: feat.icon, className: "w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" }) : feat.icon
                  )
                  , React.createElement('div', {}
                    , React.createElement('p', { className: "text-gray-900 font-black text-sm leading-tight" }, feat.title)
                    , React.createElement('p', { className: "text-black/60 text-xs mt-0.5" }, feat.desc)
                  )
                )
              )
            )
          )
        )

        /* ── Full-Width CTA Banner ── */
        , React.createElement('div', { className: "bg-gray-950 py-14" }
          , React.createElement('div', { className: "max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8" }
            , React.createElement('div', {}
              , React.createElement('p', { className: "text-gray-400 text-xs uppercase tracking-widest mb-1" }, "Ready to ride?")
              , React.createElement('h3', { className: "text-3xl font-black text-white" }
                , "Book your first trip "
                , React.createElement('span', { className: "text-amber-400" }, "in seconds")
              )
            )
            , React.createElement('button', {
              onClick: () => navigate("/register"),
              className: "flex-shrink-0 flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-amber-500/30"
            }
              , "Get Started"
              , React.createElement(ChevronRight, { className: "w-5 h-5" })
            )
          )
        )
      )


      /* About Section with Tabs/Images */
      , React.createElement('div', { id: "about", className: "bg-gray-950 py-24 relative overflow-hidden" }
        /* Decorative Background elements */
        , React.createElement('div', { className: "absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" })

        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 relative z-10" }
          , React.createElement('div', { className: "grid md:grid-cols-2 gap-20 items-center" }
            , React.createElement('div', { className: "relative group" }
              /* Premium Gradient Border */
              , React.createElement('div', { className: "absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-orange-500/0 to-amber-500/20 rounded-[3.5rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" })
              , React.createElement('div', { className: "relative aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-white/10" }
                , React.createElement('img', { src: "/weefly-taxi.jpg", className: "w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" })
              )
              , React.createElement('div', { className: "absolute -bottom-8 -right-8 bg-gray-900/90 backdrop-blur-xl border border-amber-500/30 rounded-[2rem] p-8 shadow-2xl max-w-[200px] hidden md:block" }
                , React.createElement('p', { className: "text-amber-500 font-black text-5xl mb-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" }, "12+")
                , React.createElement('p', { className: "text-gray-400 text-xs font-black uppercase tracking-widest leading-tight" }, "YEARS OF EXCELLENCE SERVICE")
                /* Animated pulse dot */
                , React.createElement('div', { className: "absolute top-4 right-4" }
                  , React.createElement('span', { className: "relative flex h-2 w-2" }
                    , React.createElement('span', { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" })
                    , React.createElement('span', { className: "relative inline-flex rounded-full h-2 w-2 bg-amber-500" })
                  )
                )
              )
            )
            , React.createElement('div', { className: "space-y-10" }
              , React.createElement('div', {}
                , React.createElement('span', { className: "inline-flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-[0.35em] mb-4" }
                  , React.createElement('span', { className: "w-8 h-px bg-amber-400" })
                  , "HOW IT WORKS"
                )
                , React.createElement('h2', { className: "text-4xl md:text-5xl font-black text-white leading-tight" }
                  , "Simple Booking in "
                  , React.createElement('span', { className: "text-amber-400 italic" }, "3 Steps")
                )
              )
              , React.createElement('div', { className: "space-y-4" }
                , [
                  { title: "Choose Your Location", desc: "Select where you are and where you want to go on our easy-to-use map interface.", icon: "📍" },
                  { title: "Select Driver & Cab", desc: "Pick from multiple available drivers and cab types that fit your needs and budget.", icon: "🚕" },
                  { title: "Track & Arrive Safely", desc: "Track your driver in real-time and enjoy a safe journey to your destination.", icon: "🗺️" }
                ].map((step, i) => (
                  React.createElement('div', { key: i, className: "group flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/20 transition-all duration-300 backdrop-blur-sm" }
                    , React.createElement('div', { className: "w-14 h-14 bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all duration-300" }, step.icon)
                    , React.createElement('div', {}
                      , React.createElement('h3', { className: "text-xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors" }, step.title)
                      , React.createElement('p', { className: "text-sm text-gray-400 leading-relaxed font-medium" }, step.desc)
                    )
                  )
                ))
              )
              , React.createElement('button', {
                onClick: () => navigate("/register"),
                className: "bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-12 h-16 rounded-full text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-amber-500/20 flex items-center gap-3"
              }
                , "Read More About Us"
                , React.createElement(ChevronRight, { className: "w-5 h-5 font-black" })
              )
            )
          )
        )
      )

      /* Testimonials with Carousels */
      , React.createElement('div', { className: "bg-gray-900 py-24 overflow-hidden relative" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 relative z-10" }
          , React.createElement('div', { className: "text-center mb-16" }
            , React.createElement('span', { className: "inline-flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-[0.35em] mb-4" }
              , React.createElement('span', { className: "w-8 h-px bg-amber-400" })
              , "TESTIMONIALS"
              , React.createElement('span', { className: "w-8 h-px bg-amber-400" })
            )
            , React.createElement('h2', { className: "text-4xl md:text-5xl font-black text-white mb-6" }
              , "What Our "
              , React.createElement('span', { className: "text-amber-400 italic" }, "Clients Say")
            )
          )

          , React.createElement('div', { className: "grid md:grid-cols-3 gap-8" }
            , testimonials.map((t, i) => (
              React.createElement('div', { key: i, className: "group bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/30 transition-all duration-500 relative shadow-2xl" }
                /* Glow effect on hover */
                , React.createElement('div', { className: "absolute -inset-1 bg-gradient-to-tr from-amber-500/20 to-orange-500/0 rounded-[3.1rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" })

                , React.createElement('div', { className: "flex gap-1 mb-6" }
                  , Array.from({ length: t.rating }).map((_, idx) => (
                    React.createElement(Star, { key: idx, className: "w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" })
                  ))
                )
                , React.createElement('p', { className: "text-gray-300 leading-relaxed italic mb-8 group-hover:text-white transition-colors" }, `"${t.content}"`)
                , React.createElement('div', { className: "flex items-center gap-4 border-t border-white/5 pt-6" }
                  , React.createElement('div', { className: "w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center font-black text-amber-400 group-hover:bg-amber-500 group-hover:text-gray-950 transition-all duration-300" }, t.avatar)
                  , React.createElement('div', {}
                    , React.createElement('p', { className: "text-white font-black italic tracking-wide" }, t.name)
                    , React.createElement('p', { className: "text-gray-500 text-[10px] font-black uppercase tracking-widest mt-0.5" }, t.role)
                  )
                )
              )
            ))
          )
        )
      )

      /* Blog Section */
      , React.createElement('div', { id: "blog", className: "bg-gray-950 py-24 relative" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6" }
          , React.createElement('div', { className: "flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16" }
            , React.createElement('div', {}
              , React.createElement('span', { className: "inline-flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-[0.35em] mb-4" }
                , React.createElement('span', { className: "w-8 h-px bg-amber-400" })
                , "LATEST NEWS"
              )
              , React.createElement('h2', { className: "text-4xl md:text-5xl font-black text-white leading-tight" }
                , "From Our "
                , React.createElement('span', { className: "text-amber-400 italic" }, "Blog")
              )
            )
            , React.createElement(Link, { to: "#", className: "group flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.2em] text-xs hover:text-amber-400 transition-colors" }
              , "VIEW ALL POSTS"
              , React.createElement('div', { className: "w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-gray-950 transition-all" }
                , React.createElement(ChevronRight, { className: "w-4 h-4" })
              )
            )
          )

          , React.createElement('div', { className: "grid md:grid-cols-3 gap-10" }
            , blogs.map((blog, i) => (
              React.createElement('div', { key: i, className: "group cursor-pointer relative" }
                , React.createElement('div', { className: "aspect-video bg-gray-900 border border-white/5 rounded-[2rem] overflow-hidden mb-8 relative shadow-2xl group-hover:border-amber-500/30 transition-colors" }
                  , React.createElement('div', { className: "w-full h-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" }
                    , blog.image.startsWith("http") ? React.createElement('img', { src: blog.image, className: "w-full h-full object-cover" }) : blog.image
                  )
                  , React.createElement('div', { className: "absolute top-6 left-6 bg-amber-500 text-gray-950 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg" }, blog.category)
                )
                , React.createElement('p', { className: "text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-3 flex items-center gap-2" }
                  , React.createElement('span', { className: "w-1 h-1 rounded-full bg-amber-500" })
                  , blog.date
                )
                , React.createElement('h3', { className: "text-2xl font-black text-white mb-4 group-hover:text-amber-400 transition-colors leading-tight" }, blog.title)
                , React.createElement('p', { className: "text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2" }, blog.excerpt)
                , React.createElement('div', { className: "inline-flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all" }
                  , "READ MORE", React.createElement(ChevronRight, { className: "w-4 h-4" })
                )
              )
            ))
          )
        )
      )

      /* Contact CTA with dark overlay image */
      , React.createElement('div', { id: "contact", className: "relative py-32 overflow-hidden bg-gray-950" }
        , React.createElement('div', { className: "absolute inset-0 z-0 bg-cover bg-center opacity-40 scale-105", style: { backgroundImage: "url('https://images.unsplash.com/photo-1549194388-f61be84a6e9e?auto=format&fit=crop&q=80&w=2072')" } })
        , React.createElement('div', { className: "absolute inset-0 z-1 bg-gradient-to-tr from-gray-950 via-gray-950/80 to-transparent" })

        , React.createElement('div', { className: "relative z-10 max-w-5xl mx-auto px-6 text-center" }
          , React.createElement('h2', { className: "text-4xl md:text-6xl font-black text-white mb-8 leading-tight" }
            , "Start Your Journey with "
            , React.createElement('span', { className: "text-amber-400" }, "WeeFly ")
            , "Today"
          )
          , React.createElement('p', { className: "text-gray-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium" }
            , "Join thousands of happy riders and experienced drivers. Download our app or book online for the best taxi service in town."
          )
          , React.createElement('div', { className: "flex flex-col sm:flex-row justify-center gap-6" }
            , React.createElement('button', {
              onClick: () => navigate("/register"),
              className: "bg-amber-500 hover:bg-amber-400 text-gray-950 px-12 h-20 font-black rounded-full text-lg shadow-2xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
            }
              , "Book Your Taxi Now"
              , React.createElement(ChevronRight, { className: "w-6 h-6" })
            )
            , React.createElement('button', {
              onClick: () => {
                const element = document.getElementById("contact");
                element && element.scrollIntoView({ behavior: "smooth" });
              },
              className: "bg-white/10 hover:bg-white/20 text-white border border-white/20 px-12 h-20 font-black rounded-full text-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
            }
              , "Contact Us"
            )
          )
        )
      )

      /* Footer */
      , React.createElement('footer', { className: "bg-gray-950 py-24 relative overflow-hidden" }
        /* Footer Glow */
        , React.createElement('div', { className: "absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full translate-y-1/2" })

        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 relative z-10" }
          , React.createElement('div', { className: "grid md:grid-cols-4 gap-16 pb-20 border-b border-white/5" }
            , React.createElement('div', { className: "col-span-2 space-y-8" }
              , React.createElement(Link, { to: "/", className: "flex items-center gap-3 group" }
                , React.createElement('div', { className: "relative w-12 h-12 flex-shrink-0" }
                  , React.createElement('svg', { viewBox: "0 0 52 52", className: "w-full h-full" }
                    , React.createElement('circle', { cx: "26", cy: "26", r: "25", fill: "#f59e0b" })
                    , React.createElement('text', { x: "26", y: "36", textAnchor: "middle", fontSize: "28", fontWeight: "900", fill: "#111827" }, "W")
                  )
                )
                , React.createElement('div', { className: "flex flex-col" }
                  , React.createElement('span', { className: "font-black text-2xl text-white tracking-tight leading-none" }
                    , "Wee", React.createElement('span', { className: "text-amber-500" }, "Fly")
                  )
                  , React.createElement('span', { className: "text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1" }, "Cabs Global")
                )
              )
              , React.createElement('p', { className: "text-gray-400 leading-relaxed max-w-md font-medium" }, "Providing the most reliable and affordable premium cab services globally. We make urban transport safe, convenient, and truly exceptional."
              )
              , React.createElement('div', { className: "flex gap-4" }
                , ["Facebook", "Twitter", "Instagram", "LinkedIn"].map((s, i) => (
                  React.createElement('button', { key: i, className: "w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group hover:bg-amber-500 hover:border-amber-500 transition-all duration-300" }
                    , React.createElement('span', { className: "text-[10px] font-black text-gray-500 group-hover:text-gray-950 uppercase" }, s.substring(0, 2))
                  )
                ))
              )
            )
            , React.createElement('div', { className: "space-y-8" }
              , React.createElement('h4', { className: "font-black text-white tracking-[0.2em] text-xs uppercase" }, "Company Navigator")
              , React.createElement('ul', { className: "space-y-5 text-gray-400 font-bold text-sm" }
                , React.createElement('li', { className: "hover:text-amber-400 cursor-pointer transition-all hover:translate-x-2 flex items-center gap-2" }, React.createElement('span', { className: "w-1.5 h-px bg-amber-500" }), "Our Services")
                , React.createElement('li', { className: "hover:text-amber-400 cursor-pointer transition-all hover:translate-x-2 flex items-center gap-2" }, React.createElement('span', { className: "w-1.5 h-px bg-amber-500" }), "About WeeFly")
                , React.createElement('li', { className: "hover:text-amber-400 cursor-pointer transition-all hover:translate-x-2 flex items-center gap-2" }, React.createElement('span', { className: "w-1.5 h-px bg-amber-500" }), "Latest Insights")
                , React.createElement('li', { className: "hover:text-amber-400 cursor-pointer transition-all hover:translate-x-2 flex items-center gap-2" }, React.createElement('span', { className: "w-1.5 h-px bg-amber-500" }), "Support Hub")
              )
            )
            , React.createElement('div', { className: "space-y-8" }
              , React.createElement('h4', { className: "font-black text-white tracking-[0.2em] text-xs uppercase" }, "Stay Connected")
              , React.createElement('p', { className: "text-sm text-gray-400 font-medium leading-relaxed" }, "Join our inner circle for exclusive updates and ride offers.")
              , React.createElement('div', { className: "space-y-3" }
                , React.createElement(Input, { placeholder: "Your email address", className: "bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-gray-600 focus:border-amber-500/50 transition-colors" })
                , React.createElement('button', { className: "w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-black h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/10" }, "SUBSCRIBE")
              )
            )
          )
          , React.createElement('div', { className: "pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]" }
            , React.createElement('p', {}, "© 2024 WeeFly Cabs. Pure Excellence in Motion.")
            , React.createElement('div', { className: "flex flex-wrap justify-center gap-8" }
              , React.createElement('span', { className: "cursor-pointer hover:text-amber-500 transition-colors" }, "Privacy Protocol")
              , React.createElement('span', { className: "cursor-pointer hover:text-amber-500 transition-colors" }, "Terms of Service")
              , React.createElement('span', { className: "cursor-pointer hover:text-amber-500 transition-colors" }, "Safety Standards")
            )
          )
        )
      )
    )
  );
}

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
