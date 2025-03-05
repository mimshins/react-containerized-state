import { useCallback } from "react";
import type { CallableFunction, Container, Updater } from "./types";

const useUpdate = <T>(container: Container<T>): Updater<T> => {
  return useCallback(
    state => {
      const newStateValue =
        typeof state === "function"
          ? (state as CallableFunction<[T], T>)(container.getValue())
          : state;

      return container.setValue(newStateValue);
    },
    [container],
  );
};

export default useUpdate;
