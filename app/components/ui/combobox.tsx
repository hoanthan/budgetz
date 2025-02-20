"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

type ComboboxOption = {
  value: string;
  label: string | React.JSX.Element;
};

type ComboboxProps = {
  value?: string | null;
  onChange?: (val: string | null) => void;
  options?: ComboboxOption[];
  placeholder?: string;
  notFoundText?: string;
  name?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  commandProps?: React.ComponentProps<typeof CommandPrimitive>;
};

export function Combobox({
  name,
  value,
  options,
  onChange,
  placeholder,
  notFoundText,
  searchPlaceholder = "Search...",
  onSearch,
  commandProps,
  ...props
}: ComboboxProps & React.HTMLAttributes<HTMLButtonElement>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          {...props}
        >
          {value
            ? options?.find((option) => option.value === value)?.label
            : placeholder || "Select..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-80 p-0">
        <Command {...commandProps}>
          <CommandInput
            name={name}
            placeholder={searchPlaceholder}
            className="h-9"
            onChangeCapture={(e) => {
              onSearch?.((e.target as HTMLInputElement).value);
            }}
          />
          <CommandList>
            <CommandEmpty>{notFoundText}</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange?.(currentValue === value ? null : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
