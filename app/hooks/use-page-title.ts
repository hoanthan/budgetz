import { useEffect } from "react";
import { useRoute } from "~/store/route";

export function usePageTitle(title?: string) {
  const setPageTitle = useRoute(state => state.setPageTitle)

  useEffect(() => {
    setPageTitle(title ?? null)

    return () => {
      setPageTitle(null)
    }
  }, [title])
}