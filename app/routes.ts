import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  ...prefix("auth", [
    layout("routes/auth/_layout.tsx", [
      route("login", "routes/auth/login.tsx"),
      route("register", "routes/auth/signup.tsx")
    ])
  ]),
  layout('routes/_app-layout.tsx', [
    layout('routes/protected.tsx', [
      route('settings', 'routes/settings/index.tsx'),
      layout('routes/ensure-settings.tsx', [
        index('routes/home.tsx'),
        ...prefix('plans', [
          route('new', 'routes/plans/new.tsx')
        ]),
      ])
    ])
  ])
] satisfies RouteConfig;
