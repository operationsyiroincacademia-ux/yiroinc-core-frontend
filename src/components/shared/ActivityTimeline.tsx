import { Clock, type LucideIcon } from "lucide-react";

import { formatDateTime } from "@/features/commerce/format";

export type ActivityTimelineItem = {
  id: string | number;
  event: string;
  title: string;
  description?: string | null;
  created_at?: string | null;
};

export function ActivityTimeline({
  items,
  iconForEvent,
}: {
  items: ActivityTimelineItem[];
  iconForEvent?: (event: string) => LucideIcon;
}) {
  return (
    <ol className="px-5 py-5">
      {items.map((item, index) => {
        const Icon = iconForEvent?.(item.event) ?? Clock;
        return (
          <li key={String(item.id)} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={
                  index === 0
                    ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                    : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border"
                }
              />
              {index < items.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className={index < items.length - 1 ? "pb-6" : ""}>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {item.title}
              </p>
              {item.description && (
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              )}
              {item.created_at && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(item.created_at)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
