"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "relative flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-[14px] font-semibold text-[#f4f4f5]",
        nav: "absolute top-0 flex w-full items-center justify-between px-0",
        button_previous:
          "inline-flex size-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-[#f4f4f5] disabled:opacity-30",
        button_next:
          "inline-flex size-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.06] hover:text-[#f4f4f5] disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-[11px] font-medium text-white/40",
        week: "mt-1 flex w-full",
        day: "size-9 p-0 text-center",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-lg text-[13px] text-[#f4f4f5] transition-colors hover:bg-white/[0.06] aria-selected:bg-[#ff6a1a] aria-selected:font-semibold aria-selected:text-black",
        today: "[&:not([aria-selected])>button]:text-[#ff6a1a]",
        outside: "text-white/25",
        disabled: "text-white/15",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...rest} />
          ) : (
            <ChevronRight className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
