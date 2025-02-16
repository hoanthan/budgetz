"use client"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"
import PlanForm from "./form/plan-form"
import { Tables } from "~/supabase/database.types"
import { useToggle } from '@reactuses/core'
import { useCallback } from "react"

export const PlanFormDrawer: React.FC<React.PropsWithChildren<{
  onSuccess?: (plan: Tables<'plans'>) => void
}>> = ({ children, onSuccess }) => {
  const [opened, toggle] = useToggle(false)

  const onSaveSuccess = useCallback((plan: Tables<'plans'>) => {
    toggle(false)
    onSuccess?.(plan)
  }, [])

  return (
    <Drawer open={opened} onOpenChange={toggle}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Create New Plan</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <PlanForm onSuccess={onSaveSuccess} onCancel={() => toggle(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
