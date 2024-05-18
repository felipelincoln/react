export function IconNftLarge({ src }: { src?: string }) {
  if (!src) {
    return <div className="w-12 h-12 rounded bg-zinc-700"></div>;
  }

  return <img src={src} draggable="false" className="w-12 h-12 rounded" />;
}
