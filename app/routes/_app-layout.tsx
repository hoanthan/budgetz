import { isRouteErrorResponse, Outlet } from "react-router";
import type { Route } from "./+types/_app-layout";
import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { useRoute } from "~/store/route";
import { ScrollArea } from "~/components/ui/scroll-area";

const AppLayout = () => {
  const currentPageTitle = useRoute(state => state.pageTitle)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white z-[1]">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          {currentPageTitle ? <h2>{currentPageTitle}</h2> : null}
        </header>
        <ScrollArea className="relative flex h-full flex-col gap-4 p-4 pb-24">
          <Outlet />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AppLayout

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