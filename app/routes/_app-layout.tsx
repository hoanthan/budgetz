import { isRouteErrorResponse, Outlet, useNavigate } from "react-router";
import type { Route } from "./+types/_app-layout";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { useRoute } from "~/store/route";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { isServer } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useMount } from "@reactuses/core";

const AppLayout = () => {
  const navigate = useNavigate();
  const currentPageTitle = useRoute((state) => state.pageTitle);

  const mainContainer = useRef<HTMLDivElement>(null);

  const [mainHeight, setMainHeight] = useState<number>();

  const canGoBack = isServer ? false : window.location.pathname !== "/";

  useMount(() => {
    setMainHeight(mainContainer.current?.clientHeight);
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-dvh overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white z-[1]">
          <SidebarTrigger className="-ml-1" />
          <div className="grow flex items-center">
            {canGoBack ? (
              <Button
                className="-ml-4"
                variant="ghost"
                size="icon"
                onClick={() =>
                  window.history.state.idx > 0 ? navigate(-1) : navigate("/")
                }
              >
                <ChevronLeft />
              </Button>
            ) : null}
            {currentPageTitle ? <h2>{currentPageTitle}</h2> : null}
          </div>
          <div
            id="headerActions"
            className="shrink-0 flex items-center gap-2"
          ></div>
        </header>
        <ScrollArea
          ref={mainContainer}
          className="relative grow flex flex-col gap-4 px-4 pb-24"
          style={{
            height: mainHeight,
          }}
        >
          <Outlet />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;

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
