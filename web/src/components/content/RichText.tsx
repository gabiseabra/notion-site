import { Notion } from "@notion-site/common/utils/notion/index.js";
import { match } from "ts-pattern";
import { rewriteUrl } from "../../utils/url.js";
import { Span, TextProps } from "../display/Text.js";
import { Alert } from "../feedback/Banner.js";
import { MaybeLink } from "../navigation/MaybeLink.js";
import { ContentEditableProps } from "./editable/types.js";

export type RichTextProps = {
  value: Notion.RichText;
  size?: TextProps["size"];
} & ContentEditableProps;

/**
 * Renders a single line of Notion rich-text.
 * @direction inline
 */
export function RichText({ value, ...props }: RichTextProps) {
  return (
    <>
      {value.length ? (
        value.map((item, ix) =>
          match(item)
            .with({ type: "text" }, (item) =>
              Notion.RTF.isRedacted(item) ? (
                <Span key={ix} redacted {...props}>
                  {item.text.content}
                </Span>
              ) : (
                <MaybeLink
                  key={`${ix}`}
                  to={
                    item.text.link ? rewriteUrl(item.text.link.url) : undefined
                  }
                >
                  <Span {...item.annotations} {...props}>
                    {item.text.content}
                  </Span>
                </MaybeLink>
              ),
            )
            .otherwise(() => <Alert type="warning">Unsupported block</Alert>),
        )
      ) : (
        <Span {...props} />
      )}
    </>
  );
}
