import React from "react";

type DevError = {
  id: string;
  type: "error" | "unhandledrejection" | "log";
  message: string;
  stack?: string;
};

type Props = {
  fallback?: React.ReactNode;
  onError?: (error: Error, info?: React.ErrorInfo) => void;
  children?: React.ReactNode;
  showStackInDev?: boolean;
};

type State = {
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  devErrors: DevError[];
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, errorInfo: null, devErrors: [] };

  isDev = process.env.NODE_ENV !== "production";

  componentDidMount() {
    if (this.isDev) {
      // collect runtime errors so dev overlay shows them all
      window.addEventListener("error", this.handleWindowError as any);
      window.addEventListener("unhandledrejection", this.handleUnhandledRejection as any);
    }
  }

  componentWillUnmount() {
    if (this.isDev) {
      window.removeEventListener("error", this.handleWindowError as any);
      window.removeEventListener("unhandledrejection", this.handleUnhandledRejection as any);
    }
  }

  handleWindowError = (ev: ErrorEvent) => {
    const err: DevError = {
      id: String(Date.now()) + Math.random(),
      type: "error",
      message: ev.message,
      stack: ev.error?.stack || undefined,
    };
    this.setState((s) => ({ devErrors: [err, ...s.devErrors] }));
  };

  handleUnhandledRejection = (ev: PromiseRejectionEvent) => {
    const reason = ev.reason;
    const message = typeof reason === "string" ? reason : reason?.message || "(no message)";
    const stack = reason?.stack || undefined;
    const err: DevError = {
      id: String(Date.now()) + Math.random(),
      type: "unhandledrejection",
      message,
      stack,
    };
    this.setState((s) => ({ devErrors: [err, ...s.devErrors] }));
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Save to state so we can render fallback.
    this.setState({ error, errorInfo });
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        // пробрасываем оригинальную ошибку в глобальную область, чтобы dev-server
        // показал overlay/ошибку на весь экран.
        throw error;
      });
    }
  }

  renderDevOverlay() {
    const { error, errorInfo, devErrors } = this.state;
    return (
      <div style={{ padding: 16, fontFamily: "Inter, ui-sans-serif, system-ui" }}>
        <div style={{ background: "#fff1f0", border: "1px solid #fecaca", padding: 12, borderRadius: 8, color: "#7f1d1d" }}>
          <h2 style={{ margin: "0 0 8px" }}>Development Error Overlay</h2>
          {error && (
            <div style={{ marginBottom: 8 }}>
              <strong>Caught render error:</strong>
              <div>{String(error.message || error)}</div>
              {error.stack && <pre style={{ whiteSpace: "pre-wrap" }}>{error.stack}</pre>}
              {errorInfo?.componentStack && (
                <details style={{ marginTop: 8 }}>
                  <summary>Component stack</summary>
                  <pre style={{ whiteSpace: "pre-wrap" }}>{errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          )}

          {devErrors.length > 0 && (
            <div>
              <strong>Runtime / Promise errors:</strong>
              <ul>
                {devErrors.map((e) => (
                  <li key={e.id} style={{ marginTop: 6 }}>
                    <div>{e.type}: {e.message}</div>
                    {e.stack && <pre style={{ whiteSpace: "pre-wrap" }}>{e.stack}</pre>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button onClick={() => window.location.reload()} style={{ padding: "6px 10px", borderRadius: 6 }}>Reload app</button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { children, fallback, showStackInDev } = this.props;
    const { error } = this.state;

    // In dev: show verbose overlay so dev sees all errors immediately.
    if (this.isDev && (error || this.state.devErrors.length > 0)) {
      // If showStackInDev is explicitly false hide stacks, but default is true for dev.
      if (showStackInDev === false) {
        return <div style={{ padding: 12, background: "#fff7ed" }}>Произошла ошибка (development)</div>;
      }
      return this.renderDevOverlay();
    }

    // Production: show minimal fallback or provided fallback
    if (error) {
      return (
        <>{fallback ?? <div style={{ padding: 12 }}>Произошла ошибка. Пожалуйста, попробуйте позже.</div>}</>
      );
    }

    return <>{children}</>;
  }
}

// Simple per-section fallback export for convenience
export const SectionFallback: React.FC<{ name?: string }> = ({ name }) => (
  <div className="p-4 rounded bg-red-50 text-red-700">
    Ошибка в секции {name ?? ""} — содержимое временно недоступно.
  </div>
);

export default ErrorBoundary;