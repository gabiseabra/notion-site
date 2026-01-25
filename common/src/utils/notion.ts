import { zNotion } from "../dto/notion/schema/index.js";
import { hasPropertyValue } from "./guards.js";

export function titleToString({ title }: zNotion.properties.title) {
  return (
    title
      .filter(hasPropertyValue("type", "text"))
      .map((text) => text.text.content)
      .join(" ") || undefined
  );
}
