import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useMutation } from "@tanstack/react-query";
import { IsDefined, IsIn, IsString } from "class-validator";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import ErrorMessage from "~/components/form/error-message";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { Label } from "~/components/ui/label";
import { CURRENCIES } from "~/constants/currency";
import { usePageTitle } from "~/hooks/use-page-title";
import { useSettings } from "~/store/settings";
import { supabase } from "~/supabase";

class SettingsData {
  @IsDefined()
  @IsString()
  @IsIn(Object.keys(CURRENCIES))
  currency: string;
}

const SettingsPage = () => {
  usePageTitle("Settings");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const settings = useSettings((state) => state.settings);
  const setSettings = useSettings((state) => state.setSettings);

  const { handleSubmit, control, formState } = useForm<SettingsData>({
    resolver: classValidatorResolver(SettingsData),
    defaultValues: settings ?? undefined,
  });

  const { mutate: save, isPending } = useMutation({
    mutationKey: ["updateSettings"],
    mutationFn: async (data: SettingsData) => {
      return await supabase
        .from("settings")
        .upsert({
          ...data,
          id: settings?.id,
        })
        .select();
    },
    onSuccess: (res) => {
      toast.success("Settings saved!");
      setSettings(res.data?.[0] ?? null);
      if (searchParams.get("callback")) {
        navigate(searchParams.get("callback")!);
      }
    },
  });

  const onSubmit = useCallback((data: SettingsData) => {
    save(data);
  }, []);

  return (
    <form
      className="flex flex-col gap-4 py-2"
      onSubmit={handleSubmit(onSubmit)}
    >
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
            />
            <ErrorMessage formState={formState} name="currency" />
          </div>
        )}
      />
      <div className="flex justify-end items-center">
        <Button loading={isPending}>Save</Button>
      </div>
    </form>
  );
};

export default SettingsPage;
