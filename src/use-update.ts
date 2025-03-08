import { useCallback } from "react";
import type { CallableFunction, Container, Updater } from "./types";

/**
 * Custom hook that provides an updater function to set the value of a container.
 *
 * @param container - The container to update.
 *
 * @example
 * // Example usage:
 * const container = new StateContainer(0);
 * const updateValue = useUpdate(container);
 * updateValue(42); // Sets the container value to 42
 * updateValue(prev => prev + 1); // Updates the container value using a function
 */
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
