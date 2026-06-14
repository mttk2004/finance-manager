"use client";

import { useState, ChangeEvent, memo } from "react";
import { numberToVietnameseText } from "@/lib/number-vietnamese";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const AmountInput = memo(function AmountInput({ value, onChange, className, placeholder, disabled }: AmountInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Function to format number with spaces
  const formatValue = (val: string) => {
    // Remove all non-digits
    const cleanValue = val.replace(/\D/g, "");
    if (!cleanValue) return "";
    // Add space every 3 digits from the end
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Extract raw numerical value
    const rawValue = e.target.value.replace(/\D/g, "");
    onChange(rawValue);
    setShowSuggestions(rawValue.length > 0 && rawValue.length < 5); // Show suggestions for short inputs
  };

  const handleSuggestionClick = (val: string) => {
    onChange(val);
    setShowSuggestions(false);
  };

  const displayValue = formatValue(value);
  const textValue = value ? numberToVietnameseText(value) : "";

  const suggestions = [
    { value: "10000", label: "10k" },
    { value: "20000", label: "20k" },
    { value: "50000", label: "50k" },
    { value: "100000", label: "100k" },
    { value: "200000", label: "200k" },
    { value: "500000", label: "500k" },
  ];

  return (
    <div className="relative w-full text-center md:text-left">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder || "0"}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => { if (!disabled) setShowSuggestions(true); }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className={`w-full text-center md:text-left font-mono font-bold tracking-tighter focus:outline-none placeholder:text-muted-foreground/30 ${className}`}
        disabled={disabled}
        aria-label="Số tiền"
      />
      {textValue && (
        <div className="text-sm text-muted-foreground mt-2 min-h-5 italic">{textValue}</div>
      )}
      
      {showSuggestions && !disabled && (
        <div className="absolute z-10 w-full mt-2 bg-secondary border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col md:w-64 md:left-0">
          <div className="grid grid-cols-3 p-2 gap-1">
            {suggestions.map(sug => (
              <button
                key={sug.value}
                type="button"
                onClick={() => handleSuggestionClick(sug.value)}
                className="px-2 py-3 rounded-xl bg-secondary hover:bg-white/5 transition-all cursor-pointer border border-border flex flex-col items-center group"
              >
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground font-medium">{sug.label}</span>
              </button>
            ))}
          </div>
          {value && value.length < 6 && (
            <div className="flex flex-col p-2 pt-0 gap-1 border-t border-border/50">
              {[
                { mult: 1000, label: "xk" },
                { mult: 10000, label: "x10k" },
                { mult: 100000, label: "x100k" },
              ].map(sug => {
                const newVal = String(Number(value) * sug.mult);
                return (
                  <button
                    key={sug.mult}
                    type="button"
                    onClick={() => handleSuggestionClick(newVal)}
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-white/5 transition-all cursor-pointer border border-border flex items-center justify-between group"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground font-medium">{sug.label}</span>
                    <span className="font-mono text-foreground text-xs font-semibold">{formatValue(newVal)}đ</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
