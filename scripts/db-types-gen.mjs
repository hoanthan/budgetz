import { spawn } from 'child_process'
import dotenv from 'dotenv'
dotenv.config()

spawn(
  `supabase gen types typescript --project-id ${process.env.VITE_SUPABASE_PROJECT_ID} > supabase/database.types.ts`,
  {
    cwd: process.cwd(),
    shell: true
  }
)