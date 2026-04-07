import { Notion } from "@notion-site/common/utils/notion/index.js";
import { a, p, span } from "@notion-site/common/utils/notion/wip.js";
import { useLocalStorage } from "usehooks-ts";
import { Editor } from "../components/content/Editor.js";
import { useContentEditor } from "../components/content/editor/use-content-editor";
import { Favicon } from "../components/display/Favicon.js";
import { Icon } from "../components/display/Icon.js";
import { Text } from "../components/display/Text.js";
import { Head } from "../providers/HeadProvider.js";

export const path = "/editor";

declare global {
  interface Window {
    editor?: Editor;
  }
}

export function Component() {
  const [blocks, setBlocks] = useLocalStorage<Notion.Block[]>("editor", [
    p(
      "1",
      span("Hi 👋, welcome to my "),
      span("awesome ", { bold: true, color: "pink" }),
      span("content ", { italic: true, color: "blue_background" }),
      span("editor ", { underline: true, color: "purple" }),
      span("demo!", { code: true }),
    ),
    p("2", span("Here is an almost blank canvas for you to start.")),
    p(
      "3",
      span("Write something! ! !", {
        bold: true,
        underline: true,
        italic: true,
      }),
      span(" Your changes will be saved to localstorage for the next session."),
    ),
    p(
      "5",
      a(
        "Let me know if you find a bug.",
        "https://github.com/gabiseabra/notion-site/issues",
      ),
    ),
  ]);

  const editor = useContentEditor({
    initialValue: blocks,
    onCommit: setBlocks,
  });

  window.editor = editor;

  return (
    <div>
      <Head>
        <title>Content Editor Demo</title>
        <Favicon icon={{ type: "emoji", emoji: "✍️" }} />
      </Head>

      <Text as="h1">
        <Icon size="l" icon={{ type: "emoji", emoji: "⌨️" }} />
        &nbsp;Content Editor Demo
      </Text>

      <Editor editor={editor} />
    </div>
  );
}
