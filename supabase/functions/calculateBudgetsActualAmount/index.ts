// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allow all origins (use specific domain for security)
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allowed methods
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, apikey, x-client-info", // Allowed headers
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Get the session or user object
  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data: userData } = await supabaseClient.auth.getUser(token);

  if (!userData?.user) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Unauthenticated",
        },
      }),
      { headers: { "Content-Type": "application/json" }, status: 401 },
    );
  }

  const { budgetIds } = await req.json() as { budgetIds: number[] };

  const { data, error } = await supabaseClient.from("transactions")
    .select()
    .in("budget_id", budgetIds);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers,
      status: 500,
    });
  }

  const result =
    data?.reduce((map: Record<number, number>, transaction: any) => {
      map[transaction.budget_id] = map[transaction.budget_id] ?? 0;
      map[transaction.budget_id] += transaction.amount;

      return map;
    }, {}) ?? {};

  return new Response(
    JSON.stringify(result),
    {
      headers,
    },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/calculateBudgetsActualAmount' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
