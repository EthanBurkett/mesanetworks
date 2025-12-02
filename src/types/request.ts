export type Params<T extends string> = {
  params: Promise<{
    [key in T]: string;
  }>;
};
