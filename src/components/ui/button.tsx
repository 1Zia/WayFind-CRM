"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "./utils";

// --- Regular Button (still available as fallback) ---
const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90",
        cool: "dark:inset-shadow-2xs dark:inset-shadow-white/10 bg-linear-to-t border border-b-2 border-zinc-950/40 from-primary to-primary/85 shadow-md shadow-primary/20 ring-1 ring-inset ring-white/25 transition-[filter] duration-200 hover:brightness-110 active:brightness-90 dark:border-x-0 text-primary-foreground dark:text-primary-foreground dark:border-t-0 dark:border-primary/50 dark:ring-white/5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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

// --- APPLE-STYLE GLASS/LIQUID BUTTON ---
const liquidButtonVariants = cva(
  "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap font-bold text-white transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
      },
      size: {
        default: "h-12 px-8 text-base rounded-[24px]",
        sm: "h-10 px-6 text-sm rounded-[20px]",
        lg: "h-14 px-10 text-lg rounded-[28px]",
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
    <>
      {/* Outer glow/border */}
      <div className="absolute inset-0 rounded-[inherit] p-[3px] bg-gradient-to-b from-white/60 via-white/20 to-white/30">
        {/* Inner shadow border */}
        <div className="absolute inset-[3px] rounded-[inherit] border border-white/60 border-b-white/30" />
        
        {/* Main button background */}
        <div className="relative h-full w-full rounded-[inherit] overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#7b8bf2] via-[#6c7ae0] to-[#5a68c8]" />
          
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
          
          {/* Bottom shadow for depth */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-[inherit] bg-radial from-white/30 to-transparent opacity-60" />
        </div>
      </div>
      
      {/* Drop shadow */}
      <div 
        className="absolute inset-0 rounded-[inherit] opacity-70"
        style={{
          boxShadow: "0 4px 12px rgba(90, 104, 200, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)",
          transform: isPressed ? "translateY(1px) scale(0.99)" : "translateY(0)",
        }}
      />
      
      {/* Content */}
      <span 
        className="relative z-10 flex items-center gap-2"
        style={{
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3), 0 -1px 0 rgba(255, 255, 255, 0.2)",
          transform: isPressed ? "scale(0.98)" : "scale(1)",
          transition: "transform 0.1s ease",
        }}
      >
        {children}
      </span>
    </>
  );
}

// --- Exports ---
export { Button, buttonVariants, LiquidButton, liquidButtonVariants };
