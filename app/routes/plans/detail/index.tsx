import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { createPortal } from "react-dom";
import { Skeleton } from "~/components/ui/skeleton";
import { usePageTitle } from "~/hooks/use-page-title";
import { supabase } from "~/supabase";
import { Button } from "~/components/ui/button";
import { Edit } from "lucide-react";
import { PlanFormDrawer } from "~/components/plan/plan-form-drawer";
import BudgetFormDrawer from "~/components/budget/budget-form-drawer";
import { useMemo, useState } from "react";
import { Tables } from "supabase/database.types";
import BudgetList from "./components/BudgetList";
import Currency from "~/components/ui/currency";
import { sum, sumBy } from "lodash-es";
import PageSkeleton from "~/components/page-skeleton";

const PlanDetailPage = () => {
  const params = useParams<{ id: string }>();

  const [activeBudget, setActiveBudget] = useState<Tables<"budgets">>();

  const {
    data: plan,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["planDetails", params.id],
    queryFn: async () =>
      await supabase.from("plans").select().eq("id", params.id!).maybeSingle(),
    select: (res) => res.data,
  });

  usePageTitle(plan?.name);

  const {
    data: budgets,
    isLoading: isLoadingBudgets,
    refetch: refetchBudgets,
  } = useQuery({
    queryKey: [
      "budgets",
      {
        plan_id: params.id,
      },
    ],
    queryFn: async () =>
      await supabase
        .from("budgets")
        .select()
        .eq("plan_id", params.id!)
        .select("*, transactions(*)")
        .order("type"),
    select: (res) => res.data,
  });

  const {
    data: budgetsActualAmount,
    isLoading: isLoadingBudgetAmount,
    refetch: refetchBudgetsActualAmount,
  } = useQuery({
    queryKey: ["calcBudgetActualAmount", budgets?.map((b) => b.id)],
    enabled: Boolean(budgets?.length),
    queryFn: async () =>
      supabase
        .from("transactions")
        .select()
        .in(
          "budget_id",
          budgets!.map((budget) => budget.id)
        )
        .not("budget_id", "is", null),
    select: (res) => {
      return {
        data:
          res.data?.reduce<Record<number, number>>((map, transaction) => {
            map[transaction.budget_id!] = map[transaction.budget_id!] ?? 0;
            map[transaction.budget_id!] += transaction.amount;

            return map;
          }, {}) ?? {},
      };
    },
  });

  const estimatedAmount = useMemo(() => {
    return sumBy(
      budgets?.filter((budget) => budget.type === "out"),
      (budget) => budget.amount
    );
  }, [budgets]);

  const actualAmount = useMemo(() => {
    return sumBy(
      budgets?.filter((budget) => budget.type === "out"),
      (budget) => {
        const amount = budgetsActualAmount?.data?.[budget.id] ?? 0;
        return amount;
      }
    );
  }, [budgets, budgetsActualAmount?.data]);

  if (isLoading) return <PageSkeleton />;

  if (!plan) return null;

  return (
    <PlanFormDrawer plan={plan ?? undefined} onSuccess={() => refetch()}>
      {({ toggle: togglePlanForm }) => (
        <>
          {createPortal(
            <Button
              variant="ghost"
              size="icon"
              onClick={() => togglePlanForm(true)}
            >
              <Edit className="size-5" />
            </Button>,
            document.getElementById("headerActions")!
          )}
          <div className="sticky top-0 left-0 py-2 bg-white z-[1] pr-8 flex flex-col gap-1">
            <div className="flex justify-between font-medium text-muted-foreground text-xs">
              <p>Estimated:</p>
              <p className="text-right">
                <Currency>{estimatedAmount}</Currency>
              </p>
            </div>
            <div className="flex justify-between font-medium">
              <p>Actual:</p>
              <p className="text-right">
                <Currency>{actualAmount}</Currency>
              </p>
            </div>
          </div>
          <BudgetFormDrawer
            planId={plan.id}
            budget={activeBudget}
            onSuccess={() => refetchBudgets()}
            onToggle={(open) => {
              if (!open) setActiveBudget(undefined);
            }}
          >
            {({ toggle: toggleBudgetForm }) => (
              <BudgetList
                isLoading={isLoadingBudgets}
                isLoadingActualAmount={isLoadingBudgetAmount}
                toggleForm={toggleBudgetForm}
                selectBudget={setActiveBudget}
                budgetMap={budgetsActualAmount?.data}
                budgets={budgets ?? undefined}
                onRefetchActualAmount={refetchBudgetsActualAmount}
                onDeleted={() => refetchBudgets()}
              />
            )}
          </BudgetFormDrawer>
        </>
      )}
    </PlanFormDrawer>
  );
};

export default PlanDetailPage;
