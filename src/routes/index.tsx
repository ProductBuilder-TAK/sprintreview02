import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sprint Review — journal your sprint reviews" },
      {
        name: "description",
        content:
          "A lightweight tool to prepare, run, and keep track of your team's sprint reviews: demos, feedback, decisions.",
      },
      { property: "og:title", content: "Sprint Review" },
      {
        property: "og:description",
        content: "Prepare, run, and journal your sprint reviews.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Sprint Review
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Journal every sprint review, without the mess.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Capture demos, feedback, and decisions in one place. Look back on any
          past sprint in seconds.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/reviews">Open reviews</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
