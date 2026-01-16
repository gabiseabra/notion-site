import { ReactNode } from "react";
import { Link, LinkProps } from "react-router";

export function MaybeLink({
  children,
  to,
  ...props
}: {
  children: ReactNode;
  to?: LinkProps["to"];
} & Omit<LinkProps, "to">) {
  if (!to) return children;
  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
}
