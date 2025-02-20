import { Edit, MoveDownLeft, MoveUpRight, Trash } from "lucide-react";
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
import "./styles.css";
import "react-swipeable-list/dist/styles.css";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "~/supabase";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { Badge } from "~/components/ui/badge";

type BudgetListProps = {
  plan: Tables<"plans">;
  isLoading: boolean;
  budgets?: Array<
    Tables<"budgets"> & { transactions: Tables<"transactions">[] }
  >;
  budgetMap?: Record<number, number>;
  isLoadingActualAmount: boolean;
  onRefetchActualAmount?: () => void;
  selectBudget?: (budget: Tables<"budgets">) => void;
  toggleForm: (val: boolean) => void;
  onDeleted?: (id: number) => void;
};

const BudgetList: React.FC<BudgetListProps> = ({
  isLoading,
  plan,
  budgets,
  toggleForm,
  onDeleted,
  selectBudget,
  isLoadingActualAmount,
  budgetMap,
  onRefetchActualAmount,
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
        <SwipeAction
          onClick={() => {
            selectBudget?.(budget);
            toggleForm(true);
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="m-auto px-2 text-center flex items-center justify-center font-medium select-none"
          >
            <Edit className="size-5" />
          </Button>
        </SwipeAction>
        <SwipeAction onClick={() => deleteBudget(budget.id)} Tag="div">
          <Button
            variant="ghost"
            size="icon"
            className="m-auto px-2 text-destructive text-center flex items-center justify-center font-medium select-none"
          >
            <Trash className="size-5" />
          </Button>
        </SwipeAction>
      </TrailingActions>
    );
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
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
        plan.type === "plan" ? (
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
                      className="budget-list-item"
                    >
                      <AccordionTrigger className="w-full">
                        <div className="flex w-full justify-between">
                          <div>
                            <p className="grow">{budget.name}</p>
                            {budget.type === "in" ? (
                              <Badge className="mt-1 text-xs flex gap-1 items-center">
                                <MoveDownLeft size={12} /> Income
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="mt-1 text-xs flex gap-1 items-center"
                              >
                                <MoveUpRight /> Expense
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {isDeletingBudget &&
                            deletingBudgetId === budget.id ? (
                              <p className="text-destructive flex items-center gap-1 text-xs">
                                Deleting <FaSpinner className="animate-spin" />
                              </p>
                            ) : (
                              <>
                                <p>
                                  <Currency>{budget.amount}</Currency>
                                </p>
                                <p className="text-muted-foreground font-normal flex items-center justify-end text-right">
                                  actual:{" "}
                                  {isLoadingActualAmount ? (
                                    <FaSpinner className="animate-spin ml-2" />
                                  ) : (
                                    <Currency>{actualAmount}</Currency>
                                  )}
                                </p>
                              </>
                            )}
                          </div>
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
        ) : (
          <SwipeableList type={Type.IOS}>
            {budgets.map((budget) => {
              return (
                <SwipeableListItem
                  trailingActions={renderItemActions(budget)}
                  className="budget-list-item"
                >
                  <div className="flex w-full justify-between">
                    <div>
                      <p className="grow">{budget.name}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      {isDeletingBudget && deletingBudgetId === budget.id ? (
                        <p className="text-destructive flex items-center gap-1 text-xs">
                          Deleting <FaSpinner className="animate-spin" />
                        </p>
                      ) : (
                        <>
                          <p>
                            <Currency>{budget.amount}</Currency>
                          </p>
                          {budget.type === "in" ? (
                            <Badge className="mt-1 text-xs flex gap-1 items-center">
                              <MoveDownLeft size={12} /> Income
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs flex gap-1 items-center"
                            >
                              <MoveUpRight /> Expense
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </SwipeableListItem>
              );
            })}
          </SwipeableList>
        )
      ) : null}
      {createPortal(
        <Button
          size="icon-lg"
          className="rounded-full w-10 h-10"
          onClick={() => toggleForm(true)}
        >
          <FaPlus />
        </Button>,
        document.getElementById("floatingActions")!
      )}
    </div>
  );
};

export default BudgetList;
