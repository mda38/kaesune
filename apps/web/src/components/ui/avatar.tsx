import { Icon } from "@/components/ui/icon";

type Props = { name?: string };

export function Avatar({ name = "大地" }: Props) {
  return (
    <div
      className="grid size-10 shrink-0 place-items-center rounded-full border border-black bg-white text-black"
      aria-label={name}
    >
      <Icon name="user" size={21} />
    </div>
  );
}
