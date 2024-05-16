/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react";
import type {
  CallableFunction,
  ContainerInitializer,
  EqualityCheckFunction,
  SelectedSubscribeEntry,
  SubscribeCallback,
  Unsubscribe,
  ValueSelector,
} from "./types";
import useLazyInitializedValue from "./use-lazy-initialized-value";
import {
  useSyncExternalStore,
  useSyncExternalStoreWithSelector,
} from "./use-sync-external-store";

class Container<T> {
  private _value: T;
  private _subscribers: Set<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SubscribeCallback<T> | SelectedSubscribeEntry<T, any>
  >;

  constructor(initializer: ContainerInitializer<T>) {
    const initialValue =
      typeof initializer === "function"
        ? (initializer as CallableFunction<[], T>)()
        : initializer;

    this._value = initialValue;
    this._subscribers = new Set();
  }

  /**
   * Subscribes to the changes of the container's state value
   * and returns the unsubscribe function.
   */
  public subscribe(subscribeCallback: SubscribeCallback<T>): Unsubscribe {
    this._subscribers.add(subscribeCallback);

    const unsubscribe: Unsubscribe = () => {
      this._subscribers.delete(subscribeCallback);
    };

    return unsubscribe;
  }

  /**
   * Subscribes to the changes of the container's selected state values
   * and returns the unsubscribe function.
   *
   * For more control over emission changes, you may provide a custom equality function.
   */
  public selectedSubscribe<P>(
    selector: ValueSelector<T, P>,
    subscribeCallback: SubscribeCallback<P>,
    /**
     * A custom equality function to control emission changes.
     */
    isEqual?: EqualityCheckFunction<P>,
  ): Unsubscribe {
    const entry: SelectedSubscribeEntry<T, P> = {
      type: "SELECTED_SUBSCRIBE_ENTRY",
      selector,
      subscribeCallback,
      isEqual,
    };

    this._subscribers.add(entry);

    const unsubscribe: Unsubscribe = () => {
      this._subscribers.delete(entry);
    };

    return unsubscribe;
  }

  /**
   * Gets the value of the state.
   *
   * Please note that this function is not reactive!
   * Avoid using this in the React's rendering phase.
   */
  public getValue(): T {
    return this._value;
  }

  /**
   * Updates the value of the state and notifies the subscribers.
   */
  public updateValue(newValue: T): void {
    const prevValue = this._value;

    this._value = newValue;

    this._subscribers.forEach(entry => {
      if ("type" in entry) {
        if (entry.type !== "SELECTED_SUBSCRIBE_ENTRY") return;

        const { selector, subscribeCallback, isEqual } = entry;

        const selectedValue = selector(newValue) as unknown;
        const selectedPrevValue = selector(prevValue) as unknown;

        const shouldEmit = !(
          isEqual?.(selectedPrevValue, selectedValue) ??
          Object.is(selectedValue, selectedPrevValue)
        );

        if (!shouldEmit) return;

        subscribeCallback(selectedValue);
      } else {
        if (Object.is(prevValue, newValue)) return;

        entry(newValue);
      }
    });
  }

  /**
   * A React hook to read the value of the state.
   *
   * This is a reactive function and updates on state value change.
   */
  public useValue(): T {
    const storeSubscribe = useLazyInitializedValue(() =>
      this.subscribe.bind(this),
    );

    const getClientSnapshot = useLazyInitializedValue(() =>
      this.getValue.bind(this),
    );

    const getServerSnapshot = getClientSnapshot;

    const snapshot = useSyncExternalStore(
      storeSubscribe,
      getClientSnapshot,
      getServerSnapshot,
    );

    return snapshot;
  }

  /**
   * A React hook to read the values of the selected states.
   *
   * This is a reactive function and updates on selected state values change.
   *
   * For more control over re-rendering, you may provide a custom equality function.
   */
  public useValueSelector<P>(
    selector: ValueSelector<T, P>,
    /**
     * A custom equality function to control re-rendering.
     */
    isEqual?: EqualityCheckFunction<P>,
  ): P {
    const storeSubscribe = useLazyInitializedValue(() =>
      this.subscribe.bind(this),
    );

    const getClientSnapshot = useLazyInitializedValue(() =>
      this.getValue.bind(this),
    );

    const getServerSnapshot = getClientSnapshot;

    const snapshot = useSyncExternalStoreWithSelector(
      storeSubscribe,
      getClientSnapshot,
      getServerSnapshot,
      selector,
      isEqual,
    );

    return snapshot;
  }

  /**
   * A React hook to update the value of the state and notify the subscribers.
   */
  public useUpdateValue() {
    const updateValue = React.useCallback<
      React.Dispatch<React.SetStateAction<T>>
    >(state => {
      const newStateValue =
        typeof state === "function"
          ? (state as CallableFunction<[T], T>)(this._value)
          : state;

      this.updateValue(newStateValue);
    }, []);

    return updateValue;
  }
}

export default Container;
