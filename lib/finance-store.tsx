import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
  softColor: string;
};

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  note?: string;
};

export type FinanceSettings = {
  notifications: boolean;
  notificationsPermission: boolean;
  offlineMode: boolean;
  currency: string;
  onboarded: boolean;
};

type Notice = { message: string; tone: "success" | "error" | "info" } | null;

type FinanceContextValue = {
  transactions: Transaction[];
  settings: FinanceSettings;
  categories: Category[];
  isLoading: boolean;
  isOnline: boolean;
  notice: Notice;
  lastDeleted: Transaction | null;
  monthlyTotals: { income: number; expense: number; balance: number };
  addTransaction: (input: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, input: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  restoreLastDeleted: () => void;
  updateSettings: (patch: Partial<FinanceSettings>) => void;
  resetData: () => void;
  setNotice: (notice: Notice) => void;
  setOnline: (value: boolean) => void;
};

const STORAGE_KEY = "mizan-finance-v1";

export const CATEGORIES: Category[] = [
  { id: "food", label: "طعام ومقاهي", icon: "restaurant", color: "#D97745", softColor: "#FCE9DE" },
  { id: "transport", label: "تنقّل", icon: "directions-car", color: "#6A7EC7", softColor: "#E9EDFC" },
  { id: "home", label: "المنزل", icon: "home", color: "#3C8D75", softColor: "#E1F2EA" },
  { id: "shopping", label: "تسوّق", icon: "shopping-bag", color: "#B06B9F", softColor: "#F7E7F2" },
  { id: "health", label: "صحة", icon: "favorite", color: "#CB6B68", softColor: "#F9E4E2" },
  { id: "salary", label: "راتب", icon: "payments", color: "#3D8D69", softColor: "#E0F2E7" },
  { id: "other", label: "أخرى", icon: "more-horiz", color: "#7C7B83", softColor: "#ECECEF" },
];

const initialDate = (day: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day, 12).toISOString();
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: "sample-1", title: "راتب الشهر", amount: 12500, type: "income", categoryId: "salary", date: initialDate(1), note: "الدخل الأساسي" },
  { id: "sample-2", title: "سوبرماركت الحي", amount: 486.5, type: "expense", categoryId: "food", date: initialDate(6), note: "مشتريات الأسبوع" },
  { id: "sample-3", title: "اشتراك الإنترنت", amount: 249, type: "expense", categoryId: "home", date: initialDate(8) },
  { id: "sample-4", title: "رحلة إلى العمل", amount: 180, type: "expense", categoryId: "transport", date: initialDate(12) },
  { id: "sample-5", title: "عشاء الجمعة", amount: 315, type: "expense", categoryId: "food", date: initialDate(15) },
];

const DEFAULT_SETTINGS: FinanceSettings = {
  notifications: true,
  notificationsPermission: false,
  offlineMode: false,
  currency: "د.م.",
  onboarded: false,
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isCurrentMonth(date: string) {
  const value = new Date(date);
  const now = new Date();
  return value.getMonth() === now.getMonth() && value.getFullYear() === now.getFullYear();
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [settings, setSettings] = useState<FinanceSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);
  const [isOnline, setOnline] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as { transactions?: Transaction[]; settings?: FinanceSettings };
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      })
      .catch(() => setNotice({ message: "تعذر استعادة البيانات المحفوظة. نعرض نسخة آمنة مؤقتًا.", tone: "error" }))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, settings })).catch(() =>
      setNotice({ message: "تعذر حفظ التغيير. حاول مجددًا.", tone: "error" }),
    );
  }, [transactions, settings, isLoading]);

  const monthlyTotals = useMemo(() => {
    const monthTransactions = transactions.filter((transaction) => isCurrentMonth(transaction.date));
    const income = monthTransactions.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = monthTransactions.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + transaction.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      settings,
      categories: CATEGORIES,
      isLoading,
      isOnline: isOnline && !settings.offlineMode,
      notice,
      lastDeleted,
      monthlyTotals,
      addTransaction: (input) => {
        setTransactions((current) => [{ ...input, id: makeId() }, ...current]);
        setNotice({ message: "تم حفظ العملية. ترتيبك المالي يتحسن خطوة بخطوة.", tone: "success" });
      },
      updateTransaction: (id, input) => {
        setTransactions((current) => current.map((item) => (item.id === id ? { ...input, id } : item)));
        setNotice({ message: "تم تحديث العملية بنجاح.", tone: "success" });
      },
      deleteTransaction: (id) => {
        setTransactions((current) => {
          const found = current.find((item) => item.id === id);
          if (found) setLastDeleted(found);
          return current.filter((item) => item.id !== id);
        });
        setNotice({ message: "حُذفت العملية. يمكنك التراجع الآن.", tone: "info" });
      },
      restoreLastDeleted: () => {
        if (!lastDeleted) return;
        setTransactions((current) => [lastDeleted, ...current]);
        setLastDeleted(null);
        setNotice({ message: "تمت استعادة العملية.", tone: "success" });
      },
      updateSettings: (patch) => setSettings((current) => ({ ...current, ...patch })),
      resetData: () => {
        setTransactions(DEFAULT_TRANSACTIONS);
        setSettings(DEFAULT_SETTINGS);
        setNotice({ message: "عادت البيانات التجريبية. يمكنك البدء من جديد.", tone: "success" });
      },
      setNotice,
      setOnline,
    }),
    [isLoading, isOnline, lastDeleted, monthlyTotals, notice, settings, transactions],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used inside FinanceProvider");
  return context;
}

export function getCategory(categoryId: string) {
  return CATEGORIES.find((category) => category.id === categoryId) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function formatMoney(value: number, currency = "د.م.") {
  return `${value.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ar-MA", { day: "numeric", month: "short" });
}

export function getMonthLabel() {
  return new Date().toLocaleDateString("ar-MA", { month: "long", year: "numeric" });
}
