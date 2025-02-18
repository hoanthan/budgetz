import { Tables } from "supabase/database.types";
import { Button } from "../ui/button";
import TransactionFormDrawer from "../transaction/transaction-form-drawer";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "~/supabase/index";
import { Skeleton } from "../ui/skeleton";
import Currency from "../ui/currency";
import { formatDate } from "~/lib/utils";
import { Edit, Trash } from "lucide-react";
import { orderBy } from "lodash-es";
import { toast } from "sonner";

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
      await supabase
        .from("transactions")
        .select()
        .eq("budget_id", budget.id)
        .order("created_at"),
    select: (res) => res.data,
    initialData: {
      data: orderBy(
        budget.transactions,
        (transaction) => transaction.created_at,
        "asc"
      ),
      error: null,
      count: null,
      status: 200,
      statusText: "",
    },
  });

  const {
    mutate: deleteTransaction,
    isPending: isDeletingTransaction,
    variables: deletingTransactionId,
  } = useMutation({
    mutationKey: ["deleteTransaction"],
    mutationFn: async (id: number) =>
      await supabase.from("transactions").delete().eq("id", id),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success("Deleted transaction");
      refetchTransactions();
      onRefetchActualAmount?.();
    },
    onError: (err) => {
      toast.error(err.message);
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
                  <div>
                    <p className="shrink-0 text-right">
                      <Currency>{transaction.amount}</Currency>
                    </p>
                    <div className="flex gap-2 justify-end items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="m-0 px-2 text-center flex items-center justify-center font-medium select-none"
                        onClick={() => {
                          setActiveTransaction(transaction);
                          toggleTransactionForm(true);
                        }}
                      >
                        <Edit />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="m-0 px-2 text-destructive text-center flex items-center justify-center font-medium select-none"
                        onClick={() => {
                          deleteTransaction(transaction.id);
                        }}
                        loading={
                          isDeletingTransaction &&
                          deletingTransactionId === transaction.id
                        }
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
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
