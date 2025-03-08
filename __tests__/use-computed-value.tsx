import { act, render, renderHook, screen } from "@testing-library/react";
import { AsyncStateContainer, StateContainer } from "containerized-state";
import { describe, expect, it, vitest } from "vitest";
import { useComputedValue, useUpdate } from "../src/index.ts";
import createPromiseResolvers from "./utils/create-promise-resolvers.ts";

describe("use-computed-value", () => {
  it("should read a container with initial value", () => {
    const c1 = new StateContainer({ a: 1, b: 2 });
    const c2 = new AsyncStateContainer({ a: 1, b: 2 });

    const c1Render = renderHook(() => useComputedValue(c1, s => s.a + s.b));

    expect(c1Render.result.current).toBe(3);

    const c2Render = renderHook(() => useComputedValue(c2, s => s.a + s.b));

    expect(c2Render.result.current).toBe(3);
  });

  it("should update the value and notify subscribers", async () => {
    const c1 = new StateContainer({ a: 1, b: 1 });
    const c2 = new AsyncStateContainer({ a: 1, b: 1 });

    const promiseResolver = createPromiseResolvers();
    const renderSpy = vitest.fn();

    const TestComponent = () => {
      renderSpy();

      const v1 = useComputedValue(c1, s => s.a * s.b);
      const v2 = useComputedValue(c2, s => s.a * s.b);

      const v1Updater = useUpdate(c1);
      const v2Updater = useUpdate(c2);

      return (
        <>
          <span data-testid="v1">{v1}</span>
          <span data-testid="v2">{v2}</span>
          <button
            data-testid="v1-btn"
            onClick={() => void v1Updater(() => ({ a: 2, b: 1 }))}
          ></button>
          <button
            data-testid="v2-btn"
            onClick={() => {
              void (async () => {
                await v2Updater(v => ({ ...v, b: 2 }));
                promiseResolver.resolve();
              })();
            }}
          ></button>
          <button
            data-testid="set-btn"
            onClick={() => {
              void (async () => {
                await Promise.all([
                  v1Updater({ a: 0, b: 0 }),
                  v2Updater({ a: 0, b: 0 }),
                ]);

                promiseResolver.resolve();
              })();
            }}
          ></button>
        </>
      );
    };

    render(<TestComponent />);

    expect(c1.getValue()).toEqual({ a: 1, b: 1 });
    expect(screen.getByTestId("v1")).toHaveTextContent("1");

    expect(renderSpy).toHaveBeenCalledTimes(1);

    const v1Btn = screen.getByTestId("v1-btn");
    const v2Btn = screen.getByTestId("v2-btn");

    act(() => {
      v1Btn.click();
    });

    expect(c1.getValue()).toEqual({ a: 2, b: 1 });
    expect(screen.getByTestId("v1")).toHaveTextContent("2");

    expect(renderSpy).toHaveBeenCalledTimes(2);

    act(() => {
      v2Btn.click();
    });

    await promiseResolver.promise;

    expect(c2.getValue()).toEqual({ a: 1, b: 2 });
    expect(screen.getByTestId("v2")).toHaveTextContent("2");

    expect(renderSpy).toHaveBeenCalledTimes(3);

    await act(async () => {
      c1.setValue({ a: 1 / 2, b: 4 });
      await c2.setValue({ a: 4, b: 1 / 2 });
    });

    expect(c1.getValue()).toEqual({ a: 1 / 2, b: 4 });
    expect(screen.getByTestId("v1")).toHaveTextContent("2");

    expect(c2.getValue()).toEqual({ a: 4, b: 1 / 2 });
    expect(screen.getByTestId("v2")).toHaveTextContent("2");

    expect(renderSpy).toHaveBeenCalledTimes(3);

    promiseResolver.renew();

    const setBtn = screen.getByTestId("set-btn");

    act(() => {
      setBtn.click();
    });

    await promiseResolver.promise;

    expect(c1.getValue()).toEqual({ a: 0, b: 0 });
    expect(c2.getValue()).toEqual({ a: 0, b: 0 });
    expect(screen.getByTestId("v1")).toHaveTextContent("0");
    expect(screen.getByTestId("v2")).toHaveTextContent("0");

    expect(renderSpy).toHaveBeenCalledTimes(4);
  });
});
