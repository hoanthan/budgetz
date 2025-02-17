"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useClickOutside, useToggle } from "@reactuses/core";

export function DateRangePicker({
  className,
  value,
  defaultValue,
  onChange,
  name,
  placeholder,
}: Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value?: DateRange) => void;
  name?: string;
  placeholder?: string;
}) {
  const container = React.useRef<HTMLDivElement>(null);
  const popoverContent = React.useRef<HTMLDivElement>(null);
  const [open, toggle] = useToggle(false);
  useClickOutside(popoverContent, (evt) => {
    if (container.current?.contains(evt.target as Node)) return;
    toggle(false);
  });

  const [date, setDate] = React.useState<DateRange | undefined>(
    value ?? defaultValue
  );

  const handleChange = React.useCallback((range?: DateRange) => {
    setDate(range);
    onChange?.(range);
  }, []);

  const computedDate = React.useMemo(() => value ?? date, [value, date]);

  return (
    <div ref={container} className={cn("grid gap-2", className)}>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            name={name}
            type="button"
            className={cn(
              "w-full justify-start text-left font-normal",
              !computedDate && "text-muted-foreground"
            )}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggle();
            }}
          >
            <CalendarIcon />
            {computedDate?.from ? (
              computedDate.to ? (
                <>
                  {format(computedDate.from, "LLL dd, y")} -{" "}
                  {format(computedDate.to, "LLL dd, y")}
                </>
              ) : (
                format(computedDate.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder || "Pick dates"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverContent}
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={new Date()}
            selected={computedDate}
            onSelect={handleChange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
