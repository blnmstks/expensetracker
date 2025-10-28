export type Expense = {
  id: number;
  category_color: string;
  category_name: string;
  amount: number;
  currency: number;
  category: number;
  date: string;
  month: number;
  comment?: string;
  currency_code: string;
  currency_symbol: number;
  year: number;
  category_icon: string;
  created_at?: string;

//   amount
// : 
// "22.00"
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