import { formatCurrency } from "~/lib/utils"
import { useSettings } from "~/store/settings"

const Currency: React.FC<{ children: number } & Intl.NumberFormatOptions> = ({ children, ...options }) => {
  const currency = useSettings(state => state.settings?.currency)

  if (!currency) return children

  return formatCurrency(children, {
    currency,
    ...options
  })
}

export default Currency