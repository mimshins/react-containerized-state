import type { ComputeValue, EqualityCheckFunction } from "containerized-state";
import { useMemo } from "react";
import type { Container } from "./types";
import { useSyncExternalStoreWithSelector } from "./use-sync-external-store.ts";

/**
 * Custom hook that subscribes to a container and computes a derived value.
 *
 * @param container - The container to subscribe to and retrieve the value from.
 * @param compute - The function to compute the derived value from the container's value.
 * @param [isEqual] - Optional function to compare the previous and next computed values.
 *
 * @example
 * // Example usage:
 * const container = new StateContainer({ count: 0, step: 1 });
 * const computeDouble = (state) => state.count * 2;
 * const doubleCount = useComputedValue(container, computeDouble);
 */
const useComputedValue = <T, P>(
  container: Container<T>,
  compute: ComputeValue<T, P>,
  isEqual?: EqualityCheckFunction<P>,
): P => {
  const { subscribe, getServerSnapshot, getSnapshot } = useMemo(
    () => ({
      subscribe: container.subscribe.bind(container),
      getSnapshot: container.getValue.bind(container),
      getServerSnapshot: container.getValue.bind(container),
    }),
    [container],
  );

  const snapshot = useSyncExternalStoreWithSelector(
    subscribe,
    getSnapshot,
    getServerSnapshot,
    compute,
    isEqual,
  );

  return snapshot;
};

export default useComputedValue;
