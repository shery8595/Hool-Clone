import Link from "next/link";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const predictButtonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border-0 outline-none",
    "font-bold tracking-tight",
    "transition-[transform,box-shadow,filter] duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-hoolclone-green-600 text-white",
          "shadow-[0_4px_0_#145c3f]",
          "hover:translate-y-px hover:shadow-[0_3px_0_#145c3f] hover:brightness-105",
          "active:translate-y-[3px] active:shadow-[0_1px_0_#145c3f]",
        ].join(" "),
        accent: [
          "bg-hoolclone-yellow-500 text-hoolclone-gray-900",
          "shadow-[0_4px_0_#c99a0f]",
          "hover:translate-y-px hover:shadow-[0_3px_0_#c99a0f] hover:brightness-105",
          "active:translate-y-[3px] active:shadow-[0_1px_0_#c99a0f]",
        ].join(" "),
        outline: [
          "bg-white text-hoolclone-green-900",
          "shadow-[0_4px_0_#d1d5db]",
          "border border-hoolclone-green-100/90",
          "hover:translate-y-px hover:bg-hoolclone-gray-50 hover:shadow-[0_3px_0_#d1d5db]",
          "active:translate-y-[3px] active:shadow-[0_1px_0_#d1d5db]",
        ].join(" "),
        ghost: [
          "bg-transparent px-0 py-1 text-sm font-semibold text-hoolclone-green-900 shadow-none",
          "hover:underline active:translate-y-0",
        ].join(" "),
      },
      size: {
        sm: "min-w-[7.4rem] rounded-[11px] px-[1.35rem] py-[0.7rem] text-[0.9375rem] leading-none [&_svg:not([class*='size-'])]:size-4",
        default:
          "min-w-[9.35rem] rounded-[12px] px-[1.65rem] py-[0.825rem] text-[0.9375rem] leading-none [&_svg:not([class*='size-'])]:size-[1.1rem]",
        lg: "min-w-[12.1rem] rounded-[13px] px-[2.2rem] py-[0.96rem] text-[1.1rem] leading-none [&_svg:not([class*='size-'])]:size-[1.1rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type PredictButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof predictButtonVariants>;

export function PredictButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: PredictButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="predict-button"
      className={cn(predictButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

type PredictButtonLinkProps = Omit<PredictButtonProps, "render"> & {
  href: string;
};

export function PredictButtonLink({
  href,
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}: PredictButtonLinkProps) {
  return (
    <ButtonPrimitive
      nativeButton={false}
      render={<Link href={href} />}
      data-slot="predict-button"
      className={cn(predictButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}

const choiceSelectedVariants = {
  default: predictButtonVariants({ variant: "default", size: "default" }),
  accent: predictButtonVariants({ variant: "accent", size: "default" }),
};

/** Shared shell for toggle / choice buttons on the predict form. */
export function predictChoiceButtonClass(selected: boolean, accent = false) {
  return cn(
    "inline-flex w-full cursor-pointer items-center justify-center gap-2 border-0 outline-none sm:w-auto",
    "rounded-[12px] px-[1.65rem] py-[0.825rem] text-[0.9375rem] font-bold leading-none",
    "transition-[transform,box-shadow,border-color,filter] duration-150 ease-out",
    selected
      ? choiceSelectedVariants[accent ? "accent" : "default"]
      : cn(
          "border border-border bg-white text-foreground",
          "shadow-[0_3px_0_#e5e7eb]",
          "hover:translate-y-px hover:bg-hoolclone-gray-50 hover:shadow-[0_2px_0_#e5e7eb]",
          "active:translate-y-[2px] active:shadow-[0_1px_0_#e5e7eb]",
        ),
  );
}
