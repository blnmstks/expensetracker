import { AddExpense } from '../components/AddExpense';
import type { Expense, CurrencySettings } from '../App';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';

interface ExpensesPageProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  expenses: Expense[];
  onDeleteExpense: (id: number) => void;
  currencySettings: CurrencySettings;
}

export function ExpensesPage({
  onAddExpense,
  expenses,
  onDeleteExpense,
  currencySettings,
}: ExpensesPageProps) {
  return (
    <ErrorBoundary fallback={<SectionFallback name="Добавить расход" />}>
      <AddExpense
        onAddExpense={onAddExpense}
        expenses={expenses}
        onDeleteExpense={onDeleteExpense}
        currencySettings={currencySettings}
      />
    </ErrorBoundary>
  );
}
