import * as React from "react";

const useSyncStore = <T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T,
) => {
  const getIsomorphicSnapshot =
    typeof document !== "undefined"
      ? getSnapshot
      : getServerSnapshot ?? getSnapshot;

  const [state, setState] = React.useState(getIsomorphicSnapshot);

  const onStoreChange = React.useCallback(
    () => setState(() => getIsomorphicSnapshot()),
    [getIsomorphicSnapshot],
  );

  React.useEffect(() => subscribe(onStoreChange), [subscribe, onStoreChange]);

  return state;
};

/* eslint-disable */
// @ts-expect-error We use `toString()` to prevent bundlers from trying to `import { useSyncExternalStore } from "react"`
const useSyncExternalStore = (React["useSyncExternalStore".toString()] ??
  useSyncStore) as typeof useSyncStore;
/* eslint-enable */

export default useSyncExternalStore;
