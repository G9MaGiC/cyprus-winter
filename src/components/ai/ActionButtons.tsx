"use client";

import { useRouter } from "@/i18n/navigation";

type Action = {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
};

export function ActionButtons({ actions }: { actions: Action[] }) {
  const router = useRouter();

  function handleAction(action: Action) {
    switch (action.type) {
      case "open_place":
      case "show_on_map":
      case "view_events":
      case "book_now":
      case "build_day_plan": {
        const path = (action.payload?.path as string) ?? "/discover";
        router.push(path);
        break;
      }
      case "save_to_plan": {
        router.push("/plan");
        break;
      }
    }
  }

  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((action, i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleAction(action)}
          className="px-3 py-1.5 text-xs font-medium rounded-full bg-terracotta/10 text-terracotta hover:bg-terracotta/20 transition-colors min-h-[32px]"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
