import { Analytics } from '../components/Analytics';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';

export function AnalyticsPage() {
  return (
    <ErrorBoundary fallback={<SectionFallback name="Аналитика" />}>
      <Analytics />
    </ErrorBoundary>
  );
}
