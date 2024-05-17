/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallableFunction<TArgs extends any[] = [], TReturn = void> = (
  ...args: TArgs
) => TReturn;

export type SubscribeCallback<T> = (value: T) => void;
export type Unsubscribe = () => void;

export type ValueSelector<T, P> = (value: T) => P;

export type EqualityCheckFunction<P> = (a: P, b: P) => boolean;

export type SelectedSubscribeEntry<T, P> = {
  type: "selected";
  subscribeCallback: SubscribeCallback<P>;
  selector: ValueSelector<T, P>;
  isEqual?: EqualityCheckFunction<P>;
};

export type DefaultSubscribeEntry<T> = {
  type: "default";
  subscribeCallback: SubscribeCallback<T>;
};

export type SubscribeEntry<T> =
  | DefaultSubscribeEntry<T>
  | SelectedSubscribeEntry<T, any>;

export type ContainerInitializer<T> = T | CallableFunction<[], T>;
