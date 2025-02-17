import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { usePageTitle } from "~/hooks/use-page-title";
import { supabase } from "~/supabase";
import { FaPlus, FaSpinner } from "react-icons/fa6";
import { PlanFormDrawer } from "~/components/plan/plan-form-drawer";
import { useState } from "react";
import { useDebounce } from "@reactuses/core";
import { Tables } from "supabase/database.types";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import PageSkeleton from "~/components/page-skeleton";

export default function HomePage() {
  usePageTitle("Budgetz");
  const [search, setSearch] = useState("");
  const [activePlan, setActivePlan] = useState<Tables<"plans">>();

  const searchText = useDebounce(search, 400);

  const {
    data: plans,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["home", "plans", searchText],
    queryFn: async () =>
      await supabase
        .from("plans")
        .select("*", {
          count: "exact",
        })
        .order("created_at", {
          ascending: false,
        })
        .order("end", {
          ascending: false,
          nullsFirst: true,
        })
        .ilike("name", `%${searchText}%`),
  });

  const {
    mutate: deletePlan,
    isPending: isDeleting,
    variables: deletingPlanId,
  } = useMutation({
    mutationKey: ["deletePlan"],
    mutationFn: async (id: string) =>
      await supabase.from("plans").delete().eq("id", id),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success("Deleted");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const renderItemActions = (
    plan: Tables<"plans">,
    togglePlanForm: (open: boolean) => void
  ) => {
    return (
      <TrailingActions>
        <SwipeAction
          onClick={() => {
            setActivePlan(plan);
            togglePlanForm(true);
          }}
          Tag="div"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-full px-2 text-center flex items-center justify-center font-medium select-none"
          >
            <Edit className="size-5" />
          </Button>
        </SwipeAction>
        <SwipeAction onClick={() => deletePlan(plan.id)} Tag="div">
          <Button
            variant="ghost"
            size="icon"
            className="h-full px-2 text-destructive text-center flex items-center justify-center font-medium select-none"
          >
            <Trash className="size-5" />
          </Button>
        </SwipeAction>
      </TrailingActions>
    );
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <PlanFormDrawer
      plan={activePlan}
      onSuccess={() => refetch()}
      onToggle={(opened) => {
        if (!opened) setActivePlan(undefined);
      }}
    >
      {({ toggle: togglePlanForm }) => (
        <div className="flex flex-col gap-6 py-4">
          <Button
            size="icon-lg"
            className="fixed bottom-12 right-6 rounded-full w-10 h-10"
            onClick={() => togglePlanForm(true)}
          >
            <FaPlus />
          </Button>
          <div className="shrink-0">
            <Input
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <SwipeableList className="grow grid" type={Type.IOS}>
            {plans?.data?.map((plan) => (
              <SwipeableListItem
                key={plan.id}
                trailingActions={renderItemActions(plan, togglePlanForm)}
                className="w-full"
              >
                <Link
                  to={`/plans/${plan.id}`}
                  className="border-b border-gray-300 last:border-b-0 border-solid w-full h-full aria-disabled:pointer-events-none"
                  aria-disabled={deletingPlanId === plan.id && isDeleting}
                >
                  <div className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium grow">{plan.name}</p>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between items-center">
                          <div className="grow flex gap-2">
                            <p>
                              {plan.start ? (
                                <span>
                                  {format(new Date(plan.start), "LLL dd, y")}
                                </span>
                              ) : null}
                              {plan.end ? (
                                <>
                                  {" "}
                                  -{" "}
                                  <span>
                                    {format(new Date(plan.end), "LLL dd, y")}
                                  </span>
                                </>
                              ) : null}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {deletingPlanId === plan.id && isDeleting ? (
                        <p className="text-destructive flex items-center gap-1 text-xs">
                          Deleting <FaSpinner className="animate-spin" />
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </SwipeableListItem>
            ))}
          </SwipeableList>
        </div>
      )}
    </PlanFormDrawer>
  );
}
