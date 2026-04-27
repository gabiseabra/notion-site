import { match } from "ts-pattern";
import { WithRequired } from "../../types/object.js";
import { uuid } from "../uuid.js";
import { Block, BlockType } from "./block.js";
import { Annotations, empty_text, RichText } from "./rich-text.js";

export function id() {
  return `WIP:${uuid()}`;
}

export function create<T extends BlockType>(
  base: WithRequired<Partial<Block<T>>, "type"> & {
    type: T;
  },
): Block<T>;
export function create(_base: WithRequired<Partial<Block>, "type">): Block {
  const base = {
    id: id(),
    has_children: false,
    parent: {
      type: "page_id",
      page_id: "",
    },
    ..._base,
  } as const;
  return match(base)
    .with({ type: "paragraph" }, (base) => ({ ...paragraph, ...base }))
    .with({ type: "heading_1" }, (base) => ({ ...heading_1, ...base }))
    .with({ type: "heading_2" }, (base) => ({ ...heading_2, ...base }))
    .with({ type: "heading_3" }, (base) => ({ ...heading_3, ...base }))
    .with({ type: "heading_4" }, (base) => ({ ...heading_4, ...base }))
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
    .with({ type: "to_do" }, (base) => ({ ...to_do, ...base }))
    .with({ type: "link_to_page" }, (base) => ({ ...link_to_page, ...base }))
    .with({ type: "child_page" }, (base) => ({ ...child_page, ...base }))
    .with({ type: "image" }, (base) => ({ ...image, ...base }))
    .with({ type: "code" }, (base) => ({ ...code, ...base }))
    .with({ type: "callout" }, (base) => ({ ...callout, ...base }))
    .with({ type: "toggle" }, (base) => ({ ...toggle, ...base }))
    .with({ type: "column_list" }, (base) => ({ ...column_list, ...base }))
    .with({ type: "column" }, (base) => ({ ...column, ...base }))
    .exhaustive();
}

export function clone<T extends BlockType>({
  ...base
}: WithRequired<Partial<Block<T>>, "type"> & {
  type: T;
}) {
  delete base.id;
  delete base.has_children;
  delete base.parent;
  return create(base);
}

export function p(id: string, ...rich_text: RichText): Block {
  return {
    ...create({
      type: "paragraph",
      paragraph: {
        color: "default",
        rich_text,
      },
    }),
    id,
  };
}

export function todo(id: string, ...rich_text: RichText): Block {
  return {
    ...create({
      type: "to_do",
      to_do: {
        rich_text,
        checked: false,
      },
    }),
    id,
  };
}
export function ul(id: string, ...rich_text: RichText): Block {
  return {
    ...create({
      type: "bulleted_list_item",
      bulleted_list_item: {
        color: "default",
        rich_text,
      },
    }),
    id,
  };
}

export function ol(id: string, ...rich_text: RichText): Block {
  return {
    ...create({
      type: "numbered_list_item",
      numbered_list_item: {
        color: "default",
        rich_text,
      },
    }),
    id,
  };
}

export function span(content: string, annotations?: Partial<Annotations>) {
  return {
    type: "text",
    text: { content, link: null },
    annotations: {
      ...empty_text.annotations,
      ...annotations,
    },
  } as const;
}

export function a(
  content: string,
  url: string,
  annotations?: Partial<Annotations>,
) {
  return {
    type: "text",
    text: { content, link: { url } },
    annotations: {
      ...empty_text.annotations,
      ...annotations,
    },
  } as const;
}

// Defaults

const empty_content: Block<"paragraph">["paragraph"] = {
  rich_text: [],
  color: "default",
};

const heading_1 = {
  heading_1: empty_content,
} as const;

const heading_2 = {
  heading_2: empty_content,
} as const;

const heading_3 = {
  heading_3: empty_content,
} as const;

const heading_4 = {
  heading_4: empty_content,
} as const;

const divider = {
  divider: {},
} as const;

const paragraph = {
  paragraph: empty_content,
} as const;

const bulleted_list_item = {
  bulleted_list_item: empty_content,
} as const;

const numbered_list_item = {
  numbered_list_item: empty_content,
} as const;

const to_do = {
  to_do: {
    rich_text: [],
    checked: false,
  },
};

const quote = {
  quote: empty_content,
} as const;

const link_to_page = {
  link_to_page: {
    type: "page_id",
    page_id: "",
  },
} as const;

const child_page = {
  child_page: { title: "" },
} as const;

const image = {
  image: {
    type: "file" as const,
    file: { url: "" },
    caption: [],
  },
};

const code = {
  code: {
    language: "typescript" as const,
    rich_text: [],
    caption: [],
  },
};

const callout = {
  callout: {
    icon: { type: "emoji" as const, emoji: "🤖" },
    rich_text: [],
    color: "gray_background" as const,
  },
};

const toggle = {
  toggle: {
    rich_text: [],
    color: "default" as const,
  },
};

const column_list = {
  column_list: {},
};

const column = {
  column: { width_ratio: 1 },
};
