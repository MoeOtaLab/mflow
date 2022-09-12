export type Model<
  P extends Record<string, any> = any,
  R extends Record<string, any> = any
> = (props: Partial<P>) => R;

export type Context<T = any> = {
  value: T;
};
