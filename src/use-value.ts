import { useMemo } from "react";
import type { Container } from "./types";
import { useSyncExternalStore } from "./use-sync-external-store.ts";

const useValue = <T>(container: Container<T>): T => {
  const { subscribe, getServerSnapshot, getSnapshot } = useMemo(
    () => ({
      subscribe: container.subscribe.bind(container),
      getSnapshot: container.getValue.bind(container),
      getServerSnapshot: container.getValue.bind(container),
    }),
    [container],
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return snapshot;
};

export default useValue;
