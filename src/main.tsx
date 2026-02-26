import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyThemeSettings } from "./lib/themeUtils";

// Apply saved theme settings on app load
applyThemeSettings();

createRoot(document.getElementById("root")!).render(<App />);
