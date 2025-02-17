import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  ...prefix("auth", [
    layout("routes/auth/_layout.tsx", [
      route("login", "routes/auth/login.tsx"),
      route("register", "routes/auth/signup.tsx"),
    ]),
  ]),
  layout("routes/_app-layout.tsx", [
    layout("routes/protected.tsx", [
      route("settings", "routes/settings/index.tsx"),
      layout("routes/ensure-settings.tsx", [
        index("routes/home.tsx"),
        ...prefix("plans", [
          route(":id", "routes/plans/detail/index.tsx"),
        ]),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
