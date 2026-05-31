"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#121212] group-[.toaster]:text-neutral-200 group-[.toaster]:border-white/[0.08] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-neutral-500",
          actionButton:
            "group-[.toast]:bg-neutral-200 group-[.toast]:text-neutral-900",
          cancelButton:
            "group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
