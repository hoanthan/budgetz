import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { combine, devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { supabase } from "~/supabase";

interface AuthState {
  session: Session | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  session: null,
  isInitialized: false,
};

export const useAuth = create(
  devtools(
    subscribeWithSelector(immer(
      combine(initialState, (set) => ({
        setSession: (session: Session | null) => {
          set(
            (state) => {
              state.session = session;
            },
            undefined,
            { type: "setSession" },
          );
        },
        setInitialized: (value: boolean) => {
          set(
            (state) => {
              state.isInitialized = value;
            },
            undefined,
            { type: "setInitialized" },
          );
        },
      })),
    )),
    {
      name: "Auth",
    },
  ),
);

useAuth.subscribe((state) => state.session, (session) => {
  if (session?.access_token) supabase.functions.setAuth(session.access_token);
});
