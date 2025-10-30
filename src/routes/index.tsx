import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ExpensesPage, AnalyticsPage, HistoryPage, SettingsPage } from '../pages';
import type { Expense, CurrencySettings } from '../App';

interface RouterProps {
  expenses: Expense[];
  currencySettings: CurrencySettings;
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  onDeleteExpense: (id: number) => void;
  onUpdateCurrencySettings: (settings: CurrencySettings) => void;
  onLogout: () => void;
}

export const createAppRouter = ({
  expenses,
  currencySettings,
  onAddExpense,
  onDeleteExpense,
  onUpdateCurrencySettings,
  onLogout,
}: RouterProps) => {
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <MainLayout
          expenses={expenses}
          currencySettings={currencySettings}
          onLogout={onLogout}
        />
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/expenses" replace />,
        },
        {
          path: 'expenses',
          element: (
            <ExpensesPage
              onAddExpense={onAddExpense}
              expenses={expenses}
              onDeleteExpense={onDeleteExpense}
              currencySettings={currencySettings}
            />
          ),
        },
        {
          path: 'analytics',
          element: <AnalyticsPage currencySettings={currencySettings} />,
        },
        {
          path: 'history',
          element: <HistoryPage currencySettings={currencySettings} />,
        },
        {
          path: 'settings',
          element: (
            <SettingsPage
              currencySettings={currencySettings}
              onUpdateCurrencySettings={onUpdateCurrencySettings}
            />
          ),
        },
      ],
    },
  ]);
};
