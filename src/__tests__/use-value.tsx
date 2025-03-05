import { act, render, renderHook, screen } from "@testing-library/react";
import { AsyncStateContainer, StateContainer } from "containerized-state";
import { describe, expect, it, vitest } from "vitest";
import { useUpdate, useValue } from "../index.ts";
import createPromiseResolvers from "./utils/create-promise-resolvers.ts";

describe("use-value", () => {
  it("should read a container with initial value", () => {
    const c1 = new StateContainer(42);
    const c2 = new AsyncStateContainer(42);

    const c1Render = renderHook(() => useValue(c1));

    expect(c1Render.result.current).toBe(42);

    const c2Render = renderHook(() => useValue(c2));

    expect(c2Render.result.current).toBe(42);
  });

  it("should update the value and notify subscribers", async () => {
    const c1 = new StateContainer(42);
    const c2 = new AsyncStateContainer(42);

    const promiseResolver = createPromiseResolvers();
    const renderSpy = vitest.fn();

    const TestComponent = () => {
      renderSpy();

      const v1 = useValue(c1);
      const v2 = useValue(c2);

      const v1Updater = useUpdate(c1);
      const v2Updater = useUpdate(c2);

      return (
        <>
          <span data-testid="v1">{v1}</span>
          <span data-testid="v2">{v2}</span>
          <button
            data-testid="v1-btn"
            onClick={() => void v1Updater(v => v + 1)}
          ></button>
          <button
            data-testid="v2-btn"
            onClick={() => {
              void (async () => {
                await v2Updater(v => v + 1);
                promiseResolver.resolve();
              })();
            }}
          ></button>
          <button
            data-testid="set-btn"
            onClick={() => {
              void (async () => {
                await Promise.all([v1Updater(0), v2Updater(0)]);

                promiseResolver.resolve();
              })();
            }}
          ></button>
        </>
      );
    };

    render(<TestComponent />);

    const v1Btn = screen.getByTestId("v1-btn");
    const v2Btn = screen.getByTestId("v2-btn");

    expect(renderSpy).toHaveBeenCalledTimes(1);

    act(() => {
      v1Btn.click();
    });

    expect(c1.getValue()).toBe(43);
    expect(screen.getByTestId("v1")).toHaveTextContent("43");

    expect(renderSpy).toHaveBeenCalledTimes(2);

    act(() => {
      v2Btn.click();
    });

    await promiseResolver.promise;

    expect(c2.getValue()).toBe(43);
    expect(screen.getByTestId("v2")).toHaveTextContent("43");

    expect(renderSpy).toHaveBeenCalledTimes(3);

    await act(async () => {
      c1.setValue(43);
      await c2.setValue(43);
    });

    expect(c1.getValue()).toEqual(43);
    expect(screen.getByTestId("v1")).toHaveTextContent("43");

    expect(c2.getValue()).toEqual(43);
    expect(screen.getByTestId("v2")).toHaveTextContent("43");

    expect(renderSpy).toHaveBeenCalledTimes(3);

    promiseResolver.renew();

    const setBtn = screen.getByTestId("set-btn");

    act(() => {
      setBtn.click();
    });

    await promiseResolver.promise;

    expect(c1.getValue()).toBe(0);
    expect(c2.getValue()).toBe(0);
    expect(screen.getByTestId("v1")).toHaveTextContent("0");
    expect(screen.getByTestId("v2")).toHaveTextContent("0");

    expect(renderSpy).toHaveBeenCalledTimes(4);
  });
});
