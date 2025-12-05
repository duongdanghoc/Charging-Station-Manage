"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",

          // Màu xanh pastel (Success)
          success: "group-[.toaster]:!bg-green-50 group-[.toaster]:!border-green-200 group-[.toaster]:!text-green-800",

          // Màu đỏ pastel (Error)
          error: "group-[.toaster]:!bg-red-50 group-[.toaster]:!border-red-200 group-[.toaster]:!text-red-800",

          // Màu xanh dương pastel (Info)
          info: "group-[.toaster]:!bg-blue-50 group-[.toaster]:!border-blue-200 group-[.toaster]:!text-blue-800",

          // Màu vàng pastel (Warning - nếu cần)
          warning: "group-[.toaster]:!bg-yellow-50 group-[.toaster]:!border-yellow-200 group-[.toaster]:!text-yellow-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
