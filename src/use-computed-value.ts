import type { ComputeValue, EqualityCheckFunction } from "containerized-state";
import { useMemo } from "react";
import type { Container } from "./types";
import { useSyncExternalStoreWithSelector } from "./use-sync-external-store.ts";

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
