import { useEffect } from "react"
import { Outlet } from "react-router"
import { useAuth } from "~/store/auth"
import { useSettings } from "~/store/settings"

const EnsureSettings = () => {
  const isAuthInitialized = useAuth(state => state.isInitialized)
  const settings = useSettings(state => state.settings)

  useEffect(() => {
    if (isAuthInitialized && !settings) window.location.assign(`/settings?callback=${window.location.pathname + window.location.search}`)
  }, [isAuthInitialized, settings])

  if (!isAuthInitialized || !settings) return null

  return (
    <Outlet />
  )
}

export default EnsureSettings