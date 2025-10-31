import { History } from '../components/History';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';

  export function HistoryPage() {
  return (
    <ErrorBoundary fallback={<SectionFallback name="История" />}>
      <History  />
    </ErrorBoundary>
  );
}
