import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Card, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCategoryIconResolver } from '../../hooks/useCategoryIconResolver';
import { useExpenses } from '../../store';

import styles from './index.module.css';

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
                    className={styles.listItem}
                  >
                    {/* Icon and Category */}
                    <div className={styles.iconBlock}>
                      <div>
                        {resolveIcon(expense?.category_detail?.icon ?? expense.category_icon) || '📦'}
                      </div>
                      <div className={styles.categoryDate}>
                        <span>{expense?.category_detail?.name}</span>
                        <span>
                          {format(new Date(expense.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>

                    <div className={styles.currenciesComment}>
                      {expense?.conversions?.map((conv) => (
                        <div key={conv.currency_code}>
                          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 text-center">
                            {conv?.currency_code}
                          </div>
                          <div className="text-neutral-900 text-base font-semibold text-center">
                            {conv?.amount} {conv?.currency_symbol}
                          </div>
                        </div>))
                      }

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
                  // className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2"
                  className={styles.deleteBlock}
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
