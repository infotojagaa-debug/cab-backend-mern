import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/utils/api";

/**
 * Custom debounce hook
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function LocationAutocomplete({
    placeholder = "Search location...",
    value = "",
    onChange = () => { },
    onSelect = () => { },
    className = "",
    icon: Icon = MapPin
}) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const debouncedQuery = useDebounce(inputValue, 400);
    const wrapperRef = useRef(null);

    // Sync with external value
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            const query = debouncedQuery?.trim();
            if (!query || query.length < 3) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(getApiUrl(`/api/geocoding/search?q=${encodeURIComponent(query)}&limit=5`));
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Geocoding fetch error (${response.status}):`, errorText);
                    setSuggestions([]);
                    return;
                }
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Geocoding fetch error:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchResults();
        }
    }, [debouncedQuery, isOpen]);

    // Handle clicks outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleSelect(suggestions[selectedIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const handleSelect = (suggestion) => {
        const selectedValue = suggestion.display_name;
        setInputValue(selectedValue);
        setIsOpen(false);
        setSuggestions([]);

        // Save to recent searches
        const newRecent = [
            {
                display_name: selectedValue,
                lat: suggestion.lat,
                lon: suggestion.lon || suggestion.lng
            },
            ...recentSearches.filter(item => item.display_name !== selectedValue)
        ].slice(0, 5); // Keep last 5

        setRecentSearches(newRecent);
        localStorage.setItem("recentSearches", JSON.stringify(newRecent));

        onSelect({
            address: selectedValue,
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon || suggestion.lng)
        });
    };

    const highlightMatch = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <b key={i} className="text-primary">{part}</b>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="relative flex items-center group">
                <div className="absolute left-4 z-10">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                        <Icon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    )}
                </div>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        onChange(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="pl-12 py-6 rounded-2xl border-gray-100 focus:border-primary/20 bg-gray-50/50 focus:bg-white transition-all font-semibold"
                />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[10000] overflow-hidden"
                    >
                        {inputValue.length === 0 && recentSearches.length > 0 ? (
                            <div className="p-2">
                                <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                    <span>Recent Searches</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRecentSearches([]);
                                            localStorage.removeItem("recentSearches");
                                        }}
                                        className="hover:text-destructive transition-colors"
                                    >
                                        Clear History
                                    </button>
                                </div>
                                {recentSearches.map((item, index) => (
                                    <button
                                        key={`recent-${index}`}
                                        onClick={() => handleSelect(item)}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-start gap-3 group/item"
                                    >
                                        <div className="mt-0.5 p-2 rounded-lg bg-gray-100 text-gray-400 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                            <History className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 truncate">
                                                {item.display_name.split(',')[0]}
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-400 truncate">
                                                {item.display_name}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : inputValue.length >= 3 ? (
                            <>
                                {isLoading && suggestions.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                                        <p className="text-sm text-gray-400 font-bold">Finding locations...</p>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="p-2">
                                        {suggestions.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3 group/item
                                                    ${index === selectedIndex ? 'bg-gray-50 ring-1 ring-primary/5' : ''}
                                                `}
                                            >
                                                <div className={`mt-0.5 p-2 rounded-lg transition-colors 
                                                    ${index === selectedIndex ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}
                                                `}>
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 truncate">
                                                        {highlightMatch(item.display_name.split(',')[0], debouncedQuery)}
                                                    </div>
                                                    <div className="text-[10px] font-medium text-gray-400 truncate">
                                                        {item.display_name}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : !isLoading && (
                                    <div className="p-8 text-center">
                                        <Search className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400 font-bold">No results found</p>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
