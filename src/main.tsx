import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply stored font size before first render so returning users see no flash
try {
  const stored = localStorage.getItem('eadl_font_size');
  if (stored) document.documentElement.style.fontSize = stored;
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
