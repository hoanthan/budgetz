import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { combine, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface AuthState {
  session: Session | null
  isInitialized: boolean
}

const initialState: AuthState = {
  session: null,
  isInitialized: false
}

export const useAuth = create(
  devtools(
    immer(
      combine(initialState, (set) => ({
        setSession: (session: Session | null) => {
          set(state => {
            state.session = session
          }, undefined, {type: 'setSession'})
        },
        setInitialized: (value: boolean) => {
          set(state => {
            state.isInitialized = value
          }, undefined, { type: 'setInitialized' })
        }
      }))
    ),
    {
      name: 'Auth'
    }
  )
)