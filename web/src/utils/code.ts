import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { sentenceCase } from "@notion-site/common/utils/case.js";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import { SelectionRange } from "./selection-range";

export const highlightCode =
  (language: zNotion.blocks.language) => (code: string) => {
    if (language === "plain text") return code;
    const prismLanguage = mapLanguage(language);
    return Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage);
  };

export function mapLanguage(language: zNotion.blocks.language) {
  switch (language) {
    case "plain text":
      return "none";
    case "typescript":
      return "tsx";
    case "javascript":
      return "jsx";
    default:
      return language;
  }
}

export function showLanguage(language: zNotion.blocks.language) {
  return (
    LanguageOptions.find((option) => option.id === language)?.title ??
    sentenceCase(language)
  );
}

export function normalizeIndent(
  text: string,
  { tabCharacter }: { tabCharacter: string },
) {
  return text
    .split("\n")
    .map((line) =>
      line.replace(/^(\s+)/, (spaces) => spaces.replace(/\t/, tabCharacter)),
    )
    .join("\n");
}

export function* getLines(text: string, { start, end }: SelectionRange) {
  const selection: SelectionRange = { start: 0, end: 0 };

  for (const line of text.split("\n")) {
    selection.end += line.length + 1;

    if (selection.end < start) {
      selection.start += line.length + 1;
    } else {
      yield line;
    }

    if (selection.end >= end) break;
  }

  return selection;
}

export const LanguageOptions = [
  {
    id: "bash",
    title: "Bash",
  },
  {
    id: "css",
    title: "CSS",
  },
  {
    id: "html",
    title: "HTML",
  },
  {
    id: "javascript",
    title: "Javascript",
  },
  {
    id: "json",
    title: "JSON",
  },
  {
    id: "markdown",
    title: "Markdown",
  },
  {
    id: "plain text",
    title: "Plain Text",
  },
  {
    id: "scss",
    title: "SCSS",
  },
  {
    id: "typescript",
    title: "Typescript",
  },
  {
    id: "yaml",
    title: "Yaml",
  },
] as const;
