export interface LoadableComponent<T> {
  waitForLoaded(): Promise<T>;
}
