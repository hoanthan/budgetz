import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { usePageTitle } from "~/hooks/use-page-title"
import { supabase } from "~/supabase"
import { FaPlus } from 'react-icons/fa6'
import { PlanFormDrawer } from "~/components/plan-form-drawer"

export default function HomePage() {
  usePageTitle('Budgetz')

  const { data: plans, refetch } = useQuery({
    queryKey: ['home', 'plans'],
    queryFn: async () => await supabase.from('plans').select('*', {
      count: 'exact'
    })
  })

  return (
    <div className="flex flex-col gap-6">
      <PlanFormDrawer onSuccess={() => refetch()}>
        <Button className="fixed bottom-6 right-6 rounded-full w-10 h-10"><FaPlus /></Button>
      </PlanFormDrawer>
      <div className="shrink-0">
        <Input placeholder="Search plans..." />
      </div>
      <div className="grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans?.data?.map(plan => (
          <Link key={plan.id} to={`/plans/${plan.id}`}>
            <Card>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <div className="flex justify-between items-center">
                    <div className="grow flex gap-2">
                      <p>
                        {plan.start ? <span>{format(new Date(plan.start), 'LLL dd, y')}</span> : null}
                        {plan.end ? <> - <span>{format(new Date(plan.end), 'LLL dd, y')}</span></> : null}
                      </p>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
