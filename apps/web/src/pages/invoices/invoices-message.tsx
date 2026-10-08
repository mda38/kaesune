import { Card } from "@/components/ui/card";

type Props = {
  children: string;
  error?: string | null;
  onRetry?: () => void | Promise<void>;
};

export function Message({ children, error, onRetry }: Props) {
  return (
    <Card className="p-4">
      <p
        className="text-sm text-neutral-600"
        role={error ? "alert" : undefined}
        aria-busy={!error && children.endsWith("…") ? "true" : undefined}
      >
        {children}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-3 text-sm font-bold underline"
        >
          再試行
        </button>
      )}
    </Card>
  );
}
