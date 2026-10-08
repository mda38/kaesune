import { Icon } from "@/components/ui/icon";

export function Avatar({ name = "大地" }: { name?: string }) {
  return (
    <div
      className="grid size-10 shrink-0 place-items-center rounded-full border border-black bg-white text-black"
      aria-label={name}
    >
      <Icon name="user" size={21} />
    </div>
  );
}
