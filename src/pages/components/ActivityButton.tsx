export function ActivityButton({ count, onClick }: { count?: number; onClick?: () => void }) {
  if (count && count > 0) {
    return (
      <button
        type="button"
        className="h-8 w-8 rounded text-sm font-semibold bg-cyan-400 text-zinc-900"
        onClick={() => onClick?.()}
      >
        {count}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="h-8 w-8 rounded text-zinc-200 bg-zinc-800 hover:bg-zinc-700"
      onClick={() => onClick?.()}
    >
      <svg className="h-4 w-4 m-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M21 21H10C6.70017 21 5.05025 21 4.02513 19.9749C3 18.9497 3 17.2998 3 14V3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M7.99707 16.999C11.5286 16.999 18.9122 15.5348 18.6979 6.43269M16.4886 8.04302L18.3721 6.14612C18.5656 5.95127 18.8798 5.94981 19.0751 6.14286L20.9971 8.04302"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </button>
  );
}
