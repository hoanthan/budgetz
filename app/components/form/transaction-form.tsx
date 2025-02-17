import React, { useCallback } from 'react'
import { Tables } from 'supabase/database.types'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import ErrorMessage from './error-message'
import { Button } from '../ui/button'
import { IsDefined, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator'
import { Transform } from 'class-transformer'
import { useForm } from 'react-hook-form'
import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '~/supabase'
import { toast } from 'sonner'

class TransactionFormData {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

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

const TransactionForm: React.FC<{
  budgetId: number
  initialData?: Partial<Tables<'transactions'>>
  onCancel?: () => void
  onSuccess?: (transaction: Tables<'transactions'>) => void
}> = ({ budgetId, initialData, onCancel, onSuccess }) => {
  const methods = useForm<TransactionFormData>({
    resolver: classValidatorResolver(TransactionFormData),
    defaultValues: initialData
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['saveTransaction', budgetId],
    mutationFn: async (data: TransactionFormData) => await supabase.from('transactions').upsert({
      ...data,
      budget_id: budgetId,
      id: initialData?.id
    }).select(),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message)
        return
      }
      toast.success('Transaction saved!')
      if (!res.data?.[0]) return;
      onSuccess?.(res.data[0])
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  const onSubmit = useCallback((data: TransactionFormData) => {
    mutate(data)
  }, [])

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label>Name</Label>
        <Input autoFocus tabIndex={0} placeholder="Transaction name..." {...methods.register('name')} />
        <ErrorMessage formState={methods.formState} name="name" />
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

export default TransactionForm