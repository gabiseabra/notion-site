import { oc } from "@orpc/contract";
import z from "zod";

const LinkPreviewInput = z.object({
  url: z.string().url(),
});
type LinkPreviewInput = z.infer<typeof LinkPreviewInput>;

const LinkPreview = z.object({
  title: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  favicon: z.string().optional(),
});
type LinkPreview = z.infer<typeof LinkPreview>;

export const link = oc.prefix("/link").router({
  getPreview: oc
    .route({
      description: "Get a link preview (title/description/image/favicon).",
    })
    .errors({
      NOT_FOUND: {
        message: "Link not found",
        status: 404,
      },
      REQUEST_FAILED: {
        message: "Failed to fetch link preview",
        status: 502,
      },
    })
    .input(LinkPreviewInput)
    .output(LinkPreview),
});
