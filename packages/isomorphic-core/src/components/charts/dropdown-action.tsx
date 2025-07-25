"use client";

import { useState } from "react";
import { Select, SelectOption, SelectProps } from "rizzui";
import cn from "../../utils/class-names";
import { PiCalendarBlank, PiCaretDownBold } from "react-icons/pi";

type Options = {
  value: string;
  label: string;
};

type DropdownActionProps = {
  name?: string;
  options: Options[];
  defaultActive?: string;
  onChange: (data: string) => void;
  className?: string;
  dropdownClassName?: string;
  activeClassName?: string;
  prefixIconClassName?: string;
  suffixIconClassName?: string;
  selectClassName?: string;
  inPortal?: boolean;
  variant?: SelectProps<SelectOption>["variant"];
};

export default function DropdownAction({
  variant = "text",
  options,
  onChange,
  className,
  prefixIconClassName,
  suffixIconClassName,
  selectClassName,
  dropdownClassName,
  inPortal = true,
}: DropdownActionProps) {
  const [viewType, setViewType] = useState(options[0]);
  function handleOnChange(data: Options) {
    setViewType(data);
    onChange && onChange(data.value);
  }

  return (
    <Select
      inPortal={inPortal}
      variant={variant}
      value={viewType.value}
      options={options}
      onChange={handleOnChange}
      displayValue={(selected) => options.find((option) => option.value === selected)?.label}
      selectClassName={cn("py-1 px-2 leading-[32px] h-8 me-2", selectClassName)}
      optionClassName="py-1 px-2 leading-[32px] h-8"
      placeholder="Selecione o periodo"
      dropdownClassName={cn(
        "p-2 gap-1 grid !z-0",
        !inPortal && "w-full !z-10 h-auto",
        dropdownClassName
      )}
      placement="bottom-end"
      prefix={<PiCalendarBlank className={cn("h-5 w-5 text-gray-500", prefixIconClassName)} />}
      suffix={<PiCaretDownBold className={cn("h-3 w-3", suffixIconClassName)} />}
      className={cn("w-auto", className)}
    />
  );
}
