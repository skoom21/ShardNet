import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg+div]:translate-y-[-3px] [&:has([role=alert])]:border-destructive/50 [&:has([role=alert])]:text-destructive",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground",
        warning: "border-yellow-500 bg-yellow-50 text-yellow-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant, className }))} {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm opacity-70", className)} {...props} />,
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
