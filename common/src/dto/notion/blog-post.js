import { z } from "zod";
import * as n from "./schema.js";
export const BlogPost = z.object({
    url: z.string(),
    icon: n.icon.nullable(),
    properties: z.object({
        "Publish Date": n.date,
        Title: n.title,
        Tags: n._multi_select,
        Status: n.status(["Published", "Draft", "In Review", "Hidden"]),
    }),
});
//# sourceMappingURL=blog-post.js.map