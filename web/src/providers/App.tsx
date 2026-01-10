import { Outlet } from "react-router";

export function App() {
  return (
    <div>
      <header>
        <h1>My Notion Blog</h1>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>&copy; 2025</p>
      </footer>
    </div>
  );
}
