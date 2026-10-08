type Props = { label: string; value: string };

export function DetailRow({ label, value }: Props) {
  return (
    <div className="border-b border-black py-3.5">
      <dt className="mb-2 text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="text-base font-bold">{value}</dd>
    </div>
  );
}
