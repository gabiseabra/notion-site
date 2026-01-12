import { ReactNode } from "react";
import { Link } from "react-router";
import { FaGithub } from "react-icons/fa";
import styles from "./Layout.module.scss";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.Layout}>
      <header>
        <Link to="/" className={styles.Link}>
          <span className={styles.Subdomain}>blog</span>
          <span className={styles.Dot}>.</span>
          <span className={styles.Domain}>gabiseabra</span>
          <span className={styles.Dot}>.</span>
          <span className={styles.Domain}>dev</span>
        </Link>

        <a
          target="_blank"
          href="https://github.com/gabiseabra/notion-site"
          title="See the source code on Github"
          className={styles.Github}
        >
          <div>
            <FaGithub />
          </div>
        </a>
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
