import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Tables } from "supabase/database.types";

interface SettingState {
  settings: Tables<"settings"> | null;
}

const initialState: SettingState = {
  settings: null,
};

export const useSettings = create(
  devtools(
    immer(
      combine(
        initialState,
        (set) => ({
          setSettings: (settings: SettingState["settings"]) => {
            set(
              (state) => {
                state.settings = settings;
              },
              undefined,
              { type: "setSettings" },
            );
          },
        }),
      ),
    ),
    { name: "Settings" },
  ),
);
