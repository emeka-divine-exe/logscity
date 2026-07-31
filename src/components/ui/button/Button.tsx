"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-[linear-gradient(90deg,var(--color-primary)/15_0%,var(--color-primary)_100%)]
    text-white
    shadow-lg shadow-primary/20
    hover:bg-primary
    hover:shadow-xl
    hover:shadow-primary/35
  `,

  secondary: `
    border
    border-border
    bg-transparent
    text-foreground
    hover:border-primary
    hover:bg-primary
    hover:text-white
  `,

  danger: `
    bg-[linear-gradient(90deg,var(--color-danger)/15_0%,var(--color-danger)_100%)]
    text-white
    shadow-lg shadow-danger/20
    hover:bg-danger
    hover:shadow-xl
    hover:shadow-danger/35
  `,
};

export function Button({
  variant = "primary",
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        `
        inline-flex items-center justify-center
        rounded-full
        px-6 py-3
        text-sm font-medium
        whitespace-nowrap

        transition-all
        duration-200
        ease-out

        hover:-translate-y-0.5
        active:translate-y-0

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary/30
        focus-visible:ring-offset-2

        disabled:pointer-events-none
        disabled:opacity-50
        disabled:shadow-none
        disabled:translate-y-0
        `,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
      }"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-[linear-gradient(90deg,var(--color-primary)/15_0%,var(--color-primary)_100%)]
    text-white
    shadow-lg shadow-primary/20
    hover:bg-primary
    hover:shadow-xl
    hover:shadow-primary/35
  `,

  secondary: `
    border
    border-border
    bg-transparent
    text-foreground
    hover:border-primary
    hover:bg-primary
    hover:text-white
  `,

  danger: `
    bg-[linear-gradient(90deg,var(--color-danger)/15_0%,var(--color-danger)_100%)]
    text-white
    shadow-lg shadow-danger/20
    hover:bg-danger
    hover:shadow-xl
    hover:shadow-danger/35
  `,
};

export function Button({
  variant = "primary",
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        `
        inline-flex items-center justify-center
        rounded-full
        px-6 py-3
        text-sm font-medium
        whitespace-nowrap

        transition-all
        duration-200
        ease-out

        hover:-translate-y-0.5
        active:translate-y-0

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary/30
        focus-visible:ring-offset-2

        disabled:pointer-events-none
        disabled:opacity-50
        disabled:shadow-none
        disabled:translate-y-0
        `,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
