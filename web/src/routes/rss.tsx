import { Outlet, useParams } from "react-router";
import { PageSuspenseBoundary } from "../components/feedback/SuspenseBoundary.js";
import { BlogPostHeader } from "../components/modules/blog-posts/BlogPostHeader.js";
import { BlogPostLoader } from "../components/modules/blog-posts/BlogPostLoader.js";

export const element = <Outlet />;

export const children = [
  {
    path: "/blog/:id",
    Component() {
      const { id = "" } = useParams();

      return (
        <PageSuspenseBoundary resourceName="the blog post">
          <BlogPostLoader
            id={id}
            head={() => null}
            header={(blogPost) => (
              <BlogPostHeader
                hiddenCover
                hiddenEditButton
                as="header"
                size="l"
                blogPost={blogPost}
                hiddenProperties={["Publish Date", "Status", "Tags", "Author"]}
              />
            )}
          />
        </PageSuspenseBoundary>
      );
    },
  },
];
