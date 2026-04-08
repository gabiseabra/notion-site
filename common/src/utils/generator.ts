export function runGenerator<T, TReturn>(
  gen: Generator<T, TReturn>,
): { values: T[]; result: TReturn } {
  const values: T[] = [];
  while (true) {
    const { value, done } = gen.next();
    if (done) {
      return { values, result: value };
    }
    values.push(value);
  }
}
