  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import "antd/dist/reset.css";
  import "./styles/antd-custom.css";
  import ErrorBoundary from "./components/ErrorBoundary";

  import * as Sentry from "@sentry/react";

  Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  // Enable logs to be sent to Sentry
  enableLogs: true,
  release: `expense-tracker@${import.meta.env.APP_VERSION}`,
  environment: import.meta.env.MODE,

  beforeSend(event, hint) {
    // Не отправлять в development (опционально)
    if (import.meta.env.MODE === 'development') {
      console.log('Sentry event (dev):', event);
      return null;
    }
    
    // Добавить дополнительную информацию
    // if (event.user) {
    //   event.user.username = localStorage.getItem('user_email') || undefined;
    // }
    
    return event;
  },
});

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
  