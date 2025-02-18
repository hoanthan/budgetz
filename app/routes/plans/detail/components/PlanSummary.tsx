import { sumBy } from "lodash-es";
import { MoveDownLeft, MoveUpRight } from "lucide-react";
import { useMemo } from "react";
import { Tables } from "supabase/database.types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import Currency from "~/components/ui/currency";
import { cn } from "~/lib/utils";

const PlanSummary: React.FC<{
  budgets?: Tables<"budgets">[];
  budgetsActualAmount?: Record<number, number>;
}> = ({ budgets, budgetsActualAmount }) => {
  const estimatedOutAmount = useMemo(() => {
    return sumBy(
      budgets?.filter((budget) => budget.type === "out"),
      (budget) => budget.amount
    );
  }, [budgets]);

  const estimatedInAmount = useMemo(() => {
    return sumBy(
      budgets?.filter((budget) => budget.type === "in"),
      (budget) => budget.amount
    );
  }, [budgets]);

  const actualOutAmount = useMemo(() => {
    return sumBy(
      budgets?.filter((budget) => budget.type === "out"),
      (budget) => {
        const amount = budgetsActualAmount?.[budget.id] ?? 0;
        return amount;
      }
    );
  }, [budgets, budgetsActualAmount]);

  const actualInAmount = useMemo(() => {
    return sumBy(
      budgets?.filter((budget) => budget.type === "in"),
      (budget) => {
        const amount = budgetsActualAmount?.[budget.id] ?? 0;
        return amount;
      }
    );
  }, [budgets, budgetsActualAmount]);

  const estimatedBalance = useMemo(() => {
    return estimatedInAmount - estimatedOutAmount;
  }, [estimatedInAmount, estimatedOutAmount]);

  const actualBalance = useMemo(() => {
    return actualInAmount - actualOutAmount;
  }, [actualInAmount, actualOutAmount]);

  return (
    <Collapsible className="sticky top-0 left-0 py-2 bg-white z-[1] pr-8 flex flex-col gap-1">
      <CollapsibleTrigger asChild>
        <div className="grid grid-cols-2 text-xs" role="button">
          <div>
            <p className="text-muted-foreground">Estimated</p>
            <p
              className={cn({
                "text-destructive": estimatedBalance < 0,
                "text-green-600": estimatedBalance > 0,
              })}
            >
              <Currency>{estimatedBalance}</Currency>
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Actual</p>
            <p
              className={cn({
                "text-destructive": actualBalance < 0,
                "text-green-600": actualBalance > 0,
              })}
            >
              <Currency>{actualInAmount - actualOutAmount}</Currency>
            </p>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 text-xs">
          <div>
            <p className="text-green-600 flex gap-1 items-center">
              <Currency style="decimal">{estimatedInAmount}</Currency>{" "}
              <MoveDownLeft size={12} />
            </p>
            <p className="text-destructive flex gap-1 items-center">
              <Currency style="decimal">{estimatedOutAmount}</Currency>{" "}
              <MoveUpRight size={12} />
            </p>
          </div>
          <div className="text-right">
            <p className="text-green-600 flex gap-1 items-center justify-end">
              <MoveDownLeft size={12} />{" "}
              <Currency style="decimal">{actualInAmount}</Currency>
            </p>
            <p className="text-destructive flex gap-1 items-center justify-end">
              <MoveUpRight size={12} />{" "}
              <Currency style="decimal">{actualOutAmount}</Currency>
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PlanSummary;
