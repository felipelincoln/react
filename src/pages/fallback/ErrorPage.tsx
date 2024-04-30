export function ErrorPage({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>;
}
