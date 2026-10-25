import { Hammer } from "lucide-react";

// Temporary stand-in that the owning lane replaces. Delete the import when you build the page.
export function PagePlaceholder({ title, owner, task }: { title: string; owner: string; task: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Hammer className="size-5 text-muted-foreground" />
      </span>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        Being built by {owner}. See {task}.
      </p>
    </div>
  );
}
