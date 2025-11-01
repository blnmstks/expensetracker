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
    <div className={styles.historyContainer}>
      <div className={styles.headingWrapper}>
        <h2 className={styles.heading}>История расходов</h2>
      </div>
      {expenses.length > 0 ? (
        <Card className={styles.historyCard}>
          <div className={styles.list}>
            {expenses.map((expense) => (
              <div key={expense.id} className={styles.listItem}>
                <div className={styles.iconBlock}>
                  <div className={styles.icon}>
                    {resolveIcon(expense?.category_detail?.icon ?? expense.category_icon) || '📦'}
                  </div>
                  <div className={styles.categoryDate}>
                    <span className={styles.categoryName}>{expense?.category_detail?.name}</span>
                    <span className={styles.date}>
                      {format(new Date(expense.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </span>
                  </div>
                </div>

                <div className={styles.currenciesComment}>
                  <div className={styles.conversions}>
                    {expense?.conversions?.map((conv) => (
                      <div key={conv.currency_code} className={styles.conversionItem}>
                        <div className={styles.currencyCode}>{conv?.currency_code}</div>
                        <div className={styles.currencyAmount}>
                          {conv?.amount} {conv?.currency_symbol}
                        </div>
                      </div>
                    ))}
                  </div>

                  {expense.comment && (
                    <div className={styles.comment}>
                      <div className={styles.commentLabel}>Комментарий</div>
                      <div className={styles.commentText}>{expense.comment}</div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  aria-label="Удалить расход"
                  className={styles.deleteBlock}
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                >
                  <DeleteOutlined style={{ fontSize: 18 }} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className={styles.emptyCard}>
          История расходов пуста. Добавьте расходы, чтобы увидеть их здесь.
        </Card>
      )}
    </div>
  );
}
