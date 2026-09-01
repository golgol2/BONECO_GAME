import "./style.css";

import {
  AppShell,
} from "./app-shell";

const root =
  document.querySelector<HTMLElement>(
    "#game-root",
  );

if (!root) {
  throw new Error(
    "#game-root não encontrado",
  );
}

const app =
  new AppShell(
    root,
  );

app.start();

window.addEventListener(
  "beforeunload",
  () =>
    app.destroy(),
  {
    once: true,
  },
);
