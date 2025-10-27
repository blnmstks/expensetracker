  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import "antd/dist/reset.css";
  import "./styles/antd-custom.css";
  import ErrorBoundary from "./components/ErrorBoundary";

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
  