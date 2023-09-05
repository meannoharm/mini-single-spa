import { AppStatus, Application } from "src/types";
import { apps } from "./app";

export function registerApplication(app: Application) {
  if (typeof app.activeRule === "string") {
    const path = app.activeRule;
    app.activeRule = (location: Location = window.location) => location.pathname === path;
  }

  app.status = AppStatus.BEFORE_BOOTSTRAP;
  apps.push(app);
}