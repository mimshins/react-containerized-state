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

  public subscribe(subscribeCallback: SubscribeCallback<T>) {
    this._subscribers.add(subscribeCallback);

    const unsubscribe: Unsubscribe = () => {
      this._subscribers.delete(subscribeCallback);
    };

    return unsubscribe;
  }

  public getValue() {
    return this._value;
  }

  public updateValue(newValue: T) {
    this._value = newValue;

    this._subscribers.forEach(subscriber => subscriber(newValue));
  }

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
