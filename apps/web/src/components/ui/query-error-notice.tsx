type Props = { message: string | null | undefined; onRetry: () => unknown };

export function QueryErrorNotice({ message, onRetry }: Props) {
  if (!message) return null;
  return (
    <div className="mb-4 border border-black p-4">
      <p className="text-sm" role="alert">
        {message}
      </p>
      <button
        type="button"
        className="mt-3 text-sm font-bold underline"
        onClick={() => void onRetry()}
      >
        再試行
      </button>
    </div>
  );
}
