import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ExpensesPage, AnalyticsPage, HistoryPage, SettingsPage } from '../pages';
import { Expense } from '../types';

interface RouterProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  onDeleteExpense: (id: number) => void;
  onLogout: () => void;
}

export const createAppRouter = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onLogout,
}: RouterProps) => {
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <MainLayout
          expenses={expenses}
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
            />
          ),
        },
        {
          path: 'analytics',
          element: <AnalyticsPage />,
        },
        {
          path: 'history',
          element: <HistoryPage />,
        },
        {
          path: 'settings',
          element: (
            <SettingsPage />
          ),
        },
      ],
    },
  ]);
};
