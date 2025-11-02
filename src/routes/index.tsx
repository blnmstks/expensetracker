import { createBrowserRouter, Navigate, redirect } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ExpensesPage, AnalyticsPage, HistoryPage, SettingsPage } from '../pages';
import { TestAPIPage } from '../pages/TestAPIPage';
import { Expense } from '../types';
import { Login } from '../components/Login';

interface RouterProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  onDeleteExpense: (id: number) => void;
  onLogout: () => Promise<void>;
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
      loader: () => {
        if (localStorage.getItem('auth_token')) return redirect('/expenses');
        return null;
      },
      element: <Login />,
    },
    {
      element: (
        <MainLayout
          expenses={expenses}
          onLogout={onLogout}
        />
      ),
      loader: () => {
        if (!localStorage.getItem('auth_token')) {
          return redirect('/');
        }
        return null;
      },
      children: [
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
        {
          path: 'test-api',
          element: <TestAPIPage />,
        },
      ],
    },
  ]);
};
