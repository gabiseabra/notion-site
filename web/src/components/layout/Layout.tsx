import { ReactNode } from "react";
import { Link } from "react-router";
import { GithubRibbon } from "../display/GithubRibbon.js";
import { SiteLogo } from "../display/SiteLogo.js";
import styles from "./Layout.module.scss";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <header>
        <Link to="/" style={{ textDecoration: "none" }}>
          <SiteLogo />
        </Link>

        <GithubRibbon />
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
