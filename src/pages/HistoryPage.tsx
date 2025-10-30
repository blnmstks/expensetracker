import { History } from '../components/History';
import type { CurrencySettings } from '../App';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';

interface HistoryPageProps {
  currencySettings: CurrencySettings;
}

export function HistoryPage({ currencySettings }: HistoryPageProps) {
  return (
    <ErrorBoundary fallback={<SectionFallback name="История" />}>
      <History currencySettings={currencySettings} />
    </ErrorBoundary>
  );
}
