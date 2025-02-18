import { sumBy } from "lodash-es";
import { MoveDownLeft, MoveUpRight } from "lucide-react";
import { useMemo } from "react";
import { Tables } from "supabase/database.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
    <Accordion
      type="multiple"
      className="sticky top-0 left-0 py-2 bg-white z-[1]"
    >
      <AccordionItem value="estimated" className="border-0">
        <AccordionTrigger className="w-full py-1 items-center">
          <div className="w-full flex justify-between items-center text-sm">
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
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col items-end text-xs pr-8">
            <p className="text-green-600 flex gap-1 items-center">
              <MoveDownLeft size={12} />{" "}
              <Currency style="decimal">{estimatedInAmount}</Currency>
            </p>
            <p className="text-destructive flex gap-1 items-center">
              <MoveUpRight size={12} />{" "}
              <Currency style="decimal">{estimatedOutAmount}</Currency>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="actual" className="border-0">
        <AccordionTrigger className="w-full py-1 items-center">
          <div className="w-full flex justify-between items-center text-sm">
            <p className="text-muted-foreground">Actual</p>
            <p
              className={cn({
                "text-destructive": actualBalance < 0,
                "text-green-600": actualBalance > 0,
              })}
            >
              <Currency>{actualBalance}</Currency>
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col items-end text-xs pr-8">
            <p className="text-green-600 flex gap-1 items-center">
              <MoveDownLeft size={12} />{" "}
              <Currency style="decimal">{actualInAmount}</Currency>
            </p>
            <p className="text-destructive flex gap-1 items-center">
              <MoveUpRight size={12} />{" "}
              <Currency style="decimal">{actualOutAmount}</Currency>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PlanSummary;
