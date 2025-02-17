import { Trash } from "lucide-react";
import { FaPlus, FaSpinner } from "react-icons/fa6";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type,
} from "react-swipeable-list";
import { Tables } from "supabase/database.types";
import BudgetSummary from "~/components/budget/budget-summary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import Currency from "~/components/ui/currency";
import { Skeleton } from "~/components/ui/skeleton";
import styles from "./styles.module.css";
import "react-swipeable-list/dist/styles.css";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "~/supabase";
import { toast } from "sonner";

type BudgetListProps = {
  isLoading: boolean;
  budgets?: Array<
    Tables<"budgets"> & { transactions: Tables<"transactions">[] }
  >;
  budgetMap?: Record<number, number>;
  isLoadingActualAmount: boolean;
  onRefetchActualAmount?: () => void;
  toggleForm: (val: boolean) => void;
  onDeleted?: (id: number) => void;
};

const BudgetList: React.FC<BudgetListProps> = ({
  isLoading,
  budgetMap,
  budgets,
  isLoadingActualAmount,
  toggleForm,
  onRefetchActualAmount,
  onDeleted,
}) => {
  const {
    mutate: deleteBudget,
    isPending: isDeletingBudget,
    variables: deletingBudgetId,
  } = useMutation({
    mutationKey: ["deleteBudget"],
    mutationFn: async (id: number) =>
      await supabase.from("budgets").delete().eq("id", id),
    onSuccess: (res, id) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success("Deleted");
      onDeleted?.(id);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const renderItemActions = (budget: Tables<"budgets">) => {
    return (
      <TrailingActions>
        <SwipeAction onClick={() => deleteBudget(budget.id)} Tag="div">
          <div
            role="button"
            className="h-full px-2 text-destructive text-center flex items-center justify-center font-medium select-none"
          >
            <Trash />
          </div>
        </SwipeAction>
      </TrailingActions>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : null}
      {budgets ? (
        <Accordion type="single" asChild collapsible>
          <SwipeableList type={Type.IOS}>
            {budgets.map((budget) => {
              const actualAmount = budgetMap?.[budget.id] ?? 0;

              return (
                <AccordionItem
                  key={budget.id}
                  value={budget.id.toString()}
                  asChild
                >
                  <SwipeableListItem
                    trailingActions={renderItemActions(budget)}
                    className={styles.listItem}
                  >
                    <AccordionTrigger className="w-full">
                      <p className="grow">{budget.name}</p>
                      <div className="text-right">
                        {isDeletingBudget && deletingBudgetId === budget.id ? (
                          <p className="text-destructive flex items-center gap-1 text-xs">
                            Deleting <FaSpinner className="animate-spin" />
                          </p>
                        ) : (
                          <>
                            <p>
                              <Currency>
                                {budget.type === "in"
                                  ? budget.amount
                                  : budget.amount * -1}
                              </Currency>
                            </p>
                            <p className="text-muted-foreground font-normal flex items-center">
                              actual:{" "}
                              {isLoadingActualAmount ? (
                                <FaSpinner className="animate-spin ml-2" />
                              ) : (
                                <Currency>
                                  {budget.type === "in"
                                    ? actualAmount
                                    : actualAmount * -1}
                                </Currency>
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-gray-100 border-solid">
                      <BudgetSummary
                        budget={budget}
                        onRefetchActualAmount={onRefetchActualAmount}
                      />
                    </AccordionContent>
                  </SwipeableListItem>
                </AccordionItem>
              );
            })}
          </SwipeableList>
        </Accordion>
      ) : null}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-10 h-10"
        onClick={() => toggleForm(true)}
      >
        <FaPlus />
      </Button>
    </div>
  );
};

export default BudgetList;
