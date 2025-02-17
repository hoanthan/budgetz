import { Tables } from "supabase/database.types";
import { Button } from "../ui/button";
import TransactionFormDrawer from "../transaction/transaction-form-drawer";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/supabase/index";
import { Skeleton } from "../ui/skeleton";
import Currency from "../ui/currency";
import { formatDate } from "~/lib/utils";

const BudgetSummary: React.FC<{
  budget: Tables<"budgets"> & {
    transactions: Tables<"transactions">[];
  };
  onRefetchActualAmount?: () => void;
}> = ({ budget, onRefetchActualAmount }) => {
  const [activeTransaction, setActiveTransaction] =
    useState<Tables<"transactions">>();

  const {
    data: transactions,
    isLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["transactions", { budget: budget.id }],
    queryFn: async () =>
      await supabase.from("transactions").select().eq("budget_id", budget.id),
    select: (res) => res.data,
    initialData: {
      data: budget.transactions,
      error: null,
      count: null,
      status: 200,
      statusText: "",
    },
  });

  return (
    <TransactionFormDrawer
      budgetId={budget.id}
      transaction={activeTransaction}
      onSuccess={() => {
        refetchTransactions();
        onRefetchActualAmount?.();
      }}
      onToggle={(open) => {
        if (!open) setActiveTransaction(undefined);
      }}
    >
      {({ toggle: toggleTransactionForm }) => (
        <div className="flex flex-col gap-2 pt-2">
          <p className="text-muted-foreground text-xs">Transactions</p>
          <div className="text-accent-foreground flex flex-col gap-2">
            {isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last-of-type:border-b-0 pr-8"
                >
                  <div className="grow">
                    <p>{transaction.name}</p>
                    <small className="text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </small>
                  </div>
                  <p className="shrink-0">
                    <Currency>
                      {budget.type === "in"
                        ? transaction.amount
                        : transaction.amount * -1}
                    </Currency>
                  </p>
                </div>
              ))
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleTransactionForm(true)}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </TransactionFormDrawer>
  );
};

export default BudgetSummary;
