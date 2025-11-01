import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Card, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCategoryIconResolver } from '../hooks/useCategoryIconResolver';
import { useExpenses } from '../store';

export function History() {
  const { expenses, fetchExpenses, deleteExpense } = useExpenses();
  const { resolveIcon, fetchCategoryIcons } = useCategoryIconResolver();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchCategoryIcons();
  }, [fetchCategoryIcons]);

  const handleDelete = async (expenseId: number) => {
    try {
      setDeletingId(expenseId);
      await deleteExpense(expenseId);
      message.success('Расход удален');
    } catch (error) {
      console.error('Failed to delete expense', error);
      message.error('Не удалось удалить расход');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-1 sm:px-0">
      <div>
        <h2 className="text-neutral-900 mb-4">История расходов</h2>
      </div>
      {expenses.length > 0 ? (
        <Card className="border-neutral-100 bg-white/90 shadow-lg ring-1 ring-black/5 backdrop-blur">
            <div className="space-y-3 sm:space-y-4">
              {expenses.map((expense) => {
                
                return(
                  <div
                    key={expense.id}
                    className="relative flex flex-col gap-6 rounded-2xl border border-neutral-200/80 bg-white/95 px-4 pb-14 pt-4 shadow-sm ring-1 ring-black/5 transition-all sm:flex-row sm:items-center sm:gap-8"
                  >
                    {/* Icon and Category */}
                    <div className="flex items-center gap-3 sm:w-60 sm:flex-none">
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-neutral-700"
                        style={{ backgroundColor: expense?.category_detail?.color + '20' }}
                      >
                        {resolveIcon(expense?.category_detail?.icon ?? expense.category_icon) || '📦'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-neutral-900 font-medium">{expense?.category_detail?.name}</div>
                        <div className="text-neutral-500 text-sm">
                          {format(new Date(expense.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 pr-4 sm:flex-row sm:items-center sm:gap-8 sm:pr-20 lg:gap-10">
                      {/* Amounts */}
                      <div className="flex flex-wrap gap-6 sm:flex-1 sm:flex-nowrap sm:justify-start sm:gap-8 lg:gap-10">
                        {expense?.conversions?.map((conv) => (
                          <div key={conv.currency_code}>
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 text-center">
                              {conv?.currency_code}
                            </div>
                            <div className="text-neutral-900 text-base font-semibold text-center">
                              {conv?.amount} {conv?.currency_symbol}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Comment */}
                      <div className="min-w-0 text-sm text-neutral-600 pr-4 sm:flex-1 sm:max-w-md sm:pl-8 sm:pr-14 lg:pr-20">
                        {expense.comment && (
                          <>
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
                              Комментарий
                            </div>
                            <div className="text-neutral-700 line-clamp-3">{expense.comment}</div>
                          </>
                        )}
                      </div>
                  </div>

                <button
                  type="button"
                  aria-label="Удалить расход"
                  className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                >
                  <DeleteOutlined style={{ fontSize: 18 }} />
                </button>
                  </div>
                )})}
            </div>
        </Card>
      ) : (
        <Card>
          История расходов пуста. Добавьте расходы, чтобы увидеть их здесь.
        </Card>
      )}
    </div>
  );
}
