"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function CustomSelect({ options, className, ...props }: CustomSelectProps) {
  return (
    <div className="relative inline-block w-full sm:w-auto">
      <select
        className={cn(
          "appearance-none w-full bg-secondary border border-border text-xs sm:text-sm text-foreground rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-secondary/80",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-card text-foreground">
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
        <ChevronDown size={16} />
      </div>
    </div>
  );
}
