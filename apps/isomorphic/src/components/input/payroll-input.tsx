"use client";

import cn from "@core/utils/class-names";
import { forwardRef } from "react";
import { Input, InputProps } from "rizzui";

export const PayrollInput = forwardRef<HTMLInputElement, InputProps>(
  ({ inputClassName, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        inputClassName={cn(
          "shadow-none ring-0 h-auto py-0.5 border-transparent hover:border-primary px-2 text-gray-900 dark:text-gray-0",
          inputClassName
        )}
        {...props}
      />
    );
  }
);

PayrollInput.displayName = "PayrollInput";
