import { z } from "zod";
// enums
const color = z.enum([
    "default",
    "gray",
    "brown",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "red",
]);
const background_color = z.enum([
    "default_background",
    "gray_background",
    "brown_background",
    "orange_background",
    "yellow_background",
    "green_background",
    "blue_background",
    "purple_background",
    "pink_background",
    "red_background",
]);
// icons
export const external = z.object({
    type: z.literal("external"),
    external: z.object({
        url: z.string(),
    }),
});
export const emoji = z.object({
    type: z.literal("emoji"),
    emoji: z.string(),
});
export const custom_emoji = z.object({
    type: z.literal("custom_emoji"),
    custom_emoji: z.object({
        name: z.string(),
        url: z.string(),
    }),
});
export const file = z.object({
    type: z.literal("file"),
    file: z.object({
        url: z.string(),
    }),
});
export const icon = z.union([external, emoji, custom_emoji, file]);
// unsupported nodes
export const mention = z.object({ type: z.literal("mention") });
export const equation = z.object({ type: z.literal("equation") });
export const unsupported = z.union([mention, equation]);
// primitives
export const number = z.object({
    type: z.literal("number"),
    number: z.number().nullable(),
});
export const text = z.object({
    type: z.literal("text"),
    text: z.object({
        content: z.string(),
        link: z.object({ url: z.string() }).nullable(),
    }),
    annotations: z.object({
        bold: z.boolean(),
        italic: z.boolean(),
        strikethrough: z.boolean(),
        underline: z.boolean(),
        code: z.boolean(),
        color: z.union([color, background_color]),
    }),
});
export const title = z.object({
    type: z.literal("title"),
    title: z.union([text, mention, equation]).array(),
});
export const rich_text = z.object({
    type: z.literal("rich_text"),
    rich_text: z.union([text, mention, equation]).array(),
});
export function status(options) {
    return z.object({
        type: z.literal("status"),
        status: z
            .object({
            name: z.enum(options),
            color: color,
        })
            .nullable(),
    });
}
export const _select = z.object({
    type: z.literal("select"),
    select: z
        .object({
        name: z.string(),
        color: color,
    })
        .nullable(),
});
export function select(options) {
    return z.object({
        type: z.literal("select"),
        select: z
            .object({
            name: z.enum(options),
            color: color,
        })
            .nullable(),
    });
}
export const _multi_select = z.object({
    type: z.literal("multi_select"),
    multi_select: z
        .object({
        name: z.string(),
        color: color,
    })
        .array(),
});
export function multi_select(options) {
    return z.object({
        type: z.literal("multi_select"),
        multi_select: z
            .object({
            name: z.enum(options),
            color: color,
        })
            .array(),
    });
}
export const date = z.object({
    type: z.literal("date"),
    date: z.object({
        start: z.coerce.date(),
        end: z.coerce.date().nullable(),
    }),
});
export const checkbox = z.object({
    type: z.literal("checkbox"),
    checkbox: z.boolean(),
});
//# sourceMappingURL=schema.js.map