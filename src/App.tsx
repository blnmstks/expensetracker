import { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { expenseAPI, authAPI } from "./services/api";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { createAppRouter } from "./routes";
import { message } from "antd";
import { Expense } from "./types";
import { useCurrency } from "./store";


export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { fetchDefaultCurrency } = useCurrency();

  useEffect(() => {
    if(localStorage.getItem('auth_token')) {
      fetchDefaultCurrency();
    }
  }, []);

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const createdExpense = await expenseAPI.create(expense);

      const newExpense: Expense = {
        ...createdExpense,
        id: createdExpense.id
      };
      setExpenses([newExpense, ...expenses]);
      
      return newExpense;
  } catch (error) {
      console.error("Failed to add expense:", error);
    throw error;
  }
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  // Обработчик выхода
 const handleLogout = async () => {
  try {
    await authAPI.logout();
    message.success('Вы вышли из системы');
  } catch (error) {
    console.error('Logout error:', error);
    message.error('Ошибка при выходе');
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('email');
    window.location.href = '/';
  }
};


  // Создаем роутер с актуальными данными
  const router = createAppRouter({
    expenses,
    onAddExpense: addExpense,
    onDeleteExpense: deleteExpense,
    onLogout: handleLogout,
  });

  return (
    <ConfigProvider 
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#2078F3',
          borderRadius: 8,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
