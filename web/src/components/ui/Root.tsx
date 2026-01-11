import { ReactNode } from "react";
import { Link } from "react-router";
import css from "./Root.module.scss";

export function Root({ children }: { children: ReactNode }) {
  return (
    <div className={css.Root}>
      <header>
        <Link to="/" className={css.Link}>
          <span className={css.Subdomain}>blog</span>
          <span className={css.Dot}>.</span>
          <span className={css.Domain}>gabiseabra</span>
          <span className={css.Dot}>.</span>
          <span className={css.Domain}>dev</span>
        </Link>
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
