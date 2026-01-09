import React from "react";
import { useOrpc } from "./components/providers/OrpcProvider.js";
import { useQuery } from "@tanstack/react-query";

export default function App() {
  const orpc = useOrpc();
  const postsQuery = useQuery(
    orpc.posts.getPosts.queryOptions({
      input: { query: "" },
    }),
  );

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem" }}>
      <h1>Notion Blog</h1>
    </main>
  );
}
