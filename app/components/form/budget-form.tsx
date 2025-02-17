import { classValidatorResolver } from "@hookform/resolvers/class-validator"
import { IsDefined, IsEnum, IsNumber, IsString, MaxLength, Min } from "class-validator"
import { useCallback } from "react"
import { Controller, useForm } from "react-hook-form"
import { Enums, Tables } from "supabase/database.types"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import ErrorMessage from "./error-message"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "~/supabase"
import { toast } from "sonner"
import { Transform } from "class-transformer"
import { isEmpty, omitBy } from "lodash-es"

class BudgetFormData {
  @IsDefined()
  @IsString()
  @MaxLength(255)
  name: string

  @IsDefined()
  @IsEnum(['in', 'out'])
  type: Enums<'BudgetType'>

  @IsDefined()
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2
  })
  @Transform((params) => typeof params.value === 'string' ? parseFloat(params.value) : params.value)
  @Min(0)
  amount: number
}

const BudgetForm: React.FC<{
  planId: string
  initialData?: Partial<Tables<'budgets'>>
  onCancel?: () => void
  onSuccess?: (budget: Tables<'budgets'>) => void
}> = ({ planId, initialData, onCancel, onSuccess }) => {
  const methods = useForm<BudgetFormData>({
    resolver: classValidatorResolver(BudgetFormData),
    defaultValues: {
      type: 'out',
      amount: 0,
      ...omitBy(initialData, isEmpty)
    }
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['saveBudget', planId],
    mutationFn: async (data: BudgetFormData) => await supabase.from('budgets').upsert({
      ...data,
      id: initialData?.id,
      plan_id: planId
    }).select(),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message)
        return
      }
      toast.success('Budget saved!')
      if (!res.data?.[0]) return;
      onSuccess?.(res.data[0])
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  const onSubmit = useCallback((data: BudgetFormData) => {
    mutate(data)
  }, [])

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label>Name</Label>
        <Input autoFocus tabIndex={0} placeholder="Budget name..." {...methods.register('name')} />
        <ErrorMessage formState={methods.formState} name="name" />
      </div>
      <div className="grid gap-2">
        <Label>Type</Label>
        <Controller
          control={methods.control}
          name="type"
          render={({ field: { value, onChange, name } }) => (
            <Select name={name} value={value} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" tabIndex={1} />
                <ErrorMessage formState={methods.formState} name="type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Income</SelectItem>
                <SelectItem value="out">Expend</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid gap-2">
        <Label>Amount</Label>
        <Input placeholder="Amount..." type="number" {...methods.register('amount')} autoComplete="off" min={0} />
        <ErrorMessage formState={methods.formState} name="amount" />
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isPending}>Save</Button>
      </div>
    </form>
  )
}

export default BudgetForm