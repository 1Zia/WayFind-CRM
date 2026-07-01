"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "./utils";

// --- Regular Button (still available as fallback) ---
const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "liquid-glass-primary hover:shadow-theme-md",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90",
        cool: "liquid-glass-primary hover:shadow-theme-md",
        outline:
          "border border-crm-border bg-white text-zinc-700 hover:bg-gray-50 hover:text-slate-900",
        secondary:
          "border border-crm-border bg-white text-zinc-700 hover:bg-gray-50",
        ghost: "text-zinc-600 hover:bg-gray-100 hover:text-slate-900",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const liquidButtonVariants = cva(
  "liquid-glass-primary relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none rounded-xl hover:shadow-theme-md",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  href?: string;
}

function LiquidButton({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: LiquidButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          liquidButtonVariants({ variant, size, className }),
          "group"
        )}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <ButtonContent isPressed={isPressed}>{children}</ButtonContent>
      </Link>
    );
  }

  return (
    <button
      className={cn(
        liquidButtonVariants({ variant, size, className }),
        "group"
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      <ButtonContent isPressed={isPressed}>{children}</ButtonContent>
    </button>
  );
}

// --- Button Content Component ---
function ButtonContent({
  children,
  isPressed,
}: {
  children: React.ReactNode;
  isPressed: boolean;
}) {
  return (
      <span 
        className="relative z-10 flex items-center gap-2"
        style={{
          transform: isPressed ? "scale(0.98)" : "scale(1)",
          transition: "transform 0.1s ease",
        }}
      >
        {children}
      </span>
  );
}

// --- Exports ---
export { Button, buttonVariants, LiquidButton, liquidButtonVariants };
