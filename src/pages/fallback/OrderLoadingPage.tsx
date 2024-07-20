export function OrderLoadingPage() {
  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <div className="flex justify-between">
        <h1 className="pb-8">Listing</h1>
      </div>
      <div className="flex gap-12">
        <div className="flex-grow flex flex-col gap-8">
          <div>
            <span className="flex flex-col gap-4">
              <div className="h-5 w-28 bg-zinc-800 animate-pulse rounded"></div>
              <div className="h-8 w-52 bg-zinc-800 animate-pulse rounded"></div>
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 30 }).map((_, index) => (
              <div key={index} style={{ width: 94 }} className="bg-zinc-800 animate-pulse rounded">
                <div className="h-24"></div>
                <div className="h-6"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div className="flex flex-col gap-1 items-center">
            <div className="w-40 h-40 rounded bg-zinc-700 mx-auto animate-pulse"></div>
            <div className="w-28 h-6 bg-zinc-700 animate-pulse rounded"></div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-14 h-6 bg-zinc-700 animate-pulse rounded"></div>
            <div className="w-full h-8 bg-zinc-700 animate-pulse rounded"></div>
            <div className="w-full h-8 bg-zinc-700 animate-pulse rounded"></div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-28 h-6 bg-zinc-700 animate-pulse rounded"></div>
            <div className="w-full h-8 bg-zinc-700 animate-pulse rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-36 h-8 bg-zinc-700 animate-pulse rounded"></div>
            <div className="flex-grow h-8 bg-zinc-700 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
