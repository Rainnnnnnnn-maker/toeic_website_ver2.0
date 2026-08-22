"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type DisclosureProps = {
  title: string;
  accentClassName: string;
  children: ReactNode;
  meta?: string;
  preview?: string;
};

type SectionProps = DisclosureProps & {
  id: string;
  collapsible: boolean;
};

export function WordDetailDisclosure({
  title,
  accentClassName,
  children,
  meta,
  preview,
}: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="group/disclosure overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors open:border-blue-200 open:bg-blue-50/20"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden sm:px-4">
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <span className={`h-2.5 w-0.5 shrink-0 rounded-full ${accentClassName}`} aria-hidden="true" />
            {title}
          </span>
          {preview && (
            <span
              className="mt-1 block truncate text-xs font-normal normal-case tracking-normal text-slate-500 group-open/disclosure:hidden"
              aria-hidden="true"
            >
              {preview}
            </span>
          )}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-blue-700">
          {meta && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500 group-open/disclosure:bg-white">
              {meta}
            </span>
          )}
          <span className="group-open/disclosure:hidden">見る</span>
          <span className="hidden group-open/disclosure:inline">閉じる</span>
          <ChevronDown
            className="size-4 transition-transform duration-200 group-open/disclosure:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </span>
      </summary>
      <div className="border-t border-slate-100 bg-white p-3 sm:p-4">{children}</div>
    </details>
  );
}

export function WordDetailSection({
  id,
  title,
  accentClassName,
  children,
  collapsible,
  meta,
  preview,
}: SectionProps) {
  if (collapsible) {
    return (
      <section aria-label={title}>
        <WordDetailDisclosure
          title={title}
          accentClassName={accentClassName}
          meta={meta}
          preview={preview}
        >
          {children}
        </WordDetailDisclosure>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2" aria-labelledby={id}>
      <h2
        id={id}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"
      >
        <span className={`h-2.5 w-0.5 rounded-full ${accentClassName}`} aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}
