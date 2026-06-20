import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding text-sm font-semibold whitespace-nowrap",
    "transition-all duration-200 ease-out outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-hoolclone-green-700/25",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-hoolclone-green-600/25 text-primary-foreground",
          "bg-gradient-to-b from-hoolclone-green-600 via-primary to-hoolclone-green-800",
          "shadow-[0_6px_18px_var(--btn-neu-shadow-strong),0_2px_4px_rgba(10,61,46,0.1),inset_0_1px_0_rgba(255,255,255,0.28)]",
          "hover:brightness-[1.03] hover:shadow-[0_8px_22px_var(--btn-neu-shadow-strong),inset_0_1px_0_rgba(255,255,255,0.34)]",
          "active:translate-y-px active:brightness-[0.97]",
          "active:shadow-[0_2px_8px_var(--btn-neu-shadow-strong),inset_0_3px_8px_rgba(0,0,0,0.2)]",
        ].join(" "),
        outline: [
          "border-white/90 text-hoolclone-green-900",
          "bg-gradient-to-b from-white via-white to-hoolclone-gray-50",
          "shadow-[5px_5px_14px_var(--btn-neu-shadow),-4px_-4px_12px_var(--btn-neu-highlight),inset_0_1px_0_rgba(255,255,255,0.9)]",
          "hover:shadow-[6px_6px_16px_var(--btn-neu-shadow),-5px_-5px_14px_var(--btn-neu-highlight)]",
          "active:translate-y-px",
          "active:shadow-[inset_4px_4px_10px_var(--btn-neu-inset),inset_-2px_-2px_8px_var(--btn-neu-highlight)]",
          "aria-expanded:bg-hoolclone-green-100/60 aria-expanded:text-hoolclone-green-900",
        ].join(" "),
        secondary: [
          "border-hoolclone-green-100 text-secondary-foreground",
          "bg-gradient-to-b from-hoolclone-green-100 via-[#dff0e8] to-hoolclone-green-100",
          "shadow-[4px_4px_12px_var(--btn-neu-shadow),-3px_-3px_10px_var(--btn-neu-highlight),inset_0_1px_0_rgba(255,255,255,0.65)]",
          "hover:shadow-[5px_5px_14px_var(--btn-neu-shadow),-4px_-4px_12px_var(--btn-neu-highlight)]",
          "active:translate-y-px active:shadow-[inset_3px_3px_8px_var(--btn-neu-inset)]",
          "aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ].join(" "),
        ghost: [
          "border-transparent bg-transparent text-foreground shadow-none",
          "hover:border-white/70 hover:bg-gradient-to-b hover:from-white hover:to-hoolclone-gray-50",
          "hover:shadow-[4px_4px_10px_var(--btn-neu-shadow),-3px_-3px_8px_var(--btn-neu-highlight)]",
          "active:translate-y-px active:shadow-[inset_2px_2px_6px_var(--btn-neu-inset)]",
          "aria-expanded:bg-white/80 aria-expanded:shadow-[inset_2px_2px_6px_var(--btn-neu-inset)]",
        ].join(" "),
        destructive: [
          "border-red-200/80 text-destructive",
          "bg-gradient-to-b from-red-50 via-white to-red-50/80",
          "shadow-[4px_4px_12px_rgba(220,38,38,0.12),-3px_-3px_10px_var(--btn-neu-highlight),inset_0_1px_0_rgba(255,255,255,0.8)]",
          "hover:shadow-[5px_5px_14px_rgba(220,38,38,0.16),-4px_-4px_12px_var(--btn-neu-highlight)]",
          "active:translate-y-px active:shadow-[inset_3px_3px_8px_rgba(220,38,38,0.14)]",
          "focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        ].join(" "),
        accent: [
          "border-hoolclone-yellow-500/35 text-hoolclone-gray-900",
          "bg-gradient-to-b from-[#f9d84a] via-hoolclone-yellow-500 to-[#d9ad12]",
          "shadow-[0_6px_18px_rgba(245,197,24,0.38),0_2px_4px_rgba(180,130,0,0.12),inset_0_1px_0_rgba(255,255,255,0.42)]",
          "hover:brightness-[1.03] hover:shadow-[0_8px_22px_rgba(245,197,24,0.42),inset_0_1px_0_rgba(255,255,255,0.5)]",
          "active:translate-y-px active:brightness-[0.98]",
          "active:shadow-[0_2px_8px_rgba(245,197,24,0.3),inset_0_3px_8px_rgba(0,0,0,0.12)]",
        ].join(" "),
        link: "border-transparent bg-transparent text-primary underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 rounded-full px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 rounded-full px-3.5 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-full px-4 text-[0.8rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 rounded-full px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10 rounded-2xl",
        "icon-xs": "size-7 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-xl [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
