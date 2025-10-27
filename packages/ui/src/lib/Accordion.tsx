"use client";

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode
} from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState
} from "react";
import clsx from "clsx";

import { composeEventHandlers } from "./utils";

type AccordionContextValue = {
  type: "single" | "multiple";
  openItems: string[];
  toggleItem: (value: string) => void;
  baseId: string;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string) {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Accordion>`);
  }
  return ctx;
}

export type AccordionProps = HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple";
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onValueChange?: (value: string | string[] | null) => void;
  collapsible?: boolean;
  children: ReactNode;
};

function toArray(value?: string | string[] | null) {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      type = "single",
      value: valueProp,
      defaultValue,
      onValueChange,
      collapsible = true,
      className,
      children,
      ...props
    },
    ref
  ) {
    const [internalState, setInternalState] = useState<string[]>(() => {
      const initial = toArray(valueProp ?? defaultValue);
      if (type === "multiple") return initial;
      return initial.slice(0, 1);
    });

    const isControlled = valueProp !== undefined;
    const openItems = isControlled
      ? toArray(valueProp)
      : internalState.slice(0, type === "single" ? 1 : undefined);

    const setOpenItems = (next: string[]) => {
      const normalized =
        type === "single" ? next.slice(0, 1) : Array.from(new Set(next));
      if (!isControlled) {
        setInternalState(normalized);
      }
      if (type === "multiple") {
        onValueChange?.(normalized);
      } else {
        onValueChange?.(normalized[0] ?? null);
      }
    };

    const baseId = useId();

    const toggleItem = useCallback(
      (item: string) => {
        if (type === "multiple") {
          const next = openItems.includes(item)
            ? openItems.filter((value) => value !== item)
            : [...openItems, item];
          setOpenItems(next);
          return;
        }
        if (openItems.includes(item)) {
          if (!collapsible) {
            return;
          }
          setOpenItems([]);
          return;
        }
        setOpenItems([item]);
      },
      [type, openItems, collapsible, setOpenItems]
    );

    const contextValue = useMemo<AccordionContextValue>(
      () => ({
        type,
        openItems,
        toggleItem,
        baseId
      }),
      [type, openItems, toggleItem, baseId]
    );

    return (
      <AccordionContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={clsx("space-y-2", className)}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  children: ReactNode;
};

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ value, className, children, ...props }, ref) {
    const { openItems } = useAccordionContext("AccordionItem");
    const isOpen = openItems.includes(value);
    return (
      <div
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
        className={clsx(
          "overflow-hidden rounded-xl border border-border bg-surface text-text shadow-sm transition-colors dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(function AccordionTrigger(
  { value, className, children, onClick, onKeyDown, ...props },
  ref
) {
  const { toggleItem, openItems, baseId } =
    useAccordionContext("AccordionTrigger");
  const isOpen = openItems.includes(value);
  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      ref={ref}
      id={triggerId}
      type="button"
      aria-expanded={isOpen}
      aria-controls={panelId}
      data-state={isOpen ? "open" : "closed"}
      className={clsx(
        "flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-border dark:focus-visible:outline-dark-border",
        "bg-transparent",
        className
      )}
      onClick={composeEventHandlers(onClick, () => {
        toggleItem(value);
      })}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleItem(value);
        }
      })}
      {...props}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className={clsx(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border border-border transition-transform dark:border-dark-border",
          isOpen ? "rotate-45" : "rotate-0"
        )}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          focusable="false"
          className="h-3.5 w-3.5 stroke-current"
        >
          <path
            d="M4 10h12M10 4v12"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
});

export type AccordionContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(function AccordionContent({ value, className, children, ...props }, ref) {
  const { openItems, baseId } = useAccordionContext("AccordionContent");
  const panelId = `${baseId}-panel-${value}`;
  const triggerId = `${baseId}-trigger-${value}`;
  const isOpen = openItems.includes(value);

  return (
    <div
      ref={ref}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!isOpen}
      data-state={isOpen ? "open" : "closed"}
      className={clsx(
        "border-t border-border bg-surfaceMuted px-5 py-4 text-sm leading-relaxed text-text dark:border-dark-border dark:bg-dark-surfaceMuted dark:text-dark-text",
        className
      )}
      {...props}
    >
      {isOpen ? children : null}
    </div>
  );
});
