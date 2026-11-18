import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CategoryPicker, FormField, Icon, StatusToast, palette } from "@/components/finance-ui";
import { getCategory, useFinance, type TransactionType } from "@/lib/finance-store";
import { ScreenContainer } from "@/components/screen-container";

export default function AddTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { transactions, categories, notice, setNotice, addTransaction, updateTransaction, settings } = useFinance();
  const existing = useMemo(() => transactions.find((item) => item.id === id), [id, transactions]);
  const [type, setType] = useState<TransactionType>(existing?.type ?? "expense");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [category, setCategory] = useState(existing?.categoryId ?? "food");
  const [date, setDate] = useState(existing?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState("");

  const submit = () => {
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) return setError("اكتب مبلغًا أكبر من صفر.");
    if (!title.trim()) return setError("أضف اسمًا قصيرًا للعملية.");
    setError("");
    const input = { title: title.trim(), amount: numericAmount, type, categoryId: category, date: new Date(`${date}T12:00:00`).toISOString(), note: note.trim() };
    if (existing) updateTransaction(existing.id, input); else addTransaction(input);
    router.replace("/");
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <StatusToast notice={notice} onDismiss={() => setNotice(null)} />
          <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="إغلاق" onPress={() => router.back()} style={styles.closeButton}><Icon name="close" size={20} color={palette.ink} /></Pressable><View><Text style={styles.eyebrow}>{existing ? "إدارة العملية" : "خطوة سريعة"}</Text><Text style={styles.title}>{existing ? "عدّل العملية" : "أضف عملية"}</Text></View></View>
          <View style={styles.typeSwitch}><Pressable onPress={() => setType("expense")} style={[styles.typeOption, type === "expense" && styles.expenseActive]}><Icon name="south-east" size={18} color={type === "expense" ? palette.danger : palette.muted} /><Text style={[styles.typeText, type === "expense" && { color: palette.danger }]}>مصروف</Text></Pressable><Pressable onPress={() => setType("income")} style={[styles.typeOption, type === "income" && styles.incomeActive]}><Icon name="north-east" size={18} color={type === "income" ? palette.success : palette.muted} /><Text style={[styles.typeText, type === "income" && { color: palette.success }]}>دخل</Text></Pressable></View>
          <View style={styles.amountCard}><Text style={styles.amountLabel}>كم المبلغ؟</Text><View style={styles.amountRow}><Text style={styles.currency}>{settings.currency}</Text><FormField label="" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" style={styles.amountInput} /></View></View>
          <FormField label="اسم العملية" value={title} onChangeText={setTitle} placeholder={type === "income" ? "مثال: راتب الشهر" : "مثال: قهوة الصباح"} maxLength={42} />
          <Text style={styles.formLabel}>التصنيف</Text>
          <CategoryPicker categories={type === "income" ? categories.filter((item) => item.id === "salary" || item.id === "other") : categories.filter((item) => item.id !== "salary")} selectedId={category} onSelect={setCategory} />
          <View style={styles.twoFields}><View style={{ flex: 1 }}><FormField label="التاريخ" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /></View><View style={{ flex: 1 }}><FormField label="ملاحظة (اختياري)" value={note} onChangeText={setNote} placeholder="أضف سياقًا" maxLength={60} /></View></View>
          {error ? <View style={styles.errorBox}><Icon name="error-outline" size={18} color={palette.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
          <Pressable accessibilityRole="button" onPress={submit} style={styles.saveButton}><Icon name="check" size={20} color="#FFF" /><Text style={styles.saveText}>{existing ? "حفظ التعديلات" : "حفظ العملية"}</Text></Pressable>
          {existing ? <Text style={styles.helper}>التصنيف الحالي: {getCategory(category).label}</Text> : <Text style={styles.helper}>تُحفظ العملية على جهازك وتظهر فورًا في الملخص.</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  closeButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: palette.accent, fontSize: 12, fontWeight: "800", textAlign: "right", marginBottom: 4 },
  title: { color: palette.ink, fontSize: 27, fontWeight: "800", textAlign: "right" },
  typeSwitch: { flexDirection: "row", backgroundColor: "#EEF0EB", padding: 4, borderRadius: 16, gap: 4, marginBottom: 18 },
  typeOption: { flex: 1, minHeight: 44, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  expenseActive: { backgroundColor: palette.dangerSoft },
  incomeActive: { backgroundColor: palette.successSoft },
  typeText: { color: palette.muted, fontSize: 13, fontWeight: "800" },
  amountCard: { backgroundColor: palette.ink, borderRadius: 22, padding: 18, marginBottom: 18 },
  amountLabel: { color: "#B9CDC4", fontSize: 12, textAlign: "right", marginBottom: 3 },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  currency: { color: palette.accent, fontSize: 14, fontWeight: "800" },
  amountInput: { flex: 1, minHeight: 52, borderColor: "rgba(255,255,255,0.22)", color: "#FFF", backgroundColor: "rgba(255,255,255,0.08)", fontSize: 26, fontWeight: "800", textAlign: "right" },
  formLabel: { color: palette.ink, fontSize: 13, fontWeight: "800", textAlign: "right", marginBottom: 7 },
  twoFields: { flexDirection: "row", gap: 10, marginTop: 14 },
  errorBox: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: palette.dangerSoft, padding: 12, borderRadius: 13, marginTop: 2 },
  errorText: { flex: 1, color: palette.danger, fontSize: 12, fontWeight: "700", textAlign: "right" },
  saveButton: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: palette.ink, borderRadius: 16, marginTop: 20 },
  saveText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  helper: { color: palette.muted, fontSize: 11, textAlign: "center", marginTop: 12 },
});
