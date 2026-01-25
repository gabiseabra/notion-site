export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

export function sentenceCase(str: string): string {
  const lower = str.toLowerCase();
  const index = lower.search(/[a-z0-9]/);

  if (index === -1) {
    return lower;
  }

  return (
    lower.slice(0, index) + lower[index].toUpperCase() + lower.slice(index + 1)
  );
}
