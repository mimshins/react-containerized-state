/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AsyncStateContainer, StateContainer } from "containerized-state";
import type { SetStateAction } from "react";

export type CallableFunction<TArgs extends any[] = [], TReturn = void> = (
  ...args: TArgs
) => TReturn;

export type Container<T> = StateContainer<T> | AsyncStateContainer<T>;

export type Updater<T> = (state: SetStateAction<T>) => void | Promise<void>;
/* eslint-enable @typescript-eslint/no-explicit-any */
