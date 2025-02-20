import {
  IsDate,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Input } from "../ui/input";
import { CURRENCIES } from "~/constants/currency";
import { Controller, useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Label } from "../ui/label";
import { Combobox } from "../ui/combobox";
import ErrorMessage from "./error-message";
import { useSettings } from "~/store/settings";
import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { Type } from "class-transformer";
import { DateRangePicker } from "../ui/daterange-picker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "~/supabase";
import { omit } from "lodash-es";
import { toast } from "sonner";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { Tables } from "supabase/database.types";
import { useDebounceFn } from "@reactuses/core";

class DateRangeDTO {
  @IsDefined()
  @IsDate()
  from: Date;

  @IsDefined()
  @IsDate()
  to: Date;
}

class PlanFormData {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsString()
  @IsIn(Object.keys(CURRENCIES))
  currency: string;

  @IsOptional()
  @Type(() => DateRangeDTO)
  @ValidateNested()
  range?: DateRange;

  @IsOptional()
  @IsString()
  templateId?: string;
}

const PlanForm: React.FC<{
  onSuccess?: (plan: Tables<"plans">) => void;
  onCancel?: () => void;
  initialData?: Tables<"plans">;
  type?: Tables<"plans">["type"];
}> = ({ onSuccess, onCancel, initialData, type = "plan" }) => {
  const settings = useSettings((state) => state.settings);

  const [templateSearch, setTemplateSearch] = useState("");

  const { data: templates } = useQuery({
    queryKey: ["template", templateSearch],
    queryFn: async () =>
      await supabase
        .from("plans")
        .select("id, name")
        .eq("type", "template")
        .ilike("name", `%${templateSearch}%`)
        .limit(20),
    select: (res) =>
      res.data?.map((template) => ({
        value: template.id,
        label: template.name,
      })),
  });

  const { handleSubmit, control, formState, register } = useForm<PlanFormData>({
    resolver: classValidatorResolver(PlanFormData),
    defaultValues: {
      currency: settings?.currency,
      ...initialData,
      range: {
        from: initialData?.start
          ? new Date(initialData.start)
          : startOfMonth(new Date()),
        to: initialData?.end
          ? new Date(initialData.end)
          : endOfMonth(new Date()),
      },
    },
  });

  const { mutate: create, isPending } = useMutation({
    mutationKey: ["upsertPlan"],
    mutationFn: async (data: PlanFormData) =>
      supabase
        .from("plans")
        .upsert({
          ...omit(data, "range", "templateId"),
          start:
            type === "plan" && data.range?.from
              ? startOfDay(data.range.from).toISOString()
              : null,
          end:
            type === "plan" && data.range?.to
              ? endOfDay(data.range.to).toISOString()
              : null,
          type,
        })
        .select()
        .then(async (res) => {
          const plan = res.data?.[0];
          if (data.templateId && plan) {
            const budgets = await supabase
              .from("budgets")
              .select()
              .eq("plan_id", data.templateId)
              .limit(1000);
            if (budgets.data?.length) {
              await supabase.from("budgets").insert(
                budgets.data.map((budget) => ({
                  name: budget.name,
                  type: budget.type,
                  amount: budget.amount,
                  plan_id: plan.id,
                }))
              );
            }
          }

          return res;
        }),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(type === "plan" ? "Plan saved!" : "Template saved!");
      if (!res.data?.[0]) return;
      onSuccess?.(res.data[0]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = useCallback((data: PlanFormData) => {
    create(data);
  }, []);

  const { run: onSearchTemplate } = useDebounceFn((text: string) => {
    setTemplateSearch(text);
  }, 400);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label>Template</Label>
        <Controller
          control={control}
          name="templateId"
          render={({ field }) => (
            <Combobox
              placeholder="Select template..."
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onSearch={onSearchTemplate}
              options={templates}
              commandProps={{
                shouldFilter: false,
              }}
            />
          )}
        />
      </div>
      <div className="grid gap-2">
        <Label>Name</Label>
        <Input
          tabIndex={0}
          placeholder="Name..."
          {...register("name")}
          autoFocus
        />
        <ErrorMessage formState={formState} name="name" />
      </div>
      {type === "plan" ? (
        <Controller
          control={control}
          name="range"
          render={({ field: { name, value, onChange } }) => (
            <div className="grid gap-2">
              <Label>Date range</Label>
              <DateRangePicker
                name={name}
                value={value}
                onChange={onChange}
                tabIndex={1}
              />
              <ErrorMessage formState={formState} name="range.from" />
              <ErrorMessage formState={formState} name="range.to" />
            </div>
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="currency"
        render={({ field: { name, value, onChange } }) => (
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Combobox
              placeholder="Select currency..."
              options={Object.entries(CURRENCIES).map(([key, currency]) => {
                return {
                  value: key,
                  label: `${currency.name} / ${currency.code} (${currency.symbol})`,
                };
              })}
              name={name}
              value={value}
              onChange={onChange}
              tabIndex={2}
            />
            <ErrorMessage formState={formState} name="currency" />
          </div>
        )}
      />
      <div className="flex justify-end items-center gap-4">
        <Button
          tabIndex={4}
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button tabIndex={3} type="submit" loading={isPending}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default PlanForm;
