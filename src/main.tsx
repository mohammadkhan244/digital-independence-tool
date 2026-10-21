import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply stored text size before first render so returning users see no flash.
// Uses data-text-size attribute, not fontSize, so layout dimensions stay stable.
try {
  const size = localStorage.getItem('eadl_text_size');
  if (size && size !== 'normal') {
    document.documentElement.setAttribute('data-text-size', size);
  }
  document.documentElement.style.fontSize = ''; // clear any old approach
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
