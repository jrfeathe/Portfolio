"use client";

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MutableRefObject,
  ReactNode
} from "react";
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  useMemo,
  useRef
} from "react";
import clsx from "clsx";

import {
  composeEventHandlers,
  mergeRefs,
  useControllableState,
  FOCUS_VISIBLE_RING
} from "./utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  orientation: "horizontal" | "vertical";
  listRef: MutableRefObject<HTMLDivElement | null>;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return ctx;
}

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    children,
    className,
    ...props
  },
  ref
) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();
  const initialValue = useMemo(() => {
    if (valueProp !== undefined) return valueProp;
    if (defaultValue !== undefined) return defaultValue;
    const firstTriggerValue = findFirstTriggerValue(children);
    return firstTriggerValue ?? "";
  }, [children, defaultValue, valueProp]);

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: initialValue,
    onChange: onValueChange
  });

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value,
      setValue,
      orientation,
      listRef,
      baseId
    }),
    [value, setValue, orientation, baseId]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx("flex flex-col gap-4", className)}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

function findFirstTriggerValue(children: ReactNode): string | null {
  let found: string | null = null;
  Children.forEach(children, (child) => {
    if (found) return;
    if (!isValidElement(child)) return;
    if ((child.props as { value?: string }).value) {
      found = child.props.value;
      return;
    }
    if (child.props?.children) {
      found = findFirstTriggerValue(child.props.children);
    }
  });
  return found;
}

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, children, ...props }, ref) {
    const { orientation, listRef } = useTabsContext("TabsList");
    return (
      <div
        ref={mergeRefs(ref, (node) => {
          listRef.current = node;
        })}
        role="tablist"
        aria-orientation={orientation}
        className={clsx(
          "inline-flex gap-2 rounded-full border border-border bg-surface p-1 dark:border-dark-border dark:bg-dark-surface",
          orientation === "vertical" && "flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger(
    { value, className, children, onClick, onKeyDown, ...props },
    ref
  ) {
    const { value: activeValue, setValue, orientation, listRef, baseId } =
      useTabsContext("TabsTrigger");
    const isSelected = activeValue === value;
    const triggerId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const focusAdjacent = (direction: "next" | "prev") => {
      const list = listRef.current;
      const current = triggerRef.current;
      if (!list || !current) return;
      const triggers = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      );
      const currentIndex = triggers.indexOf(current);
      if (currentIndex === -1) return;
      const nextIndex = getNextIndex(currentIndex, triggers.length, direction);
      const nextTrigger = triggers[nextIndex];
      nextTrigger?.focus();
      const nextValue = nextTrigger?.dataset.value;
      if (nextValue) {
        setValue(nextValue);
      }
    };

    return (
      <button
        ref={mergeRefs(ref, (node) => {
          triggerRef.current = node;
        })}
        id={triggerId}
        role="tab"
        type="button"
        data-value={value}
        aria-selected={isSelected}
        aria-controls={panelId}
        tabIndex={isSelected ? 0 : -1}
        className={clsx(
          "rounded-full px-4 py-2 text-sm font-medium transition",
          FOCUS_VISIBLE_RING,
          "data-[state=active]:bg-accent data-[state=active]:text-accentOn dark:data-[state=active]:bg-dark-accent dark:data-[state=active]:text-dark-accentOn",
          !isSelected &&
            "text-textMuted hover:bg-surfaceMuted dark:text-dark-textMuted dark:hover:bg-dark-surfaceMuted",
          className
        )}
        data-state={isSelected ? "active" : "inactive"}
        onClick={composeEventHandlers(onClick, () => {
          setValue(value);
        })}
        onKeyDown={composeEventHandlers(onKeyDown, (event) => {
          if (
            (orientation === "horizontal" &&
              (event.key === "ArrowRight" || event.key === "ArrowLeft")) ||
            (orientation === "vertical" &&
              (event.key === "ArrowDown" || event.key === "ArrowUp"))
          ) {
            event.preventDefault();
            focusAdjacent(
              event.key === "ArrowRight" || event.key === "ArrowDown"
                ? "next"
                : "prev"
            );
          }
          if (event.key === "Home") {
            event.preventDefault();
            const list = listRef.current;
            const first = list?.querySelector<HTMLButtonElement>('[role="tab"]');
            first?.focus();
            const nextValue = first?.dataset.value;
            if (nextValue) setValue(nextValue);
          }
          if (event.key === "End") {
            event.preventDefault();
            const list = listRef.current;
            const triggers = list
              ? Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
              : [];
            const last = triggers.at(-1);
            last?.focus();
            const nextValue = last?.dataset.value;
            if (nextValue) setValue(nextValue);
          }
        })}
        {...props}
      >
        {children}
      </button>
    );
  }
);

function getNextIndex(
  currentIndex: number,
  length: number,
  direction: "next" | "prev"
) {
  if (currentIndex === -1) return 0;
  if (direction === "next") {
    return currentIndex + 1 < length ? currentIndex + 1 : 0;
  }
  return currentIndex - 1 >= 0 ? currentIndex - 1 : length - 1;
}

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ value, className, children, ...props }, ref) {
    const { value: activeValue, baseId } = useTabsContext("TabsContent");
    const isSelected = activeValue === value;
    const triggerId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <div
        ref={ref}
        id={panelId}
        role="tabpanel"
        aria-labelledby={triggerId}
        tabIndex={0}
        hidden={!isSelected}
        data-state={isSelected ? "active" : "inactive"}
        className={clsx(
          "rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed text-text shadow-xs dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
          className
        )}
        {...props}
      >
        {isSelected ? children : null}
      </div>
    );
  }
);
