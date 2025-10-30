import { Analytics } from '../components/Analytics';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';
import { CurrencySettings } from '../types';

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
