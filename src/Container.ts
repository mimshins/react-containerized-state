/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react";
import type {
  CallableFunction,
  ContainerInitializer,
  SubscribeCallback,
  Unsubscribe,
} from "./types";
import useLazyInitializedValue from "./use-lazy-initialized-value";
import useSyncExternalStore from "./use-sync-external.store";

class Container<T> {
  private _value: T;
  private _subscribers: Set<SubscribeCallback<T>>;

  constructor(initializer: ContainerInitializer<T>) {
    const initialValue =
      typeof initializer === "function"
        ? (initializer as CallableFunction<[], T>)()
        : initializer;

    this._value = initialValue;
    this._subscribers = new Set();
  }

  /**
   * Subscribes to the container changes and returns the unsubscribe function.
   */
  public subscribe(subscribeCallback: SubscribeCallback<T>) {
    this._subscribers.add(subscribeCallback);

    const unsubscribe: Unsubscribe = () => {
      this._subscribers.delete(subscribeCallback);
    };

    return unsubscribe;
  }

  /**
   * Gets the value of the state.
   *
   * Please note that this function is not reactive!
   * Avoid using this in the React's rendering phase.
   */
  public getValue() {
    return this._value;
  }

  /**
   * Updates the value of the state and notifies the subscribers.
   */
  public updateValue(newValue: T) {
    this._value = newValue;

    this._subscribers.forEach(subscriber => subscriber(newValue));
  }

  /**
   * A React hook to read the value of the state.
   *
   * This is a reactive function and will be updated on state change.
   */
  public useValue() {
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
