import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type ItemStatus = "done" | "partial" | "blocked";

type Review = {
  id: string;
  title: string;
  sprint_label: string;
  team: string | null;
  review_date: string;
};

type Item = {
  id: string;
  review_id: string;
  title: string;
  author: string;
  description: string | null;
  status: ItemStatus;
  created_at: string;
  review_feedbacks: Feedback[];
};

type Feedback = {
  id: string;
  item_id: string;
  author: string;
  body: string;
  created_at: string;
};

type Decision = {
  id: string;
  review_id: string;
  body: string;
  created_at: string;
};

const statusMeta: Record<ItemStatus, { label: string; className: string }> = {
  done: {
    label: "Done",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  partial: {
    label: "Partial",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-500/15 text-red-700 dark:text-red-400",
  },
};

export const Route = createFileRoute("/reviews/$reviewId")({
  head: ({ loaderData }: { loaderData?: { review: Review | null } }) => ({
    meta: [
      {
        title: loaderData?.review?.title
          ? `${loaderData.review.title} — Sprint Review`
          : "Review — Sprint Review",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, title, sprint_label, team, review_date")
      .eq("id", params.reviewId)
      .maybeSingle();
    if (error) throw error;
    return { review: data };
  },
  component: ReviewDetail,
  errorComponent: ({ error, reset }) => {
    useEffect(() => {
      reportLovableError(error, { boundary: "reviews.$reviewId" });
    }, [error]);
    return (
      <div className="mx-auto max-w-2xl p-12 text-center">
        <h1 className="text-xl font-semibold">Couldn't load this review</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl p-12 text-center">
      <h1 className="text-xl font-semibold">Review not found</h1>
      <Button asChild className="mt-4">
        <Link to="/reviews">Back to reviews</Link>
      </Button>
    </div>
  ),
});

function ReviewDetail() {
  const { reviewId } = Route.useParams();
  const { review } = Route.useLoaderData();
  const router = useRouter();

  if (!review) {
    return (
      <div className="mx-auto max-w-2xl p-12 text-center">
        <h1 className="text-xl font-semibold">Review not found</h1>
        <Button asChild className="mt-4">
          <Link to="/reviews">Back to reviews</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <Link
        to="/reviews"
        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← All reviews
      </Link>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {review.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {review.sprint_label}
            {review.team ? ` · ${review.team}` : ""} ·{" "}
            {new Date(review.review_date).toLocaleDateString()}
          </p>
        </div>
        <DeleteReviewButton
          reviewId={reviewId}
          onDeleted={() => router.navigate({ to: "/reviews" })}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Demo items</h2>
        <ItemsList reviewId={reviewId} />
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Decisions & next steps</h2>
        <DecisionsList reviewId={reviewId} />
      </section>
    </main>
  );
}

function DeleteReviewButton({
  reviewId,
  onDeleted,
}: {
  reviewId: string;
  onDeleted: () => void;
}) {
  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review deleted");
      onDeleted();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        if (confirm("Delete this review and everything inside it?")) {
          mutation.mutate();
        }
      }}
      aria-label="Delete review"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

/* ------------------------------ Items ------------------------------ */

function ItemsList({ reviewId }: { reviewId: string }) {
  const queryClient = useQueryClient();
  const { data: items } = useQuery({
    queryKey: ["items", reviewId],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from("review_items")
        .select(
          "id, review_id, title, author, description, status, created_at, review_feedbacks(id, item_id, author, body, created_at)",
        )
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Item[];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ItemStatus }) => {
      const { error } = await supabase
        .from("review_items")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["items", reviewId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("review_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["items", reviewId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-4 space-y-3">
      {items?.map((item) => {
        const meta = statusMeta[item.status];
        return (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge className={meta.className} variant="secondary">
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  by {item.author}
                </p>
                {item.description && (
                  <p className="mt-2 text-sm text-foreground/80">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Select
                  value={item.status}
                  onValueChange={(v) =>
                    statusMutation.mutate({ id: item.id, status: v as ItemStatus })
                  }
                >
                  <SelectTrigger className="h-8 w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(item.id)}
                  aria-label="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="border-t pt-4">
              <FeedbacksList
                itemId={item.id}
                reviewId={reviewId}
                feedbacks={item.review_feedbacks ?? []}
              />
            </CardContent>
          </Card>
        );
      })}
      <NewItemForm reviewId={reviewId} />
    </div>
  );
}

function NewItemForm({ reviewId }: { reviewId: string }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ItemStatus>("done");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("review_items").insert({
        review_id: reviewId,
        title: title.trim(),
        author: author.trim() || "Anonymous",
        description: description.trim() || null,
        status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", reviewId] });
      setTitle("");
      setAuthor("");
      setDescription("");
      setStatus("done");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !author.trim()) {
              toast.error("Title and author are required");
              return;
            }
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="i-title">Title</Label>
              <Input
                id="i-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Checkout: Apple Pay"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-author">Author</Label>
              <Input
                id="i-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Maya"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-desc">Description</Label>
            <Textarea
              id="i-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did we ship? What did we demo?"
              rows={2}
            />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="i-status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ItemStatus)}
              >
                <SelectTrigger id="i-status" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding…" : "Add item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ---------------------------- Feedbacks ---------------------------- */

function FeedbacksList({
  itemId,
  reviewId,
  feedbacks,
}: {
  itemId: string;
  reviewId: string;
  feedbacks: Feedback[];
}) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("review_feedbacks").insert({
        item_id: itemId,
        author: author.trim() || "Anonymous",
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", reviewId] });
      setBody("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      {feedbacks.length > 0 && (
        <ul className="space-y-2">
          {feedbacks.map((f) => (
            <li key={f.id} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
              <p className="text-xs font-medium text-muted-foreground">
                {f.author}
              </p>
              <p className="mt-0.5 text-foreground/90">{f.body}</p>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          mutation.mutate();
        }}
      >
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className="w-32"
        />
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add feedback…"
          className="flex-1 min-w-[200px]"
        />
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          Send
        </Button>
      </form>
    </div>
  );
}

/* ---------------------------- Decisions ---------------------------- */

function DecisionsList({ reviewId }: { reviewId: string }) {
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();

  const { data: decisions } = useQuery({
    queryKey: ["decisions", reviewId],
    queryFn: async (): Promise<Decision[]> => {
      const { data, error } = await supabase
        .from("review_decisions")
        .select("*")
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("review_decisions").insert({
        review_id: reviewId,
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions", reviewId] });
      setBody("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("review_decisions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["decisions", reviewId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-4 space-y-3">
      {decisions && decisions.length > 0 && (
        <ul className="space-y-2">
          {decisions.map((d) => (
            <li
              key={d.id}
              className="flex items-start justify-between gap-3 rounded-md border bg-card px-4 py-3 text-sm"
            >
              <span className="flex-1">{d.body}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(d.id)}
                aria-label="Delete decision"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          addMutation.mutate();
        }}
      >
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. Ship Apple Pay in next sprint"
          className="flex-1"
        />
        <Button type="submit" disabled={addMutation.isPending}>
          Add decision
        </Button>
      </form>
    </div>
  );
}
