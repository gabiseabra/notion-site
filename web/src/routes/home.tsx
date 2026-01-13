import { redirect } from "react-router";

export const path = "/";

// @todo show a notion page for the home page?
export function loader() {
  throw redirect("/blog");
}
