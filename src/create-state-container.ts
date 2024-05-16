import Container from "./Container";
import type { ContainerInitializer } from "./types";

const createStateContainer = <T>(initializer: ContainerInitializer<T>) => {
  const container = new Container(initializer);

  return container;
};

export default createStateContainer;
