import { LoaderFunctionArgs, redirect } from "react-router";

export const path = "/";

export function loader({}: LoaderFunctionArgs) {
  throw redirect("/blog");
}
