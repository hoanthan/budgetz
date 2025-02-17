import { useToggle } from '@reactuses/core'
import React, { useCallback } from 'react'
import { Tables } from 'supabase/database.types'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import BudgetForm from '../form/budget-form'

const BudgetFormDrawer: React.FC<{
  planId: string
  onToggle?: (val: boolean) => void
  onSuccess?: (budget: Tables<'budgets'>) => void
  budget?: Tables<'budgets'>
  children: (props: { opened: boolean, toggle: (val: boolean) => void }) => React.ReactNode
}> = ({ planId, budget, onSuccess, children, onToggle }) => {
  const [opened, toggle] = useToggle(false)

  const onSaveSuccess = useCallback((data: Tables<'budgets'>) => {
    toggle(false)
    onSuccess?.(data)
  }, [toggle, onSuccess])

  const _toggle = useCallback((open: boolean) => {
    toggle(open)
    onToggle?.(open)
  }, [onToggle])

  return (
    <Drawer open={opened} onOpenChange={_toggle}>
      {children({ opened, toggle })}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{budget?.id ? 'Edit Budget' : 'Create New Budget'}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {opened ? <BudgetForm planId={planId} initialData={budget} onCancel={() => toggle(false)} onSuccess={onSaveSuccess} /> : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default BudgetFormDrawer