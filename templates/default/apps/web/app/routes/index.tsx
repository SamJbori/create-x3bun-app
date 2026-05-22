import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
	component: Home,
	loader: async ({ context: { trpc } }) =>
		await trpc.client.post.getPost.query(),
	// ssr: true,
	// headers: () => ({
	// 	// Cache at CDN for 1 hour, allow stale content for up to 1 day
	// 	"Cache-Control":
	// 		"public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
	// }),
});

function Home() {
	// const posts = { data: Route.useLoaderData() };

	const posts = Route.useRouteContext().trpc.api.post.getPost.useQuery();
	const invalidatePosts =
		Route.useRouteContext().trpc.api.useUtils().post.invalidate;
	console.log(posts.data);
	return (
		<div className="p-8">
			<h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
			<p className="mt-4 text-lg">
				Edit <code>src/routes/index.tsx</code> to get started.
			</p>
			<button type="button" onClick={() => invalidatePosts()}>
				Invalidate Post {posts.data?.id}
			</button>
		</div>
	);
}
