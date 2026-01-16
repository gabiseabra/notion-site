import * as zn from "../dto/notion/schema.js";
import { hasPropertyValue } from "./guards.js";

export function titleToString({ title }: zn.title) {
  return (
    title
      .filter(hasPropertyValue("type", "text"))
      .map((text) => text.text.content)
      .join(" ") || undefined
  );
}
