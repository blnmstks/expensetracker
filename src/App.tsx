import { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Login } from "./components/Login";
import { expenseAPI, authAPI } from "./services/api";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { createAppRouter } from "./routes";
import { message } from "antd";
import { Currency, CurrencySettings, Expense } from "./types";

export const AVAILABLE_CURRENCIES: Currency[] = [
  { id: 1, code: "USD", symbol: "$", name: "US Dollar" },
  { id: 2, code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { id: 3, code: "THB", symbol: "฿", name: "Thai Baht" },
];

const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  defaultCurrency: 1,
  activeCurrencies: [1, 2, 3],
  exchangeRates: {
    USD: 1,
    RUB: 92,
    THB: 35,
  },
  syncWithGoogle: true,
  googleRateAdjustment: 0,
};

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(
    DEFAULT_CURRENCY_SETTINGS,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if(localStorage.getItem('auth_token')) {
      setIsAuthenticated(true);
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

  // Обработчик успешного входа
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    message.success('Добро пожаловать!');
  };

  // Обработчик выхода
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.setItem('auth_token', '');
      setIsAuthenticated(false);
      message.success('Вы вышли из системы');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Ошибка при выходе');
    }
  };

  // Показываем страницу входа, если не авторизован
  if (!isAuthenticated) {
    return (
      <ConfigProvider locale={ruRU}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ConfigProvider>
    );
  }

  // Создаем роутер с актуальными данными
  const router = createAppRouter({
    expenses,
    currencySettings,
    onAddExpense: addExpense,
    onDeleteExpense: deleteExpense,
    onUpdateCurrencySettings: setCurrencySettings,
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
