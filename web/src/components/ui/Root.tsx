import { ReactNode } from "react";
import css from "./Root.module.scss";
import { Link } from "react-router";

export function Root({ children }: { children: ReactNode }) {
  return (
    <div className={css.Root}>
      <header>
        <Link to="/">blog.gabiseabra.dev</Link>
      </header>

      <main>{children}</main>

      <footer>
        <p>
          <a href="https://gabiseabra.dev">gabiseabra.dev</a> &copy; 2025
        </p>
      </footer>
    </div>
  );
}
