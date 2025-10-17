import { useState, useEffect } from "react";
import {
  Wallet,
  BarChart3,
  Settings,
  Plus,
  History as HistoryIcon,
} from "lucide-react";
import { AddExpense } from "./components/AddExpense";
import { Analytics } from "./components/Analytics";
import { SettingsPage } from "./components/SettingsPage";
import { History } from "./components/History";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";
import { Toaster } from "./components/ui/sonner";

export type Expense = {
  id: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  month: string;
  comment?: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export type CurrencySettings = {
  defaultCurrency: string;
  activeCurrencies: string[];
  exchangeRates: Record<string, number>;
  syncWithGoogle: boolean;
  googleRateAdjustment: number;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Продукты", color: "#10b981", icon: "🛒" },
  { id: "2", name: "Транспорт", color: "#3b82f6", icon: "🚗" },
  {
    id: "3",
    name: "Развлечения",
    color: "#f59e0b",
    icon: "🎮",
  },
  { id: "4", name: "Здоровье", color: "#ef4444", icon: "💊" },
  { id: "5", name: "Одежда", color: "#8b5cf6", icon: "👕" },
  {
    id: "6",
    name: "Образование",
    color: "#06b6d4",
    icon: "📚",
  },
];

export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
];

const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  defaultCurrency: "USD",
  activeCurrencies: ["USD", "RUB", "THB"],
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
  const [categories, setCategories] = useState<Category[]>(
    DEFAULT_CATEGORIES,
  );
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(
    DEFAULT_CURRENCY_SETTINGS,
  );

  // Load data from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses");
    const savedCategories = localStorage.getItem("categories");
    const savedCurrencySettings = localStorage.getItem("currencySettings");

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedCurrencySettings) {
      setCurrencySettings(JSON.parse(savedCurrencySettings));
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem(
      "categories",
      JSON.stringify(categories),
    );
  }, [categories]);

  // Save currency settings to localStorage
  useEffect(() => {
    localStorage.setItem(
      "currencySettings",
      JSON.stringify(currencySettings),
    );
  }, [currencySettings]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const updateCategory = (
    id: string,
    updatedCategory: Partial<Category>,
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, ...updatedCategory } : cat,
      ),
    );
  };

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
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center">
          <Wallet className="w-7 h-7 text-emerald-600 mr-3" />
          <h1 className="text-neutral-900">Трекер расходов</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:pl-64 pb-20 md:pb-8">
        <div className="px-4 py-8 md:px-8">
          {activeTab === "expenses" && (
            <AddExpense
              categories={categories}
              onAddExpense={addExpense}
              expenses={expenses}
              onDeleteExpense={deleteExpense}
              currencySettings={currencySettings}
            />
          )}
          {activeTab === "analytics" && (
            <Analytics
              expenses={expenses}
              categories={categories}
              currencySettings={currencySettings}
            />
          )}
          {activeTab === "history" && (
            <History
              expenses={expenses}
              categories={categories}
              currencySettings={currencySettings}
            />
          )}
          {activeTab === "settings" && (
            <SettingsPage
              categories={categories}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
              onUpdateCategory={updateCategory}
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