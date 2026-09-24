import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm border font-sans text-[11px] font-semibold tracking-[0.12em] uppercase transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-transparent text-primary hover:bg-primary hover:text-bg",
        ghost:
          "border-border bg-elevated text-fg hover:border-primary hover:text-primary",
        danger:
          "border-danger bg-transparent text-danger hover:bg-danger hover:text-bg",
        cyan: "border-cyan bg-transparent text-cyan hover:bg-cyan hover:text-bg",
        solid:
          "border-primary bg-primary text-bg hover:brightness-110",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[10px]",
        icon: "size-11 p-0",
        "icon-sm": "size-9 p-0",
      },
    },
    defaultVariants: { variant: "ghost", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
