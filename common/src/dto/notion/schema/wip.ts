import { match } from "ts-pattern";
import { WithRequired } from "../../../types/object.js";
import { uuid } from "../../../utils/uuid.js";
import { block } from "./blocks.js";

// Defaults

const empty_content: Extract<block, { type: "paragraph" }>["paragraph"] = {
  rich_text: [],
  color: "default",
};

export const heading_1 = {
  type: "heading_1",
  heading_1: empty_content,
} as const;

export const heading_2 = {
  type: "heading_2",
  heading_2: empty_content,
} as const;

export const heading_3 = {
  type: "heading_3",
  heading_3: empty_content,
} as const;

export const divider = {
  type: "divider",
  divider: {},
} as const;

export const paragraph = {
  type: "paragraph",
  paragraph: empty_content,
} as const;

export const bulleted_list_item = {
  type: "bulleted_list_item",
  bulleted_list_item: empty_content,
} as const;

export const numbered_list_item = {
  type: "numbered_list_item",
  numbered_list_item: empty_content,
} as const;

export const quote = {
  type: "quote",
  quote: empty_content,
} as const;

export const link_to_page = {
  link_to_page: {
    type: "page_id",
    page_id: "",
  },
} as const;

export const child_page = {
  child_page: { title: "" },
} as const;

export const image = {
  image: {
    type: "file" as const,
    file: { url: "" },
    caption: [],
  },
};

// WIP block type

export type wip_block = block & { id: `WIP:${string}` };

export function wip_block<T extends block["type"]>(
  base: WithRequired<Partial<Extract<wip_block, { type: T }>>, "type"> & {
    type: T;
  },
): Extract<wip_block, { type: T }>;
export function wip_block(
  _base: WithRequired<Partial<wip_block>, "type">,
): wip_block {
  const base = {
    ..._base,
    has_children: false,
    parent: {
      type: "page_id",
      page_id: "",
    },
    id: `WIP:${uuid()}`,
  } as const;
  return match(base)
    .with({ type: "paragraph" }, (base) => ({ ...paragraph, ...base }))
    .with({ type: "heading_1" }, (base) => ({ ...heading_1, ...base }))
    .with({ type: "heading_2" }, (base) => ({ ...heading_2, ...base }))
    .with({ type: "heading_3" }, (base) => ({ ...heading_3, ...base }))
    .with({ type: "divider" }, (base) => ({ ...divider, ...base }))
    .with({ type: "quote" }, (base) => ({ ...quote, ...base }))
    .with({ type: "bulleted_list_item" }, (base) => ({
      ...bulleted_list_item,
      ...base,
    }))
    .with({ type: "numbered_list_item" }, (base) => ({
      ...numbered_list_item,
      ...base,
    }))
    .with({ type: "link_to_page" }, (base) => ({ ...link_to_page, ...base }))
    .with({ type: "child_page" }, (base) => ({ ...child_page, ...base }))
    .with({ type: "image" }, (base) => ({ ...image, ...base }))
    .exhaustive();
}
