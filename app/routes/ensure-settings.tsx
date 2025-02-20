import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/store/auth";
import { useSettings } from "~/store/settings";

const EnsureSettings = () => {
  const isAuthInitialized = useAuth((state) => state.isInitialized);
  const settings = useSettings((state) => state.settings);

  if (isAuthInitialized && !settings)
    return (
      <Navigate
        to={`/settings?callback=${
          window.location.pathname + window.location.search
        }`}
      />
    );

  return <Outlet />;
};

export default EnsureSettings;
