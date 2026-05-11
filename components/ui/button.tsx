import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    inline-flex items-center justify-center
    whitespace-nowrap
    rounded-2xl
    text-sm font-medium
    transition-all duration-300
    outline-none
    relative overflow-hidden
    disabled:pointer-events-none
    disabled:opacity-50
    active:scale-[0.98]

    focus-visible:ring-2
    focus-visible:ring-purple-500/50

    [&_svg]:pointer-events-none
    [&_svg]:size-4
    [&_svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        default: `
          bg-gradient-to-r
          from-violet-600
          via-purple-600
          to-blue-600

          text-white

          shadow-[0_0_30px_rgba(124,58,237,0.35)]

          hover:shadow-[0_0_50px_rgba(124,58,237,0.55)]
          hover:brightness-110
        `,

        secondary: `
          bg-white/5
          backdrop-blur-xl

          border border-white/10

          text-white

          hover:bg-white/10
          hover:border-purple-500/30

          shadow-[0_0_25px_rgba(59,130,246,0.15)]
        `,

        outline: `
          border border-purple-500/30

          bg-transparent

          text-white

          hover:bg-purple-500/10
          hover:border-purple-400

          backdrop-blur-xl
        `,

        ghost: `
          bg-transparent

          text-slate-300

          hover:bg-white/5
          hover:text-white
        `,

        destructive: `
          bg-gradient-to-r
          from-red-500
          to-rose-600

          text-white

          hover:brightness-110

          shadow-[0_0_30px_rgba(239,68,68,0.35)]
        `,

        link: `
          text-purple-400
          underline-offset-4

          hover:text-purple-300
          hover:underline
        `,

        glow: `
          bg-gradient-to-r
          from-cyan-500
          via-blue-500
          to-purple-600

          text-white

          shadow-[0_0_60px_rgba(59,130,246,0.45)]

          hover:scale-[1.02]
          hover:shadow-[0_0_80px_rgba(59,130,246,0.65)]
        `,
      },

      size: {
        xs: `
          h-8
          px-3
          text-xs
        `,

        sm: `
          h-9
          px-4
          text-sm
        `,

        default: `
          h-11
          px-6
          text-sm
        `,

        lg: `
          h-14
          px-8
          text-base
        `,

        xl: `
          h-16
          px-10
          text-lg
        `,

        icon: `
          size-11
        `,
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
