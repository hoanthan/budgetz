import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface RouteState {
  pageTitle: string | null
}

const initialState: RouteState = {
  pageTitle: null
}

export const useRoute = create(
  devtools(
    immer(
      combine(
        initialState,
        (set) => ({
          setPageTitle: (title: string | null) => {
            set(state => {
              state.pageTitle = title
            }, undefined, { type: 'setPageTitle' })
          }
        })
      )
    ),
    {
      name: 'Route'
    }
  )
)