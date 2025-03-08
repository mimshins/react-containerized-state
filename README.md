# react-containerized-state

A set of React hooks designed to seamlessly integrate the `containerized-state` package into your React project.

Utilizing these hooks with React components offers significant advantages over the built-in `useState` hook by eliminating unnecessary re-renders and enhancing state shareability. They are optimized to ensure that only the components requiring the container's value (via the `useValue`() hook) or the selected/computed values (via the `useComputedValue`() hook) are re-rendered upon state changes.

[![license](https://img.shields.io/github/license/mimshins/react-containerized-state?color=010409&style=for-the-badge)](https://github.com/mimshins/react-containerized-state/blob/main/LICENSE)
[![npm latest package](https://img.shields.io/npm/v/react-containerized-state?color=010409&style=for-the-badge)](https://www.npmjs.com/package/react-containerized-state)
[![npm downloads](https://img.shields.io/npm/dt/react-containerized-state?color=010409&style=for-the-badge)](https://www.npmjs.com/package/react-containerized-state)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-containerized-state?color=010409&style=for-the-badge)](https://bundlephobia.com/package/react-containerized-state)


## Installation

To install the package, run:

```bash
npm install containerized-state react-containerized-state
# Or via any other package manager
```

## Basic usage

Consider the following example:

```tsx
import { StateContainer } from "containerized-state";
import { useValue, useUpdate } from "react-containerized-state";

// You can move this container to a separate module and share it across your app
const counter = new StateContainer(0);

const Controls = () => {
  const updateCount = useUpdate(counter);

  const increase = (n: number) => {
    updateCount(c => c + n);
  };

  return (
    <div>
      <button onClick={() => increase(1)}>Increase by 1</button>
      <button onClick={() => increase(5)}>Increase by 5</button>
      <button onClick={() => increase(10)}>Increase by 10</button>
    </div>
  );
};

const Display = () => {
  const count = useValue(counter);

  return <div>Count: {count}</div>;
};

const Container = () => {
  return (
    <div>
      <h2>Container</h2>
      <Controls />
      <Display />
    </div>
  );
};

const Page = () => {
  return (
    <main>
      <Container />
    </main>
  );
};

export default Page;
```

In this example, when the user clicks on the buttons of the `Controls` component, the state changes, and each component subscribed to the container via the `useValue` hook will be notified and re-rendered accordingly. Specifically, only the `Display` component will re-render on state change.

You can also use this container with non-React components. For instance, you can add the following line to the example above, outside of any React component:

```ts
// Logs the new value on state change
counter.subscribe(console.log); 

setTimeout(() => {
  counter.setValue(100);
}, 2000);
```

This way, after 2 seconds, the value of the counter container updates to `100`, resulting in a state dispatch that notifies all subscribers of the container (including those in the React components).

## Usage with selectors (computed values)

In certain situations, you may need to store a complex state in your container. **It is recommended to use multiple small containers instead of a few large ones**. In these cases, you may not want to subscribe to all fields of the complex state. Instead, you might want to subscribe to different parts in different components or modules.

Consider the following example:

```tsx
import { StateContainer } from "containerized-state";
import { useUpdate, useComputedValue } from "react-containerized-state";

// You can move this container to a separate module and share it across your app
const complexState = new StateContainer({ a: 1, b: "2" });

const Controls = () => {
  const updateState = useUpdate(complexState);

  return (
    <div>
      <button
        onClick={() => {
          updateState(s => ({
            ...s,
            a: s.a + 1,
          }));
        }}
      >
        Update State.A
      </button>
      <button
        onClick={() => {
          updateState(s => ({
            ...s,
            b: String(Number(s.b) + 1),
          }));
        }}
      >
        Update State.B
      </button>
    </div>
  );
};

const DisplayA = () => {
  const a = useComputedValue(complexState, value => value.a);

  return <div>State.A: {a}</div>;
};

const DisplayB = () => {
  const b = useComputedValue(complexState, value => value.b);

  return <div>State.B: {b}</div>;
};

const Container = () => {
  return (
    <div>
      <h2>Container</h2>
      <Controls />
      <DisplayA />
      <DisplayB />
    </div>
  );
};

const Page = () => {
  return (
    <main>
      <Container />
    </main>
  );
};

export default Page;
```

In this example, when the user clicks the buttons in the `Controls` component, the state changes, and each component subscribed to a part of the container's state via the `useComputedValue` hook will be notified and re-rendered accordingly. Specifically, the DisplayA component re-renders only when `value.a` changes, and the DisplayB component re-renders only when `value.b` changes.

You can pass in any selector you want. Think of selectors as state transformers, allowing you to convert a complex state into a simpler, more manageable shape.

For example:

```tsx
const { a, b } = useComputedValue(complexState, value => ({ a: value.a, b: value.b}));

const valueOfB = seComputedValue(complexState, value => value.b);

// Or subscribe to a new computed value
const computedValue = useComputedValue(complexState, value => value.a * 2 + Number(value.b));
```

Cool, huh?

So, what about using the complex state in a non-React environment?
You can opt for `computedSubscribe` instead of `subscribe`.

For example:

```ts
// Logs the new value of `value.a` on selected state changes
complexState.computedSubscribe(value => value.a, console.log);
```

## More control of re-rendering and emission changes?

For more control over re-rendering (in a React environment) and emission changes (in a non-React environment), try passing the `isEqual` parameter to `useComputedValue` and `computedSubscribe`.

> By default, we are using `Object.is` as equality check function.

## API

For more information on container APIs and how to use them, check out [containerized-state's documentation](https://github.com/mimshins/containerized-state).

### `useValue`

```ts
declare const useValue: <T>(container: Container<T>) => T;
```

Custom hook that subscribes to a container and retrieves its current value.

### `useComputedValue`

```ts
type ComputeValue<T, P> = (value: T) => P;
type EqualityCheckFunction<P> = (prev: P, next: P) => boolean;

declare const useComputedValue: <T, P>(
  container: Container<T>,
  compute: ComputeValue<T, P>,
  isEqual?: EqualityCheckFunction<P>,
) => P;
```

Custom hook that subscribes to a container and computes a derived value.

### `useUpdate`

```ts
type Updater<T> = (state: SetStateAction<T>) => void | Promise<void>;

declare const useUpdate: <T>(container: Container<T>) => Updater<T>;
```

Custom hook that provides an updater function to set the value of a container.

## Contributing

Read the [contributing guide](https://github.com/mimshins/react-containerized-state/blob/main/CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements, and how to build and test your changes.

Contributing to "React Containerized State" is about more than just issues and pull requests! There are many other ways to support the project beyond contributing to the code base.

## License

This project is licensed under the terms of the [MIT license](https://github.com/mimshins/react-containerized-state/blob/main/LICENSE).
