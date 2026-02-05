import { zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { a, p, span } from "@notion-site/common/test-utils/mock-block.js";
import { useLocalStorage } from "usehooks-ts";
import {
  ContentEditor,
  TContentEditor,
} from "../components/content/ContentEditor.js";
import { Favicon } from "../components/display/Favicon.js";
import { Icon } from "../components/display/Icon.js";
import { Text } from "../components/display/Text.js";
import { Head } from "../providers/HeadProvider.js";

export const path = "/editor";

declare global {
  interface Window {
    editor?: TContentEditor;
  }
}

export function Component() {
  const [blocks, setBlocks] = useLocalStorage<zNotion.blocks.block[]>(
    "editor",
    [
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
        span(
          " Your changes will be saved to localstorage for the next session.",
        ),
      ),
      p(
        "5",
        a(
          "Let me know if you find a bug.",
          "https://github.com/gabiseabra/notion-site/issues",
        ),
      ),
    ],
  );

  const onChange = (blocks: zNotion.blocks.block[]) => {
    console.info("onChange", blocks);
    setBlocks(blocks);
  };

  return (
    <div>
      <Head>
        <Favicon icon={{ type: "emoji", emoji: "⌨️" }} />
      </Head>

      <Text as="h1">
        <Icon size="l" icon={{ type: "emoji", emoji: "⌨️" }} />
        &nbsp; Content Editor Demo
      </Text>

      <ContentEditor
        ref={(editor) => {
          window.editor = editor ?? undefined;
        }}
        value={blocks}
        onChange={onChange}
      />
    </div>
  );
}
