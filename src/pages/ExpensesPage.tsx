import { AddExpense } from '../components/AddExpense';
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';
import { Expense } from '../types';

interface ExpensesPageProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  expenses: Expense[];
  onDeleteExpense: (id: number) => void;
}

export function ExpensesPage({
  onAddExpense,
  expenses,
  onDeleteExpense,
}: ExpensesPageProps) {
  return (
    <ErrorBoundary fallback={<SectionFallback name="Добавить расход" />}>
      <AddExpense
        onAddExpense={onAddExpense}
        expenses={expenses}
        onDeleteExpense={onDeleteExpense}
      />
    </ErrorBoundary>
  );
}
