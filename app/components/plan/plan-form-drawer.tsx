"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import PlanForm from "../form/plan-form";
import { Tables } from "supabase/database.types";
import { useToggle } from "@reactuses/core";
import { useCallback } from "react";

export const PlanFormDrawer: React.FC<
  React.PropsWithChildren<{
    onSuccess?: (plan: Tables<"plans">) => void;
    onToggle?: (val: boolean) => void;
    plan?: Tables<"plans">;
  }>
> = ({ children, onSuccess, plan, onToggle }) => {
  const [opened, toggle] = useToggle(false);

  const onSaveSuccess = useCallback((data: Tables<"plans">) => {
    toggle(false);
    onSuccess?.(data);
  }, []);

  const _toggle = useCallback(
    (open: boolean) => {
      toggle(open);
      onToggle?.(open);
    },
    [onToggle]
  );

  return (
    <Drawer open={opened} onOpenChange={toggle}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>
              {plan?.id ? "Edit Plan" : "Create New Plan"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {opened ? (
              <PlanForm
                initialData={plan}
                onSuccess={onSaveSuccess}
                onCancel={() => _toggle(false)}
              />
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
