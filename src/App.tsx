import { useState, useEffect } from "react";
import {
  Wallet,
  BarChart3,
  Settings,
  Plus,
  History as HistoryIcon,
  LogOut,
} from "lucide-react";
import { AddExpense } from "./components/AddExpense";
import { Analytics } from "./components/Analytics";
import { SettingsPage } from "./components/SettingsPage";
import { History } from "./components/History";
import { Login } from "./components/Login";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { expenseAPI, authAPI } from "./services/api";
import ErrorBoundary, { SectionFallback } from "./components/ErrorBoundary";

export type Expense = {
  id: string;
  amount: number;
  currency: number;
  category: number;
  date: string;
  month: string;
  comment?: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

export type Currency = {
  id: number;
  code: string;
  symbol: string;
  name: string;
};

export type CurrencySettings = {
  defaultCurrency: number;
  activeCurrencies: number[];
  exchangeRates: Record<string, number>;
  syncWithGoogle: boolean;
  googleRateAdjustment: number;
};

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
  const [activeTab, setActiveTab] = useState<
    "expenses" | "analytics" | "history" | "settings"
  >("expenses");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(
    DEFAULT_CURRENCY_SETTINGS,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
        id: createdExpense.id?.toString(),
      };
      setExpenses([newExpense, ...expenses]);
      
      return newExpense;
  } catch (error) {
      console.error("Failed to add expense:", error);
    throw error;
  }
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  // Обработчик успешного входа
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    toast.success('Добро пожаловать!');
  };

  // Обработчик выхода
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.setItem('auth_token', '');
      setIsAuthenticated(false);
      toast.success('Вы вышли из системы');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Ошибка при выходе');
    }
  };

  // if (isCheckingAuth) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-neutral-50">
  //       <div className="text-center">
  //         <Wallet className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-pulse" />
  //         <div className="text-lg text-neutral-600">Загрузка...</div>
  //       </div>
  //     </div>
  //   );
  // }

  // Показываем страницу входа, если не авторизован
  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <Login onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }
  console.log('test error boundary');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Toaster />
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-neutral-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-8 pb-4">
            <div className="flex flex-shrink-0 items-center px-6 mb-8">
              <Wallet className="w-8 h-8 text-emerald-600 mr-3" />
              <h1 className="text-neutral-900">
                Трекер расходов
              </h1>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  activeTab === "expenses" &&
                    "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
                )}
                onClick={() => setActiveTab("expenses")}
              >
                <Plus className="mr-3 h-5 w-5" />
                Добавить расход
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  activeTab === "analytics" &&
                    "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
                )}
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Аналитика
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  activeTab === "history" &&
                    "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
                )}
                onClick={() => setActiveTab("history")}
              >
                <HistoryIcon className="mr-3 h-5 w-5" />
                История
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  activeTab === "settings" &&
                    "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
                )}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-3 h-5 w-5" />
                Настройки
              </Button>
            </nav>
            
            {/* User info and logout */}
            <div className="px-3 py-4 border-t border-neutral-200">
              {currentUser && (
                <div className="text-sm text-neutral-600 mb-2 px-3">
                  {currentUser.email}
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="w-7 h-7 text-emerald-600 mr-3" />
            <h1 className="text-neutral-900">Трекер расходов</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:pl-64 pb-20 md:pb-8">
        <div className="px-4 py-8 md:px-8">
          {activeTab === "expenses" && (
            <ErrorBoundary fallback={<SectionFallback name="Добавить расход" />}>
              <AddExpense
                onAddExpense={addExpense}
                expenses={expenses}
                onDeleteExpense={deleteExpense}
                currencySettings={currencySettings}
              />
            </ErrorBoundary>
            
          )}
          {activeTab === "analytics" && (
            <ErrorBoundary fallback={<SectionFallback name="Аналитика" />}>
                <Analytics
                  expenses={expenses}
                  currencySettings={currencySettings}
                />
            </ErrorBoundary>
            
          )}
          {activeTab === "history" && (
            <History
              expenses={expenses}
              currencySettings={currencySettings}
            />
          )}
          {activeTab === "settings" && (
            <SettingsPage
              currencySettings={currencySettings}
              onUpdateCurrencySettings={setCurrencySettings}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-10">
        <div className="grid grid-cols-4">
          <button
            onClick={() => setActiveTab("expenses")}
            className={cn(
              "flex flex-col items-center justify-center py-3 transition-colors",
              activeTab === "expenses"
                ? "text-emerald-600"
                : "text-neutral-500",
            )}
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs">Расходы</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "flex flex-col items-center justify-center py-3 transition-colors",
              activeTab === "analytics"
                ? "text-emerald-600"
                : "text-neutral-500",
            )}
          >
            <BarChart3 className="w-6 h-6 mb-1" />
            <span className="text-xs">Аналитика</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex flex-col items-center justify-center py-3 transition-colors",
              activeTab === "history"
                ? "text-emerald-600"
                : "text-neutral-500",
            )}
          >
            <HistoryIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">История</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "flex flex-col items-center justify-center py-3 transition-colors",
              activeTab === "settings"
                ? "text-emerald-600"
                : "text-neutral-500",
            )}
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-xs">Настройки</span>
          </button>
        </div>
      </nav>
    </div>
  );
}