'use client';

import { Temporal } from "@js-temporal/polyfill";
import { Fragment, useEffect, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  buildAvailabilityMatrix,
  convertAvailabilityMatrix,
  formatVisibleWindowLabel,
  getAvailabilityData,
  getLocaleDefaultTimezone,
  getOffsetLabel,
  getTimezoneOptions,
  getVisibleQuarterIndices,
  summarizeAvailability,
  INTERVAL_MINUTES,
  type AvailabilityMatrix,
  type DaySummary,
  type QuarterHourKey,
  type Weekday,
  WEEKDAYS
} from "../../lib/availability";
import type { AppDictionary } from "../../utils/dictionaries";
import type { Locale } from "../../utils/i18n";

type AvailabilityCopy = AppDictionary["meetings"]["availability"];

type AvailabilitySectionProps = {
  copy: AvailabilityCopy;
  locale: Locale;
};

const minuteToQuarterKey: Record<string, QuarterHourKey> = {
  "00": "0",
  "15": "15",
  "30": "30",
  "45": "45"
};

const MINUTES_PER_HOUR = 60;

type QuarterMetadata = {
  index: number;
  hour: string;
  minute: string;
  label: string;
};

export function AvailabilitySection({ copy, locale }: AvailabilitySectionProps) {
  const data = getAvailabilityData();
  const [referenceDate] = useState(() => Temporal.Now.zonedDateTimeISO(data.timezone).toString());
  const baseMatrix = useMemo(() => buildAvailabilityMatrix(data), [data]);
  const defaultTimezone = getLocaleDefaultTimezone(locale);
  const [selectedTimezone, setSelectedTimezone] = useState(defaultTimezone);
  const [showReference, setShowReference] = useState(false);
  const visibleIndices = useMemo(() => getVisibleQuarterIndices(data), [data]);
  const quarterMeta = useMemo(() => buildQuarterMetadata(visibleIndices), [visibleIndices]);
  const [timezoneOptions, setTimezoneOptions] = useState(() => {
    const options = ensureDefaultTimezone(getTimezoneOptions(true), defaultTimezone);
    return options;
  });

  useEffect(() => {
    setSelectedTimezone(defaultTimezone);
  }, [defaultTimezone]);

  useEffect(() => {
    const fullList = ensureDefaultTimezone(getTimezoneOptions(), defaultTimezone);
    setTimezoneOptions(fullList);
  }, [defaultTimezone]);

  const convertedMatrix = useMemo(
    () => convertAvailabilityMatrix(data, selectedTimezone, { reference: referenceDate }),
    [data, selectedTimezone, referenceDate]
  );
  const canonicalSummary = useMemo(() => summarizeAvailability(baseMatrix), [baseMatrix]);
  const convertedSummary = useMemo(() => summarizeAvailability(convertedMatrix), [convertedMatrix]);

  const convertedLabel = formatTimezoneName(selectedTimezone);
  const baseLabel = formatTimezoneName(data.timezone);
  const convertedOffset = getOffsetLabel(selectedTimezone);
  const baseOffset = getOffsetLabel(data.timezone);
  const windowLabel = formatVisibleWindowLabel(data);
  const dropdownLabelId = useId();
  const dialogId = useId();

  return (
    <figure className="rounded-3xl border border-border bg-surface p-4 text-sm text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
      <div className="space-y-3 rounded-2xl bg-muted/30 p-4 dark:bg-dark-muted/30">
        <label
          htmlFor="availability-timezone"
          id={dropdownLabelId}
          className="text-xs font-medium text-textMuted dark:text-dark-textMuted"
        >
          {copy.timezoneDropdownLabel}
        </label>
        <p className="text-xs text-textMuted dark:text-dark-textMuted">{copy.dropdownDescription}</p>
        <select
          id="availability-timezone"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text shadow-sm outline-none transition hover:border-accent focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:focus-visible:border-dark-accent dark:focus-visible:ring-dark-accent/40"
          aria-describedby={dropdownLabelId}
          value={selectedTimezone}
          onChange={(event) => setSelectedTimezone(event.target.value)}
        >
          {timezoneOptions.map((value) => (
            <option key={value} value={value}>
              {formatTimezoneName(value)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <MatrixCard
          title={`${copy.primaryLabel} · ${convertedLabel}`}
          timezone={selectedTimezone}
          timezoneLabel={`${convertedLabel} (${convertedOffset})`}
          matrix={convertedMatrix}
          dayLabels={copy.dayLabels}
          summaries={convertedSummary}
          copy={copy}
          quarterMeta={quarterMeta}
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowReference(true)}
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
            aria-haspopup="dialog"
            aria-expanded={showReference}
            aria-controls={dialogId}
          >
            {copy.referenceButtonLabel}
          </button>
        </div>
      </div>

      <figcaption className="mt-6 space-y-2 text-center text-xs text-textMuted dark:text-dark-textMuted">
        <p>
          {copy.legend}{" "}
          {copy.timezoneHref ? (
            <a
              href={copy.timezoneHref}
              target="_blank"
              rel="noreferrer noopener"
              className="text-text underline underline-offset-4 hover:text-accent dark:text-dark-text dark:hover:text-dark-accent"
            >
              {copy.timezoneLabel ?? copy.timezoneHref}
            </a>
          ) : null}
        </p>
        {windowLabel ? (
          <p className="text-xs text-textMuted dark:text-dark-textMuted">
            <span className="font-medium text-text dark:text-dark-text">{copy.windowLabelPrefix}</span>{" "}
            {windowLabel}
          </p>
        ) : null}
      </figcaption>
      <ReferenceDialog
        open={showReference}
        onClose={() => setShowReference(false)}
        title={`${copy.referenceDialogTitle} · ${baseLabel}`}
        description={copy.referenceDialogDescription}
        closeLabel={copy.referenceCloseLabel}
        dialogId={dialogId}
      >
        <MatrixCard
          title={`${copy.referenceLabel} · ${baseLabel}`}
          timezone={data.timezone}
          timezoneLabel={`${baseLabel} (${baseOffset})`}
          matrix={baseMatrix}
          dayLabels={copy.dayLabels}
          summaries={canonicalSummary}
          copy={copy}
          quarterMeta={quarterMeta}
        />
      </ReferenceDialog>
    </figure>
  );
}

type MatrixCardProps = {
  title: string;
  timezone: string;
  timezoneLabel: string;
  matrix: AvailabilityMatrix;
  dayLabels: AvailabilityCopy["dayLabels"];
  summaries: DaySummary[];
  quarterMeta: QuarterMetadata[];
  copy: AvailabilityCopy;
};

function MatrixCard({
  title,
  timezone,
  timezoneLabel,
  matrix,
  dayLabels,
  summaries,
  quarterMeta,
  copy
}: MatrixCardProps) {
  const gridId = useId();
  const descriptionId = useId();

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
      <header className="mb-4 space-y-1">
        <h3 className="text-base font-semibold text-text dark:text-dark-text">{title}</h3>
        <p className="text-xs text-textMuted dark:text-dark-textMuted">{timezoneLabel}</p>
      </header>
      <AvailabilityGrid
        id={gridId}
        ariaLabel={`${title} (${timezone})`}
        descriptionId={descriptionId}
        matrix={matrix}
        dayLabels={dayLabels}
        copy={copy}
        quarterMeta={quarterMeta}
      />
      <dl id={descriptionId} className="sr-only">
        {summaries.map((summary) => (
          <div key={summary.day}>
            <dt>{dayLabels[summary.day].long}</dt>
            <dd>
              {summary.ranges.length
                ? summary.ranges.map((range) => formatRange(range.start, range.end)).join(", ")
                : copy.noAvailabilityLabel}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type AvailabilityGridProps = {
  id: string;
  ariaLabel: string;
  descriptionId: string;
  matrix: AvailabilityMatrix;
  dayLabels: AvailabilityCopy["dayLabels"];
  copy: AvailabilityCopy;
  quarterMeta: QuarterMetadata[];
};

function AvailabilityGrid({
  id,
  ariaLabel,
  descriptionId,
  matrix,
  dayLabels,
  copy,
  quarterMeta
}: AvailabilityGridProps) {
  return (
    <div className="overflow-auto">
      <div
        role="grid"
        aria-label={ariaLabel}
        aria-describedby={descriptionId}
        id={id}
        className="grid text-xs"
        style={{
          gridTemplateColumns: `minmax(3rem,auto) repeat(${WEEKDAYS.length}, minmax(0, 1fr))`
        }}
      >
        <Fragment key="spacer-row">
          <div aria-hidden="true" className="h-2" />
          {WEEKDAYS.map((day) => (
            <div key={`spacer-${day}`} aria-hidden="true" className="h-2" />
          ))}
        </Fragment>
        <div
          role="columnheader"
          className="sticky top-0 z-10 bg-surface px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-textMuted dark:bg-dark-surface dark:text-dark-textMuted"
        >
          {copy.timeColumnLabel}
        </div>
        {WEEKDAYS.map((day) => {
          const label = dayLabels[day];
          return (
          <div
              key={day}
            role="columnheader"
            className="sticky top-0 z-10 border-b border-border/30 px-2 py-1 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-textMuted dark:border-dark-border/40 dark:text-dark-textMuted"
          >
            {label.short}
            </div>
          );
        })}
        {quarterMeta.map((meta) => (
          <Fragment key={meta.index}>
            <div
              role="rowheader"
              className="border-b border-border/30 px-2 py-1 text-[0.65rem] font-medium text-textMuted dark:border-dark-border/40 dark:text-dark-textMuted"
            >
              {formatRowLabel(meta.hour, meta.minute)}
            </div>
            {WEEKDAYS.map((day) => {
              const quarterKey = minuteToQuarterKey[meta.minute];
              const isAvailable = quarterKey ? matrix[day]?.[meta.hour]?.[quarterKey] : false;
              const ariaLabel = `${dayLabels[day].long} ${meta.label} ${
                isAvailable ? copy.availableLabel : copy.unavailableLabel
              }`;
              return (
                <div
                  key={`${day}-${meta.index}`}
                  role="gridcell"
                  tabIndex={isAvailable ? 0 : -1}
                  aria-label={ariaLabel}
                  className={`h-2 w-full border border-border/40 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isAvailable
                      ? "bg-accent/80 text-white dark:bg-dark-accent/70"
                      : "bg-transparent dark:border-dark-border/40"
                  }`}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function buildQuarterMetadata(indices: number[]): QuarterMetadata[] {
  return indices.map((index) => {
    const totalMinutes = index * INTERVAL_MINUTES;
    const hour = Math.floor(totalMinutes / MINUTES_PER_HOUR)
      .toString()
      .padStart(2, "0");
    const minute = (totalMinutes % MINUTES_PER_HOUR).toString().padStart(2, "0");
    return {
      index,
      hour,
      minute,
      label: `${hour}:${minute}`
    };
  });
}

function formatHourLabel(hour: string) {
  const numericHour = Number(hour);
  if (Number.isNaN(numericHour)) {
    return hour;
  }

  const suffix = numericHour >= 12 ? "PM" : "AM";
  const normalized = numericHour % 12 === 0 ? 12 : numericHour % 12;
  return `${normalized} ${suffix}`;
}

function formatRowLabel(hour: string, minute: string) {
  if (minute !== "45") {
    return "";
  }
  const nextHour = (Number(hour) + 1) % 24;
  return formatHourLabel(nextHour.toString().padStart(2, "0"));
}

function formatRange(start: string, end: string) {
  return `${start} – ${end}`;
}

function formatTimezoneName(value: string) {
  return value.replace(/_/g, " ");
}

function ensureDefaultTimezone(options: string[], defaultTimezone: string) {
  const list = [...options];
  if (!list.includes(defaultTimezone)) {
    list.unshift(defaultTimezone);
  }
  return Array.from(new Set(list));
}

type ReferenceDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  dialogId: string;
  children: ReactNode;
};

function ReferenceDialog({ open, onClose, title, description, closeLabel, dialogId, children }: ReferenceDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const titleId = `${dialogId}-label`;
  const descriptionId = description ? `${dialogId}-description` : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        id={dialogId}
        className="w-full max-w-5xl rounded-3xl border border-border bg-surface p-6 shadow-2xl dark:border-dark-border dark:bg-dark-surface"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/40 pb-4 dark:border-dark-border/40">
          <div className="space-y-1">
            <h3 id={titleId} className="text-xl font-semibold text-text dark:text-dark-text">
              {title}
            </h3>
            {description ? (
              <p id={descriptionId} className="text-sm text-textMuted dark:text-dark-textMuted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-text transition hover:border-accent hover:text-accent dark:border-dark-border dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          >
            {closeLabel}
          </button>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  );
}
