import { cva } from "class-variance-authority";
import { cn } from "./utils";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none",
  {
    variants: {
      intent: {
        default: "bg-slate-900 text-white hover:bg-slate-700",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: "default" | "ghost";
};

export function Button({ className, intent, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ intent }), className)} {...props} />
  );
}
