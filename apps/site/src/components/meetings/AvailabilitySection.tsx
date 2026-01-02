'use client';

import { Temporal } from "@js-temporal/polyfill";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  buildAvailabilityMatrix,
  convertAvailabilityMatrix,
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
  WEEKDAYS
} from "../../lib/availability";
import timezoneDictionary from "../../../data/timezones.json";
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

const ROW_HEIGHT_REM = 0.5;
const HOUR_GAP_REM = 0.25;
const HEADER_OFFSET_REM = 3;
const PINNED_TIMEZONES = ["America/New_York", "Asia/Tokyo", "Asia/Shanghai"];
const TIMEZONE_LABELS = timezoneDictionary as Record<string, Record<Locale, string>>;

type QuarterMetadata = {
  index: number;
  row: number;
  hour: string;
  minute: string;
  label: string;
};

function getTimezoneLabel(timezone: string, locale: Locale) {
  const entry = TIMEZONE_LABELS[timezone];
  if (!entry) {
    return formatTimezoneName(timezone);
  }
  return entry[locale] || entry.en || formatTimezoneName(timezone);
}

export function AvailabilitySection({ copy, locale }: AvailabilitySectionProps) {
  const data = getAvailabilityData();
  const [referenceDate] = useState(() => Temporal.Now.zonedDateTimeISO(data.timezone).toString());
  const baseMatrix = useMemo(() => buildAvailabilityMatrix(data), [data]);
  const defaultTimezone = getLocaleDefaultTimezone(locale);
  const [selectedTimezone, setSelectedTimezone] = useState(defaultTimezone);
  const [showReference, setShowReference] = useState(false);
  const convertedVisibleIndices = useMemo(
    () => getVisibleQuarterIndices(data, { timezone: selectedTimezone, reference: referenceDate }),
    [data, selectedTimezone, referenceDate]
  );
  const convertedQuarterMeta = useMemo(
    () => buildQuarterMetadata(convertedVisibleIndices),
    [convertedVisibleIndices]
  );
  const referenceVisibleIndices = useMemo(
    () => getVisibleQuarterIndices(data, { timezone: data.timezone, reference: referenceDate }),
    [data, referenceDate]
  );
  const referenceQuarterMeta = useMemo(
    () => buildQuarterMetadata(referenceVisibleIndices),
    [referenceVisibleIndices]
  );
  const [timezoneOptions, setTimezoneOptions] = useState(() =>
    ensureDefaultTimezone(getTimezoneOptions(true), defaultTimezone)
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelectedTimezone(defaultTimezone);
  }, [defaultTimezone]);

  useEffect(() => {
    setTimezoneOptions(ensureDefaultTimezone(getTimezoneOptions(), defaultTimezone));
  }, [defaultTimezone]);

  const convertedMatrix = useMemo(
    () => convertAvailabilityMatrix(data, selectedTimezone, { reference: referenceDate }),
    [data, selectedTimezone, referenceDate]
  );
  const canonicalSummary = useMemo(() => summarizeAvailability(baseMatrix), [baseMatrix]);
  const convertedSummary = useMemo(() => summarizeAvailability(convertedMatrix), [convertedMatrix]);

  const convertedLabel = getTimezoneLabel(selectedTimezone, locale);
  const baseLabel = getTimezoneLabel(data.timezone, locale);
  const convertedOffset = getOffsetLabel(selectedTimezone);
  const baseOffset = getOffsetLabel(data.timezone);
  const windowLabel = null;
  const selectedTimezoneLabel = `${convertedLabel} (${convertedOffset})`;
  const dropdownLabelId = useId();
  const dropdownButtonId = useId();
  const dropdownSearchId = useId();
  const dialogId = useId();
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPickerOpen) {
      setTimezoneSearch("");
      return;
    }

    searchInputRef.current?.focus();
  }, [isPickerOpen]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!isPickerOpen) {
        return;
      }
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
        setTimezoneSearch("");
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
        setTimezoneSearch("");
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isPickerOpen]);

  const handleTimezoneSelect = (value: string) => {
    setSelectedTimezone(value);
    setIsPickerOpen(false);
    setTimezoneSearch("");
  };

  return (
    <figure
      data-availability-section="true"
      className="rounded-3xl border border-border bg-surface text-sm text-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
    >
      <div className="space-y-1 rounded-2xl bg-muted/30 mx-3 mt-3 dark:bg-dark-muted/30" ref={pickerRef}>
        <div className="relative">
          <button
            type="button"
            id={dropdownButtonId}
            aria-labelledby={`${dropdownLabelId} ${dropdownButtonId}`}
            aria-haspopup="listbox"
            aria-expanded={isPickerOpen}
            aria-controls={`${dropdownButtonId}-listbox`}
            onClick={() => setIsPickerOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text shadow-sm outline-none transition hover:border-accent focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:focus-visible:border-dark-accent dark:focus-visible:ring-dark-accent/40"
          >
            <span className="truncate">{selectedTimezoneLabel}</span>
            <span aria-hidden="true" className="ml-2 text-xs text-textMuted dark:text-dark-textMuted">
            ▾
          </span>
          </button>
          {isPickerOpen ? (
            <div
              id={`${dropdownButtonId}-listbox`}
              role="listbox"
              aria-labelledby={dropdownLabelId}
              className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="border-b border-border/50 p-2 dark:border-dark-border/50">
                <input
                  id={dropdownSearchId}
                  type="text"
                  value={timezoneSearch}
                  onChange={(event) => setTimezoneSearch(event.target.value)}
                  placeholder={copy.timezoneSearchPlaceholder}
                  aria-label={copy.timezoneSearchLabel}
                  ref={searchInputRef}
                  className="w-full rounded-lg border-0 bg-surface px-3 py-2 text-sm text-text outline-none transition focus-visible:ring-2 focus-visible:ring-accent/30 dark:bg-dark-surface dark:text-dark-text dark:focus-visible:ring-dark-accent/40"
                />
              </div>
              {(() => {
                const pinnedOptions = Array.from(
                  new Set([defaultTimezone, ...PINNED_TIMEZONES.filter((tz) => timezoneOptions.includes(tz))])
                );
                const normalizedQuery = timezoneSearch.trim().toLowerCase();
                const isSearching = normalizedQuery.length > 0;
                const optionMatchesQuery = (tz: string) =>
                  `${getTimezoneLabel(tz, locale)} (${getOffsetLabel(tz)})`
                    .toLowerCase()
                    .includes(normalizedQuery);
                const remainingOptions = timezoneOptions.filter(optionMatchesQuery);

                const renderOption = (value: string, isPinned: boolean) => {
                  const isSelected = value === selectedTimezone;
                  const optionLabel = `${getTimezoneLabel(value, locale)} (${getOffsetLabel(value)})`;
                  return (
                    <button
                      key={`${isPinned ? "pinned" : "all"}-${value}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleTimezoneSelect(value)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted/60 dark:hover:bg-dark-muted/50 ${
                        isSelected ? "bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent" : ""
                      }`}
                    >
                      <span className="truncate">{optionLabel}</span>
                      {isSelected ? (
                        <span className="text-[0.65rem] font-semibold text-accent dark:text-dark-accent">
                          {copy.timezonePickerSelectedLabel}
                        </span>
                      ) : null}
                    </button>
                  );
                };

                return (
                  <div className="max-h-64 overflow-y-auto py-1">
                    {!isSearching ? (
                      <>
                        <div className="px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                          {copy.timezonePickerPinnedLabel}
                        </div>
                        {pinnedOptions.map((value) => renderOption(value, true))}
                      </>
                    ) : null}
                    <div className="px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted">
                      {copy.timezonePickerAllLabel}
                    </div>
                    {remainingOptions.length ? (
                      remainingOptions.map((value) => renderOption(value, false))
                    ) : (
                      <div className="px-3 py-2 text-sm text-textMuted dark:text-dark-textMuted">
                        {copy.timezonePickerNoMatchesLabel}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>
      </div>

      <div className="-mt-6 px-0">
        <MatrixCard
          title=""
          timezone={selectedTimezone}
          timezoneLabel=""
          className="border-none shadow-none"
          matrix={convertedMatrix}
          dayLabels={copy.dayLabels}
          summaries={convertedSummary}
          copy={copy}
          quarterMeta={convertedQuarterMeta}
        />
        <div className="-mt-1 flex justify-center">
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

      <figcaption className="mt-2 space-y-2 text-center text-xs text-textMuted dark:text-dark-textMuted">
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
        title={`${copy.referenceDialogTitle}`}
        description=""
        closeLabel={copy.referenceCloseLabel}
        dialogId={dialogId}
      >
        <MatrixCard
          title={`${baseLabel} (${baseOffset})`}
          timezone={data.timezone}
          timezoneLabel=""
          matrix={baseMatrix}
          dayLabels={copy.dayLabels}
          summaries={canonicalSummary}
          copy={copy}
          quarterMeta={referenceQuarterMeta}
        />
      </ReferenceDialog>
    </figure>
  );
}

type MatrixCardProps = {
  title: string;
  timezone: string;
  timezoneLabel: string;
  className?: string;
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
                      className,
                      matrix,
                      dayLabels,
                      summaries,
                      quarterMeta,
                      copy
                    }: MatrixCardProps) {
  const gridId = useId();
  const descriptionId = useId();
  const hasCustomBorder = typeof className === "string" && /\bborder(?:-[^\s]+)?\b/.test(className);
  const hasCustomShadow = typeof className === "string" && /\bshadow(?:-[^\s]+)?\b/.test(className);
  const baseClasses = "rounded-2xl bg-surface p-4 dark:bg-dark-surface";
  const borderClasses = hasCustomBorder ? "" : "border border-border dark:border-dark-border";
  const shadowClasses = hasCustomShadow ? "" : "shadow-sm";
  const classNames = [baseClasses, borderClasses, shadowClasses, className].filter(Boolean).join(" ");

  return (
    <section
      className={classNames}
      data-availability-matrix-card="true"
    >
      <header className="mb-0">
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
  const firstVisibleRow = quarterMeta[0]?.row ?? 0;
  const labelOffsets = computeLabelOffsets(quarterMeta, firstVisibleRow);

  return (
    <div className="overflow-auto">
      <div className="relative pl-10">
        <div
          role="grid"
          aria-label={ariaLabel}
          aria-describedby={descriptionId}
          id={id}
          className="grid gap-x-[2px] text-xs"
          style={{
            gridTemplateColumns: `repeat(${WEEKDAYS.length}, minmax(0, 1fr))`
          }}
        >
          <Fragment key="spacer-row">
            {WEEKDAYS.map((day) => (
              <div key={`spacer-${day}`} aria-hidden="true" className="h-2" />
            ))}
          </Fragment>
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
          {quarterMeta.map((meta, idx) => {
            const previous = quarterMeta[idx - 1];
            const needsGap = isHourBreak(meta, firstVisibleRow);
            const isHiddenGap =
              needsGap && previous ? meta.index - previous.index > 1 : false;
            const gapHeight = HOUR_GAP_REM * (isHiddenGap ? 6 : 1);
            return (
              <Fragment key={meta.index}>
                {needsGap ? (
                  <div
                    className="col-span-full"
                    style={{ height: `${gapHeight}rem` }}
                    aria-hidden="true"
                  />
                ) : null}
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
            );
          })}
        </div>
        <TimeColumnOverlay labelOffsets={labelOffsets} />
      </div>
    </div>
  );
}

function buildQuarterMetadata(indices: number[]): QuarterMetadata[] {
  return indices.map((index, row) => {
    const totalMinutes = index * INTERVAL_MINUTES;
    const hour = Math.floor(totalMinutes / MINUTES_PER_HOUR)
      .toString()
      .padStart(2, "0");
    const minute = (totalMinutes % MINUTES_PER_HOUR).toString().padStart(2, "0");
    return {
      index,
      row,
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
  if (minute !== "00") {
    return "";
  }
  if (hour === "00") {
    return "12 AM";
  }
  if (hour === "12") {
    return "12 PM";
  }
  return formatHourLabel(hour);
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

function isHourBreak(meta: QuarterMetadata, firstVisibleRow: number) {
  if (meta.minute !== "00") {
    return false;
  }
  return meta.row !== firstVisibleRow;
}

function computeLabelOffsets(quarterMeta: QuarterMetadata[], firstVisibleRow: number) {
  let gapOffset = 0;
  return quarterMeta.map((meta, idx) => {
    let gapHeight = 0;
    if (isHourBreak(meta, firstVisibleRow)) {
      const previous = quarterMeta[idx - 1];
      const isHiddenGap = previous ? meta.index - previous.index > 1 : false;
      gapHeight = HOUR_GAP_REM * (isHiddenGap ? 6 : 1);
      gapOffset += gapHeight;
    }

    const offset =
      HEADER_OFFSET_REM +
      (meta.row - firstVisibleRow) * ROW_HEIGHT_REM +
      gapOffset;

    return { meta, offset };
  });
}

type TimeColumnOverlayProps = {
  labelOffsets: Array<{ meta: QuarterMetadata; offset: number }>;
};

function TimeColumnOverlay({ labelOffsets }: TimeColumnOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 left-0 w-10"
    >
      <span className="pointer-events-auto absolute left-0 top-1 text-[0.65rem] font-semibold uppercase tracking-wide text-textMuted dark:text-dark-textMuted" />
      {labelOffsets.map(({ meta, offset }) => {
        const label = formatRowLabel(meta.hour, meta.minute);
        if (!label) {
          return null;
        }
        return (
          <span
            key={`label-${meta.index}`}
            className="absolute right-2 text-[0.65rem] font-medium text-textMuted dark:text-dark-textMuted"
            style={{
              top: `calc(${offset}rem - 0.75rem)`,
              transform: "translateY(-50%)"
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
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
