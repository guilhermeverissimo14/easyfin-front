"use client";

import { useState } from "react";
import { Input } from "rizzui";
import cn from "@core/utils/class-names";

interface EditableInputProps {
  value?: string | number;
  onUpdate: (newValue: string) => Promise<void>;
  inputClassName?: string;
  placeholder?: string;
}

export default function EditableInput({
  value,
  onUpdate,
  inputClassName,
  placeholder,
}: EditableInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [loading, setLoading] = useState(false);

  const handleBlur = async () => {
    if (inputValue !== value) {
      setLoading(true);
      try {
        await onUpdate(inputValue as string);
      } catch (error) {
        console.error("Erro ao atualizar:", error);
      }
      setLoading(false);
    }
  };

  return (
    <Input
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      disabled={loading}
      inputClassName={cn(
        "md:w-[50%] shadow-none ring-0 h-auto py-0.5 border-transparent hover:border-primary px-2 text-gray-900 dark:text-gray-0",
        inputClassName
      )}
    />
  );
}
