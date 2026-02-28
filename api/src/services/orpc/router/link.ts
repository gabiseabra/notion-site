import { api } from "@notion-site/common/orpc/index.js";
import { implement } from "@orpc/server";
import {
  getLinkPreview,
  LinkPreviewNotFoundError,
} from "../../link/preview.js";
const c = implement(api.link);

export const link = c.router({
  getPreview: c.getPreview.handler(async ({ input, errors }) => {
    try {
      return await getLinkPreview(input.url);
    } catch (error) {
      if (error instanceof LinkPreviewNotFoundError) {
        throw errors.NOT_FOUND({ message: error.message });
      }

      throw errors.REQUEST_FAILED({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }),
});
