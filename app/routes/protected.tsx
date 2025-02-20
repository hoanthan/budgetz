import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/store/auth";

const ProtectedRoute = () => {
  const isAuthInitialized = useAuth((state) => state.isInitialized);
  const session = useAuth((state) => state.session);

  if (isAuthInitialized && !session) return <Navigate to="/auth/login" />;

  return <Outlet />;
};

export default ProtectedRoute;
