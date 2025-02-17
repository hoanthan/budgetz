import { IsDate, IsDefined, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { Input } from "../ui/input"
import { CURRENCIES } from "~/constants/currency"
import { Controller, useForm } from "react-hook-form"
import { classValidatorResolver } from "@hookform/resolvers/class-validator"
import { Label } from "../ui/label"
import { Combobox } from "../ui/combobox"
import ErrorMessage from "./error-message"
import { useSettings } from "~/store/settings"
import { Button } from "../ui/button"
import { useCallback } from "react"
import { DateRange } from "react-day-picker"
import { Type } from "class-transformer"
import { DateRangePicker } from "../ui/daterange-picker"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "~/supabase"
import { omit } from "lodash-es"
import { toast } from "sonner"
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns"
import { Tables } from "supabase/database.types"

class DateRangeDTO {
  @IsDefined()
  @IsDate()
  from: Date
  
  @IsDefined()
  @IsDate()
  to: Date
}

class PlanFormData {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string

  @IsDefined()
  @IsString()
  @IsIn(Object.keys(CURRENCIES))
  currency: string

  @IsOptional()
  @Type(() => DateRangeDTO)
  @ValidateNested()
  range?: DateRange
}

const PlanForm: React.FC<{
  onSuccess?: (plan: Tables<'plans'>) => void
  onCancel?: () => void
  initialData?: Tables<'plans'>
}> = ({ onSuccess, onCancel, initialData }) => {

  const settings = useSettings(state => state.settings)

  const { handleSubmit, control, formState, register } = useForm<PlanFormData>({
    resolver: classValidatorResolver(PlanFormData),
    defaultValues: {
      currency: settings?.currency,
      ...initialData,
      range: {
        from: initialData?.start ? new Date(initialData.start) : startOfMonth(new Date()),
        to: initialData?.end ? new Date(initialData.end) : endOfMonth(new Date())
      }
    }
  })

  const { mutate: create, isPending } = useMutation({
    mutationKey: ['upsertPlan'],
    mutationFn: async (data: PlanFormData) => supabase.from('plans').upsert({
      ...omit(data, 'range'),
      start: data.range?.from ? startOfDay(data.range.from).toISOString() : null,
      end: data.range?.to ? endOfDay(data.range.to).toISOString() : null,
    }).select(),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message)
        return
      }
      toast.success('Plan saved!')
      if (!res.data?.[0]) return;
      onSuccess?.(res.data[0])
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  const onSubmit = useCallback((data: PlanFormData) => {
    create(data)
  }, [])

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor="planName">Plan name</Label>
        <Input id="planName" tabIndex={0} placeholder="Plan name..." {...register('name')} autoFocus />
        <ErrorMessage formState={formState} name="name" />
      </div>
      <Controller
        control={control}
        name="currency"
        render={({ field: { name, value, onChange } }) => (
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Combobox
              placeholder="Select currency..."
              options={Object.entries(CURRENCIES).map(([key, currency]) => {
                return {
                  value: key,
                  label: `${currency.name} / ${currency.code} (${currency.symbol})`
                }
              })}
              name={name}
              value={value}
              onChange={onChange}
              tabIndex={1}
            />
            <ErrorMessage formState={formState} name="currency" />
          </div>
        )}
      />
      <Controller
        control={control}
        name="range"
        render={({ field: { name, value, onChange } }) => (
          <div className="grid gap-2">
            <Label>Date range</Label>
            <DateRangePicker
              name={name}
              value={value}
              onChange={onChange}
              tabIndex={2}
            />
            <ErrorMessage formState={formState} name="range.from" />
            <ErrorMessage formState={formState} name="range.to" />
          </div>
        )}
      />
      <div className="flex justify-end items-center gap-4">
        <Button tabIndex={4} type="button" variant="outline" disabled={isPending} onClick={onCancel}>Cancel</Button>
        <Button tabIndex={3} type="submit" loading={isPending}>Save</Button>
      </div>
    </form>
  )
}

export default PlanForm