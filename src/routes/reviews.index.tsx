import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type ReviewRow = {
  id: string;
  title: string;
  sprint_label: string;
  team: string | null;
  review_date: string;
  created_at: string;
  item_count: number;
};

export const Route = createFileRoute("/reviews/")({
  head: () => ({
    meta: [
      { title: "Reviews — Sprint Review" },
      { name: "description", content: "All your sprint reviews in one place." },
      { property: "og:title", content: "Reviews — Sprint Review" },
      {
        property: "og:description",
        content: "All your sprint reviews in one place.",
      },
    ],
  }),
  component: ReviewsIndex,
});

async function fetchReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, title, sprint_label, team, review_date, created_at, review_items(count)")
    .order("review_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    sprint_label: r.sprint_label,
    team: r.team,
    review_date: r.review_date,
    created_at: r.created_at,
    item_count:
      (r as unknown as { review_items?: Array<{ count: number }> })
        .review_items?.[0]?.count ?? 0,
  }));
}

function ReviewsIndex() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
  });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← Home
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Sprint reviews
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {reviews?.length ?? 0} review{(reviews?.length ?? 0) === 1 ? "" : "s"} recorded.
          </p>
        </div>
        <NewReviewDialog />
      </div>

      <div className="mt-10 space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {!isLoading && (reviews?.length ?? 0) === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No reviews yet. Create your first one.
            </CardContent>
          </Card>
        )}
        {reviews?.map((r) => (
          <Link
            key={r.id}
            to="/reviews/$reviewId"
            params={{ reviewId: r.id }}
            className="block"
          >
            <Card className="transition-colors hover:border-foreground/30">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg">{r.title}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.sprint_label}
                    {r.team ? ` · ${r.team}` : ""} ·{" "}
                    {new Date(r.review_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {r.item_count} item{r.item_count === 1 ? "" : "s"}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

function NewReviewDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [sprintLabel, setSprintLabel] = useState("");
  const [team, setTeam] = useState("");
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [titleError, setTitleError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          title: title.trim(),
          sprint_label: sprintLabel.trim() || "Sprint",
          team: team.trim() || null,
          review_date: reviewDate,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setOpen(false);
      setTitle("");
      setSprintLabel("");
      setTeam("");
      toast.success("Review created");
      navigate({ to: "/reviews/$reviewId", params: { reviewId: data.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New sprint review</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) {
              setTitleError("Title is required");
              return;
            }
            setTitleError(null);
            mutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q3 checkout revamp — review"
              aria-invalid={!!titleError}
            />
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sprint">Sprint</Label>
              <Input
                id="sprint"
                value={sprintLabel}
                onChange={(e) => setSprintLabel(e.target.value)}
                placeholder="Sprint 42"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team">Team (optional)</Label>
            <Input
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Checkout squad"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
