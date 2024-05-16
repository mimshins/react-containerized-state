export type CallableFunction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs extends any[] = [],
  TReturn = void,
> = (...args: TArgs) => TReturn;

export type SubscribeCallback<T> = (value: T) => void;
export type Unsubscribe = () => void;

export type ContainerInitializer<T> = T | CallableFunction<[], T>;
