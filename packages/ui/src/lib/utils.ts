"use client";

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type MutableRefObject,
  type Ref,
  useCallback,
  useInsertionEffect,
  useRef,
  useState
} from "react";

type ReactRef<T> = Ref<T> | undefined;

export function mergeRefs<T>(...refs: ReactRef<T>[]) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as MutableRefObject<T>).current = value;
      }
    });
  };
}

type EventHandler<E> = (event: E) => void;

export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalHandler: EventHandler<E> | undefined,
  ourHandler: EventHandler<E> | undefined
) {
  return (event: E) => {
    originalHandler?.(event);
    if (!event.defaultPrevented) {
      ourHandler?.(event);
    }
  };
}

type UseControllableStateParams<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
};

export function useControllableState<T>({
  value,
  defaultValue,
  onChange
}: UseControllableStateParams<T>) {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? (value as T) : internalValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [currentValue, setValue] as const;
}

export type PolymorphicProps<E extends ElementType, OwnProps> = OwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof OwnProps | "as"> & {
    as?: E;
  };

export function useIsomorphicLayoutEffect(
  effect: Parameters<typeof useInsertionEffect>[0],
  deps?: Parameters<typeof useInsertionEffect>[1]
) {
  // useInsertionEffect runs synchronously before mutations on the client and
  // falls back to useEffect on the server, which keeps tooltip animations
  // consistent during hydration.
  return useInsertionEffect(effect, deps);
}
