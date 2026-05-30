"use client";

import { useState, ChangeEvent } from "react";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function AmountInput({ value, onChange, className, placeholder }: AmountInputProps) {
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
  };

  const displayValue = formatValue(value);

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder || "0"}
      value={displayValue}
      onChange={handleInputChange}
      className={className}
    />
  );
}
