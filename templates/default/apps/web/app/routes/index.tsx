import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { use } from "react";
import { useTRPC } from "#/lib/trpc";

export const Route = createFileRoute("/")({ component: Home });
const fetchOk = fetch("http://localhost:3000/api/auth/ok").then(
  (r) => r.json() as {},
);

function Home() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.post.getPost.queryOptions());
  const authOK = use(fetchOk);
  return (
    <div className="p-8" suppressHydrationWarning>
      <h1 className="text-4xl font-bold">Welcome to X3Bun Starter App</h1>
      <p className="mt-4 text-lg">If you see JSON object below, tRPC works </p>
      <pre className="bg-accent p-3 rounded">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
      <p className="mt-4 text-lg">
        If you see JSON object below, Better-Auth works{" "}
      </p>
      <pre className="bg-accent p-3 rounded">
        <code>{JSON.stringify(authOK, null, 2)}</code>
      </pre>
    </div>
  );
}
