import { useToggle } from "@reactuses/core"
import { useCallback } from "react"
import { Tables } from "supabase/database.types"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer"
import TransactionForm from "../form/transaction-form"

const TransactionFormDrawer: React.FC<{
  budgetId: number
  onToggle?: (val: boolean) => void
  onSuccess?: (budget: Tables<'transactions'>) => void
  transaction?: Tables<'transactions'>
  children: (props: { opened: boolean, toggle: (val: boolean) => void }) => React.ReactNode
}> = ({ budgetId, onToggle, onSuccess, transaction, children }) => {
  const [opened, toggle] = useToggle(false)

  const onSaveSuccess = useCallback((data: Tables<'transactions'>) => {
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
            <DrawerTitle>{transaction?.id ? 'Edit Transaction' : 'Create New Transaction'}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {opened ? <TransactionForm budgetId={budgetId} initialData={transaction} onCancel={() => toggle(false)} onSuccess={onSaveSuccess} /> : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default TransactionFormDrawer