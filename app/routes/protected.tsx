import { useEffect } from "react"
import { Outlet } from "react-router"
import { useAuth } from "~/store/auth"

const ProtectedRoute = () => {
  const isAuthInitialized = useAuth(state => state.isInitialized)
  const session = useAuth(state => state.session)

  useEffect(() => {
    if (isAuthInitialized && !session) window.location.assign('/auth/login')
  }, [isAuthInitialized, session])

  if (!isAuthInitialized || !session) return null

  return (
    <Outlet />
  )
}

export default ProtectedRoute