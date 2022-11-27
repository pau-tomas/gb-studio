export const indexBy =
  <
    K extends string | number | symbol,
    T extends {
      [Property in K]: string | number;
    }
  >(
    property: K
  ) =>
  (arr: T[]) =>
    arr.reduce((memo, elem) => {
      const key = elem[property];
      return {
        ...memo,
        [key]: elem,
      };
    }, {} as Record<K, T>);

export const indexByFn =
  <T>(fn: (item: T, index?: number, arr?: T[]) => string) =>
  (arr: T[]) =>
    arr.reduce((memo, elem, index) => {
      const key = fn(elem, index, arr);
      return {
        ...memo,
        [key]: elem,
      };
    }, {} as Record<string, T>);

export const groupBy =
  <
    K extends string | number | symbol,
    T extends {
      [Property in K]: string | number;
    }
  >(
    property: K
  ) =>
  (arr: T[]) =>
    arr.reduce((memo, elem) => {
      const key = String(elem[property]) as string;
      return {
        ...memo,
        [key as string]: ([] as T[]).concat(memo[key] || [], elem),
      };
    }, {} as Record<string, T[]>);

export const flatten = <T>(arr: Array<T | T[]>): T[] =>
  ([] as T[]).concat(...arr);

export const chunk = <T>(arr: T[], len?: number): T[][] => {
  if (!len) {
    return [arr];
  }

  const chunks: T[][] = [];
  const n = arr.length;
  let i = 0;
  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
};
