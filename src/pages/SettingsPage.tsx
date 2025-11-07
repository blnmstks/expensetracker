import { SettingsPage as SettingsComponent } from '../components/SettingsPage';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';


export function SettingsPage() {
  return (
    <ErrorBoundary fallback={<SectionFallback name="Настройки" />}>
      <SettingsComponent />
    </ErrorBoundary>
  );
}
