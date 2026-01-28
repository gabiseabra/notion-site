import { type zNotion } from "@notion-site/common/dto/notion/schema/index.js";
import { isRedacted } from "@notion-site/common/utils/notion.js";
import { match } from "ts-pattern";
import { rewriteUrl } from "../../../utils/url.js";
import { Banner } from "../../feedback/Banner.js";
import { MaybeLink } from "../../navigation/MaybeLink.js";
import { Span } from "../../typography/Text.js";

/**
 * Renders a single line of Notion rich-text.
 * @direction inline
 */
export function RichText({
  data,
}: {
  data: zNotion.properties.rich_text_item;
}) {
  return (
    <>
      {data.length ? (
        data.map((item, ix) =>
          match(item)
            .with({ type: "text" }, (item) =>
              isRedacted(item) ? (
                <Span key={ix} redacted>
                  {item.text.content}
                </Span>
              ) : (
                <MaybeLink
                  key={`${ix}`}
                  to={
                    item.text.link ? rewriteUrl(item.text.link.url) : undefined
                  }
                >
                  <Span {...item.annotations}>{item.text.content}</Span>
                </MaybeLink>
              ),
            )
            .otherwise(() => (
              <Banner type="warning" size="m">
                Unsupported block
              </Banner>
            )),
        )
      ) : (
        <span>&nbsp;</span>
      )}
    </>
  );
}
