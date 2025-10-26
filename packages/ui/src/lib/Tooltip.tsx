import type { ReactElement, ReactNode, Ref } from "react";
import {
  cloneElement,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import clsx from "clsx";

import {
  composeEventHandlers,
  mergeRefs,
  useControllableState
} from "./utils";

export type TooltipPlacement = "top" | "bottom";

export type TooltipProps = {
  children: ReactElement;
  className?: string;
  content: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  delay?: number;
};

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  function Tooltip(
    {
      children,
      className,
      content,
      open: openProp,
      onOpenChange,
      placement = "top",
      delay = 120
    },
    ref
  ) {
    const triggerRef = useRef<HTMLElement | null>(null);
    const tooltipId = useId();
    const [open, setOpen] = useControllableState<boolean>({
      value: openProp,
      defaultValue: false,
      onChange: onOpenChange
    });
    const [render, setRender] = useState(open);
    const enterTimer = useRef<number>();
    const exitTimer = useRef<number>();

    useEffect(() => {
      if (open) {
        setRender(true);
        return;
      }
      const timeout = window.setTimeout(() => setRender(false), 80);
      return () => window.clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
      return () => {
        if (enterTimer.current) {
          window.clearTimeout(enterTimer.current);
        }
        if (exitTimer.current) {
          window.clearTimeout(exitTimer.current);
        }
      };
    }, []);

    const show = () => {
      if (exitTimer.current) {
        window.clearTimeout(exitTimer.current);
      }
      enterTimer.current = window.setTimeout(() => setOpen(true), delay);
    };

    const hide = () => {
      if (enterTimer.current) {
        window.clearTimeout(enterTimer.current);
      }
      exitTimer.current = window.setTimeout(() => setOpen(false), 60);
    };

    const childWithRef = children as typeof children & {
      ref?: Ref<HTMLElement>;
    };

    const trigger = cloneElement(childWithRef, {
      ref: mergeRefs(childWithRef.ref, (node: HTMLElement | null) => {
        triggerRef.current = node;
      }),
      onFocus: composeEventHandlers(childWithRef.props.onFocus, () => {
        show();
      }),
      onBlur: composeEventHandlers(childWithRef.props.onBlur, () => {
        hide();
      }),
      onMouseEnter: composeEventHandlers(
        childWithRef.props.onMouseEnter,
        () => {
          show();
        }
      ),
      onMouseLeave: composeEventHandlers(
        childWithRef.props.onMouseLeave,
        () => {
          hide();
        }
      ),
      "aria-describedby": open ? tooltipId : undefined
    });

    return (
      <span
        ref={ref}
        className={clsx("relative inline-flex", className)}
        data-placement={placement}
      >
        {trigger}
        {render ? (
          <span
            role="tooltip"
            id={tooltipId}
            aria-hidden={!open}
            className={clsx(
              "pointer-events-none absolute left-1/2 z-10 min-w-[8rem] -translate-x-1/2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-text shadow-sm transition-opacity duration-100 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text",
              placement === "top"
                ? "bottom-full mb-2 origin-bottom"
                : "top-full mt-2 origin-top",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            {content}
          </span>
        ) : null}
      </span>
    );
  }
);
