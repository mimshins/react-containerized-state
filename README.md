# react-containerized-state

Fast and minimal state container which can be used and shared across React or non-React components.

Using it with React components is objectively better than built-in `useState` React hook due to the removal of unnecessary renders. It is optimized in a way that only the components that need the container's value (via `useValue()` hook) are rendered upon state change.


## Installation

To install the package, run:

```bash
npm install react-containerized-state
# Or via any other package manager
```

## Usage

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

## API

### `createStateContainer`:

```ts
declare const createStateContainer: <T>(initializer: T | (() => T)) => {
  subscribe(subscribeCallback: (value: T) => void): () => void;
  getValue(): T;
  updateValue(newValue: T): void;
  useValue(): T;
  useUpdateValue(): React.Dispatch<React.SetStateAction<T>>;
};
```

A function that creates a container for the state to live in. This function needs the initial value of the state you are containerizing. You can provide a `initializer` parameter (which is either an initial value or a function returns the initial value) to initialize the state value.

## Contributing

Read the [contributing guide](https://github.com/mimshins/react-containerized-state/blob/main/CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements, and how to build and test your changes.

Contributing to "React Containerized State" is about more than just issues and pull requests! There are many other ways to support the project beyond contributing to the code base.

## License

This project is licensed under the terms of the [MIT license](https://github.com/mimshins/react-containerized-state/blob/main/LICENSE).