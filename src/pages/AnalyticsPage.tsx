import { Analytics } from '../components/Analytics';
import type { CurrencySettings } from '../App';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';

interface AnalyticsPageProps {
  currencySettings: CurrencySettings;
}

export function AnalyticsPage({ currencySettings }: AnalyticsPageProps) {
  return (
    <ErrorBoundary fallback={<SectionFallback name="Аналитика" />}>
      <Analytics currencySettings={currencySettings} />
    </ErrorBoundary>
  );
}
