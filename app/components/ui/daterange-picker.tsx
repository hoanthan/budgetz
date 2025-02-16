"use client"

import * as React from "react"
import { addDays, endOfMonth, format, startOfMonth } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

export function DateRangePicker({
  className,
  value,
  defaultValue,
  onChange,
  name,
  placeholder
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> & {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (value?: DateRange) => void
  name?: string
  placeholder?: string
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(value ?? defaultValue)

  const handleChange = React.useCallback((range?: DateRange) => {
    setDate(range)
    onChange?.(range)
  }, [])

  const computedDate = React.useMemo(() => value ?? date, [value, date])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            name={name}
            className={cn(
              "w-full justify-start text-left font-normal",
              !computedDate && "text-muted-foreground"
            )}
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
              <span>{placeholder || 'Pick dates'}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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
  )
}
