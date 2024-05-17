# react-containerized-state

Fast and minimal state container which can be used and shared across React or non-React components.

Using it with React components is objectively better than built-in `useState` React hook due to the removal of unnecessary renders and the shareability of the states. It is optimized in a way that only the components that need the container's value (via `useValue()` hook) or the selected values (via `useValueSelector()` hook) are rendered upon state change.

[![license](https://img.shields.io/github/license/mimshins/react-containerized-state?color=010409&style=for-the-badge)](https://github.com/mimshins/react-containerized-state/blob/main/LICENSE)
[![npm latest package](https://img.shields.io/npm/v/react-containerized-state?color=010409&style=for-the-badge)](https://www.npmjs.com/package/react-containerized-state)
[![npm downloads](https://img.shields.io/npm/dt/react-containerized-state?color=010409&style=for-the-badge)](https://www.npmjs.com/package/react-containerized-state)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-containerized-state?color=010409&style=for-the-badge)](https://bundlephobia.com/package/react-containerized-state)


## Installation

To install the package, run:

```bash
npm install react-containerized-state
# Or via any other package manager
```

## Basic usage

Consider the following example:

```tsx
import { createStateContainer } from "react-containerized-state";

// You can move this container to a separate module and share it across your app
const counter = createStateContainer(0);

const Controls = () => {
  const updateCount = counter.useUpdateValue();

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
  const count = counter.useValue();

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

In this example, when the user clicks on the buttons of the `Controls` component, the state changes and each component that is subscribed to the container via `useValue` hook will be notified and re-rendered as a result. In other words, only the `Display` component re-renders on state change.

You can also use this container with non-React components as well. For example we can add this line to the example above outside of any React component:

```ts
// Logs the new value on state change
counter.subscribe(console.log); 

setTimeout(() => {
  counter.updateValue(100);
}, 2000);
```

This way, after 2 seconds the value of `counter` container updates to `100` resulting a state dispatch which calls all the subscribers of the container (including those in the React components).

## Usage with selectors

There may be situations where you have to store a complex state in your container (**It is recommended to have different small containers instead of several large ones**). In these cases, you may not want to subscribe to all the fields of the complex state. Instead you want to subscribe to different parts in different components or modules.

Consider the following example:

```tsx
import { createStateContainer } from "react-containerized-state";

// You can move this container to a separate module and share it across your app
const complexState = createStateContainer({ a: 1, b: "2" });

const Controls = () => {
  const updateState = complexState.useUpdateValue();

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
  const a = complexState.useValueSelector(value => value.a);

  return <div>State.A: {a}</div>;
};

const DisplayB = () => {
  const b = complexState.useValueSelector(value => value.b);

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

In this example, when the user clicks on the buttons of the `Controls` component, the state changes and each component that is subscribed to a part of the container's state via `useValueSelector` hook will be notified and re-rendered as a result. In other words, `DisplayA` component re-renders only when `value.a` changes (same thing for the `DisplayB` component and the value of `value.b` state.).

You can pass in any selector you want. Think of selectors as a state transformer where you can transform a complex state into another simpler shape.

For example:

```tsx
const { a, b } = complexState.useValueSelector(value => ({ a: value.a, b: value.b}));

const valueOfB = complexState.useValueSelector(value => value.b);

// Or subscribe to a new computed value
const computedValue = complexState.useValueSelector(value => value.a * 2 + Number(value.b));
```

Cool, huh?

So, what about using the complex state in a non-React environment?
You can opt-in `selectedSubscribe` instead of `subscribe`.

For example:

```ts
// Logs the new value of `value.a` on selected state changes
complexState.selectedSubscribe(value => value.a, console.log);
```

## More control of re-rendering and emission changes?

For more control over re-rendering (in React environment) and emission changes (in non-React environment) try to pass in `isEqual` parameter to the `useValueSelector` and `selectedSubscribe` (check the API section for more information).

> By default, we are using `Object.is` as equality check function.

## API

### `createStateContainer`:

```ts
declare const createStateContainer: <T>(initializer: T | (() => T)) => {
  /**
   * Subscribes to the changes of the container's state value
   * and returns the unsubscribe function.
   */
  subscribe(subscribeCallback: (value: T) => void): () => void;
  /**
   * Subscribes to the changes of the container's selected state values
   * and returns the unsubscribe function.
   *
   * For more control over emission changes, you may provide a custom equality function.
   */
  selectedSubscribe<P>(
    selector: (value: T) => P,
    subscribeCallback: (value: P) => void,
    /**
     * A custom equality function to control emission changes.
     */
    isEqual?: (a: P, b: P) => boolean,
  ): () => void;
  /**
   * Gets the value of the state.
   *
   * Please note that this function is not reactive!
   * Avoid using this in the React's rendering phase.
   */
  getValue(): T;
  /**
   * Updates the value of the state and notifies the subscribers.
   */
  updateValue(newValue: T): void;
  /**
   * A React hook to read the value of the state.
   *
   * This is a reactive function and updates on state value change.
   */
  useValue(): T;
  /**
   * A React hook to read the values of the selected states.
   *
   * This is a reactive function and updates on selected state values change.
   *
   * For more control over re-rendering, you may provide a custom equality function.
   */
  useValueSelector(
    selector: (value: T) => P,
    /**
     * A custom equality function to control re-rendering.
     */
    isEqual?: (a: P, b: P) => boolean,
  ): P;
  /**
   * A React hook to update the value of the state and notify the subscribers.
   */
  useUpdateValue(): React.Dispatch<React.SetStateAction<T>>;
};
```

A function that creates a container for the state to live in. This function needs the initial value of the state you are containerizing. You can provide a `initializer` parameter (which is either an initial value or a function returns the initial value) to initialize the state value.

## Contributing

Read the [contributing guide](https://github.com/mimshins/react-containerized-state/blob/main/CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements, and how to build and test your changes.

Contributing to "React Containerized State" is about more than just issues and pull requests! There are many other ways to support the project beyond contributing to the code base.

## License

This project is licensed under the terms of the [MIT license](https://github.com/mimshins/react-containerized-state/blob/main/LICENSE).
