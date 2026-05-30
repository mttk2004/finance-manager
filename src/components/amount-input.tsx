"use client";

import { useState, ChangeEvent } from "react";
import { numberToVietnameseText } from "@/lib/number-vietnamese";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function AmountInput({ value, onChange, className, placeholder }: AmountInputProps) {
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

  const handleSuggestionClick = (multiplier: number) => {
    if (!value) return;
    const newVal = String(Number(value) * multiplier);
    onChange(newVal);
    setShowSuggestions(false);
  };

  const displayValue = formatValue(value);
  const textValue = value ? numberToVietnameseText(value) : "";

  return (
    <div className="relative w-full text-center md:text-left">
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder || "0"}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => { if (value.length > 0 && value.length < 5) setShowSuggestions(true); }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className={className}
      />
      {textValue && (
        <div className="text-sm text-neutral-400 mt-2 min-h-5 italic">{textValue}</div>
      )}
      
      {showSuggestions && value && (
        <div className="absolute z-10 w-full mt-2 bg-[#1A1A1A] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col md:w-64 md:left-0">
          <div className="flex flex-wrap gap-2 p-2">
            {[
              { mult: 100, label: "x100" },
              { mult: 1000, label: "xk" },
              { mult: 10000, label: "x10k" },
              { mult: 100000, label: "x100k" },
            ].map(sug => {
              const suggestedFormatted = formatValue(String(Number(value) * sug.mult));
              return (
                <button
                  key={sug.mult}
                  onClick={() => handleSuggestionClick(sug.mult)}
                  className="px-3 py-1.5 rounded-lg bg-[#2A2A2A] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/[0.05] flex flex-col items-center flex-1"
                >
                  <span className="font-mono text-white text-sm">{suggestedFormatted}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
