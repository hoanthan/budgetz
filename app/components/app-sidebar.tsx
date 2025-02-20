import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import { Link, NavLink } from "react-router";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "~/supabase";
import { toast } from "sonner";
import { clearSession } from "~/lib/utils";

type NavItem = {
  title: string;
  url?: string;
  items?: NavItem[];
};

const navItems: NavItem[] = [
  {
    title: "Plans",
    url: "/plans",
  },
  {
    title: "Templates",
    url: "/templates",
  },
  {
    title: "Settings",
    url: "/settings",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { mutate: logout, isPending: isSigningOut } = useMutation({
    mutationKey: ["logout"],
    mutationFn: () =>
      supabase.auth.signOut({
        scope: "local",
      }),
    onSuccess: () => {
      toast.success("Signed out");
      clearSession();
    },
  });

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img
                    className="size-8"
                    src="/favicon.png"
                    alt="Budgetz logo"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Budgetz</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="grow">
          <SidebarMenu>
            {navItems.map((item) => {
              if (item.items) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <p className="font-medium">{item.title}</p>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <SidebarMenuSub>
                        {item.items.map((child) => (
                          <SidebarMenuSubItem key={child.title}>
                            <SidebarMenuSubButton>
                              <NavLink to={child.url ?? "/"} className="w-full">
                                {child.title}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton url={item.url} className="font-medium">
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <Button loading={isSigningOut} onClick={() => logout()}>
            Logout
          </Button>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
