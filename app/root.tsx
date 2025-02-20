import "reflect-metadata";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { supabase } from "./supabase";
import { useEffect } from "react";
import ActivityIndicator from "./components/activity-indicator";
import { useAuth } from "./store/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./app.css";
import { useSettings } from "./store/settings";
import { Toaster } from "./components/ui/sonner";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "manifest",
    href: "/manifest.json",
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Budgetz" },
    { name: "description", content: "Manage your budgetz!" },
    { name: "google-adsense-account", content: "ca-pub-3276323583222726" },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="robots" content="noindex" />
        <Meta />
        <Links />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body {
              width: 100vw;
              height: 100vh;
              overflow-y: auto;
              overflow-x: hidden;
              overscroll-behavior-y: none;
              caret-color: transparent;
            }
            input {
              caret-color: auto;
            }
            * {
              overscroll-behavior-y: none;
            }
          `,
          }}
        />
      </head>
      <body className="z-0">
        <div
          id="floatingActions"
          className="fixed z-10 bottom-12 right-6 flex flex-col gap-2"
        />
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        </QueryClientProvider>
        <Toaster position="top-center" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const setInitialized = useAuth((state) => state.setInitialized);
  const setSession = useAuth((state) => state.setSession);
  const isAuthInitialized = useAuth((state) => state.isInitialized);
  const setSettings = useSettings((state) => state.setSettings);

  useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const authSession = await supabase.auth
        .getSession()
        .then((res) => res.data.session);

      setSession(authSession ?? null);

      if (authSession) {
        const res = await supabase
          .from("settings")
          .select()
          .eq("user_id", authSession!.user.id)
          .maybeSingle();

        setSettings(res.data);
      }

      setInitialized(true);

      return authSession;
    },
  });

  if (!isAuthInitialized)
    return (
      <div className="fixed top-0 left-0 w-screen h-screen z-[1] bg-white">
        <ActivityIndicator />
      </div>
    );

  return (
    <>
      <Outlet />
    </>
  );
}

export function HydrateFallback() {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[1] bg-white">
      <ActivityIndicator />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
