import { SettingsPage as SettingsComponent } from '../components/SettingsPage';
import type { CurrencySettings } from '../App';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';

interface SettingsPageProps {
  currencySettings: CurrencySettings;
  onUpdateCurrencySettings: (settings: CurrencySettings) => void;
}

export function SettingsPage({
  currencySettings,
  onUpdateCurrencySettings,
}: SettingsPageProps) {
  return (
    <ErrorBoundary fallback={<SectionFallback name="Настройки" />}>
      <SettingsComponent
        currencySettings={currencySettings}
        onUpdateCurrencySettings={onUpdateCurrencySettings}
      />
    </ErrorBoundary>
  );
}
