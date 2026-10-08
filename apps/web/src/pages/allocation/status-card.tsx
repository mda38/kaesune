import { Card } from "@/components/ui/card";

type Props = {
  loading?: boolean;
  message: string;
  onRetry?: () => void;
};

export function StatusCard({ loading = false, message, onRetry }: Props) {
  return (
    <Card className="p-4">
      <p aria-busy={loading || undefined} className="text-sm" role="status">
        {message}
      </p>
      {onRetry && (
        <button
          className="mt-3 text-sm font-bold underline"
          onClick={onRetry}
          type="button"
        >
          再試行
        </button>
      )}
    </Card>
  );
}
