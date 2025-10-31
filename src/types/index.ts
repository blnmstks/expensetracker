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
  created_at: string | number | Date;
  category_detail?: CategoryDetail;
  conversions?: Conversion[];

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
  name: string;
  symbol: string;
  rate: string;
  is_active: boolean;
  is_personal: boolean;
};

export type CurrencySettings = {
  defaultCurrency: number;
  activeCurrencies: number[];
  exchangeRates: Record<string, number>;
  syncWithGoogle: boolean;
  googleRateAdjustment: number;
};

export type CategoryDetail = {
  color: string;
  created_at: string;
  expenses_count: number;
  icon: string;
  id: number;
  is_active: boolean;
  name: string;
  updated_at: string;
};

export type Conversion = { 
  currency_code: string;
  currency_symbol: string;
  amount: string;
  rate_snapshot: string;
  currency: number;
};