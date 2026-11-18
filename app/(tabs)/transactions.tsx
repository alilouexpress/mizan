import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState, FilterPill, Icon, OfflineBanner, ScreenTitle, SearchField, StatusToast, TransactionRow, palette } from "@/components/finance-ui";
import { getCategory, useFinance, type TransactionType } from "@/lib/finance-store";
import { ScreenContainer } from "@/components/screen-container";

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, categories, settings, isOnline, notice, setNotice, deleteTransaction, restoreLastDeleted, lastDeleted } = useFinance();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [category, setCategory] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => transactions.filter((transaction) => {
    const searchable = `${transaction.title} ${transaction.note ?? ""} ${getCategory(transaction.categoryId).label}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (type === "all" || transaction.type === type) && (category === "all" || transaction.categoryId === category);
  }), [category, query, transactions, type]);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <StatusToast notice={notice} onDismiss={() => setNotice(null)} />
        <ScreenTitle eyebrow={`${transactions.length} عمليات محفوظة`} title="سجل العمليات" action={<Pressable accessibilityRole="button" onPress={() => router.push("/add")} style={styles.headerAdd}><Icon name="add" size={20} color="#FFF" /></Pressable>} />
        {!isOnline ? <OfflineBanner /> : null}
        <SearchField value={query} onChangeText={setQuery} placeholder="ابحث بالاسم أو الملاحظة" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterPill label="الكل" selected={type === "all"} onPress={() => setType("all")} icon="list" />
          <FilterPill label="المصروفات" selected={type === "expense"} onPress={() => setType("expense")} icon="south-east" />
          <FilterPill label="الدخل" selected={type === "income"} onPress={() => setType("income")} icon="north-east" />
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterPill label="كل الفئات" selected={category === "all"} onPress={() => setCategory("all")} />
          {categories.map((item) => <FilterPill key={item.id} label={item.label} selected={category === item.id} onPress={() => setCategory(item.id)} />)}
        </ScrollView>
        <View style={styles.resultHeader}><Text style={styles.resultCount}>{filtered.length} نتائج</Text><Text style={styles.resultLabel}>النتائج المطابقة</Text></View>
        {filtered.length === 0 ? <EmptyState title="لا توجد نتائج هنا" description="جرّب تغيير كلمة البحث أو إزالة أحد الفلاتر، وستظهر العمليات المطابقة فورًا." actionLabel="أضف عملية" onAction={() => router.push("/add")} /> : filtered.map((transaction) => <View key={transaction.id} style={styles.rowWrap}><TransactionRow transaction={transaction} currency={settings.currency} onPress={() => router.push({ pathname: "/add", params: { id: transaction.id } })} /><Pressable accessibilityRole="button" accessibilityLabel={`حذف ${transaction.title}`} onPress={() => setPendingDelete(transaction.id)} style={styles.deleteButton}><Icon name="delete-outline" size={18} color={palette.danger} /></Pressable></View>)}
      </ScrollView>
      {lastDeleted ? <Pressable accessibilityRole="button" onPress={restoreLastDeleted} style={styles.undoBar}><Icon name="undo" size={17} color="#FFF" /><Text style={styles.undoText}>تراجع عن الحذف</Text></Pressable> : null}
      <Modal transparent visible={Boolean(pendingDelete)} animationType="fade" onRequestClose={() => setPendingDelete(null)}>
        <View style={styles.modalBackdrop}><View style={styles.confirmCard}><View style={styles.confirmIcon}><Icon name="delete-sweep" size={24} color={palette.danger} /></View><Text style={styles.confirmTitle}>حذف العملية؟</Text><Text style={styles.confirmText}>يمكنك التراجع مباشرة بعد الحذف إذا غيّرت رأيك.</Text><View style={styles.confirmActions}><Pressable style={styles.cancelButton} onPress={() => setPendingDelete(null)}><Text style={styles.cancelText}>إلغاء</Text></Pressable><Pressable style={styles.deleteConfirmButton} onPress={() => { if (pendingDelete) deleteTransaction(pendingDelete); setPendingDelete(null); }}><Text style={styles.deleteConfirmText}>حذف</Text></Pressable></View></View></View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 100 },
  headerAdd: { width: 40, height: 40, borderRadius: 14, backgroundColor: palette.ink, alignItems: "center", justifyContent: "center" },
  filters: { gap: 8, paddingTop: 12, paddingBottom: 3, paddingHorizontal: 1 },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 21, marginBottom: 10 },
  resultLabel: { color: palette.ink, fontSize: 16, fontWeight: "800" },
  resultCount: { color: palette.muted, fontSize: 12, fontWeight: "700" },
  rowWrap: { position: "relative" },
  deleteButton: { position: "absolute", left: 10, top: 12, width: 34, height: 34, borderRadius: 11, backgroundColor: palette.dangerSoft, alignItems: "center", justifyContent: "center" },
  undoBar: { position: "absolute", left: 18, right: 18, bottom: 14, borderRadius: 15, backgroundColor: palette.ink, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#173F36", shadowOpacity: 0.18, shadowRadius: 14, elevation: 5 },
  undoText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(17, 31, 26, 0.45)", alignItems: "center", justifyContent: "center", padding: 22 },
  confirmCard: { width: "100%", maxWidth: 370, backgroundColor: palette.surface, borderRadius: 24, padding: 22, alignItems: "center" },
  confirmIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: palette.dangerSoft, alignItems: "center", justifyContent: "center", marginBottom: 13 },
  confirmTitle: { color: palette.ink, fontSize: 19, fontWeight: "800" },
  confirmText: { color: palette.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 7 },
  confirmActions: { flexDirection: "row", gap: 10, width: "100%", marginTop: 20 },
  cancelButton: { flex: 1, minHeight: 46, borderRadius: 13, backgroundColor: "#F0F1ED", alignItems: "center", justifyContent: "center" },
  cancelText: { color: palette.ink, fontSize: 13, fontWeight: "800" },
  deleteConfirmButton: { flex: 1, minHeight: 46, borderRadius: 13, backgroundColor: palette.danger, alignItems: "center", justifyContent: "center" },
  deleteConfirmText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
});
