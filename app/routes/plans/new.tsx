import PlanForm from "~/components/form/plan-form"
import { usePageTitle } from "~/hooks/use-page-title"

const NewPlanPage = () => {
  usePageTitle('Create new plan')

  return (
    <PlanForm />
  )
}

export default NewPlanPage