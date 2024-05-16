export type CallableFunction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs extends any[] = [],
  TReturn = void,
> = (...args: TArgs) => TReturn;

export type SubscribeCallback<T> = (value: T) => void;
export type Unsubscribe = () => void;

export type ValueSelector<T, P> = (value: T) => P;

export type EqualityCheckFunction<P> = (a: P, b: P) => boolean;

export type SelectedSubscribeEntry<T, P> = {
  type: "SELECTED_SUBSCRIBE_ENTRY";
  subscribeCallback: SubscribeCallback<P>;
  selector: ValueSelector<T, P>;
  isEqual?: EqualityCheckFunction<P>;
};

export type ContainerInitializer<T> = T | CallableFunction<[], T>;
