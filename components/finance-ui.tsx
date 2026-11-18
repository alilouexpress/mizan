import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { formatDate, formatMoney, getCategory, type Category, type Transaction } from "@/lib/finance-store";

export type IconName = keyof typeof MaterialIcons.glyphMap;

export const palette = {
  background: "#FBF8F2",
  surface: "#FFFFFF",
  ink: "#173F36",
  text: "#24332E",
  muted: "#78847E",
  border: "#E8E4DC",
  accent: "#F3A64A",
  accentSoft: "#FFF0DB",
  success: "#2D8B63",
  successSoft: "#E4F4EB",
  danger: "#C65B57",
  dangerSoft: "#FCE8E6",
};

export function Icon({ name, size = 22, color = palette.ink }: { name: IconName; size?: number; color?: string }) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.titleRow}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.screenTitle}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function StatusToast({ notice, onDismiss }: { notice: { message: string; tone: "success" | "error" | "info" } | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(onDismiss, 4200);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);
  if (!notice) return null;
  const colors = notice.tone === "error" ? { bg: palette.dangerSoft, fg: palette.danger, icon: "error-outline" as const } : notice.tone === "success" ? { bg: palette.successSoft, fg: palette.success, icon: "check-circle-outline" as const } : { bg: "#EAF1F1", fg: palette.ink, icon: "info-outline" as const };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="إغلاق الرسالة" onPress={onDismiss} style={[styles.toast, { backgroundColor: colors.bg }]}>
      <Icon name={colors.icon} size={18} color={colors.fg} />
      <Text style={[styles.toastText, { color: colors.fg }]}>{notice.message}</Text>
    </Pressable>
  );
}

export function OfflineBanner() {
  return (
    <View style={styles.offlineBanner}>
      <Icon name="cloud-off" size={17} color={palette.ink} />
      <Text style={styles.offlineText}>أنت تعمل دون اتصال — تغييراتك محفوظة على هذا الجهاز</Text>
    </View>
  );
}

export function BalanceCard({ balance, income, expense, currency }: { balance: number; income: number; expense: number; currency: string }) {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceTopRow}>
        <View>
          <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
          <Text style={styles.balanceValue}>{formatMoney(balance, currency)}</Text>
        </View>
        <View style={styles.balanceMark}><Icon name="account-balance-wallet" size={20} color={palette.accent} /></View>
      </View>
      <View style={styles.balanceDivider} />
      <View style={styles.balanceStats}>
        <View style={styles.balanceStat}><View style={styles.statLabelRow}><View style={[styles.dot, { backgroundColor: "#86D6AE" }]} /><Text style={styles.balanceStatLabel}>الدخل</Text></View><Text style={styles.balanceStatValue}>{formatMoney(income, currency)}</Text></View>
        <View style={styles.balanceStat}><View style={styles.statLabelRow}><View style={[styles.dot, { backgroundColor: "#F7B26A" }]} /><Text style={styles.balanceStatLabel}>المصروفات</Text></View><Text style={styles.balanceStatValue}>{formatMoney(expense, currency)}</Text></View>
      </View>
    </View>
  );
}

export function MetricCard({ label, value, icon, tone = "default", caption }: { label: string; value: string; icon: keyof typeof MaterialIcons.glyphMap; tone?: "default" | "income" | "expense"; caption?: string }) {
  const theme = tone === "income" ? { bg: palette.successSoft, icon: palette.success } : tone === "expense" ? { bg: palette.accentSoft, icon: "#C4771D" } : { bg: "#EEF1EB", icon: palette.ink };
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: theme.bg }]}><Icon name={icon} size={18} color={theme.icon} /></View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {caption ? <Text style={styles.metricCaption}>{caption}</Text> : null}
    </View>
  );
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction} hitSlop={8}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function TransactionRow({ transaction, currency, onPress }: { transaction: Transaction; currency: string; onPress?: () => void }) {
  const category = getCategory(transaction.categoryId);
  const amountColor = transaction.type === "income" ? palette.success : palette.text;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.transactionRow, pressed && { opacity: 0.7 }]}>
      <View style={[styles.categoryIcon, { backgroundColor: category.softColor }]}><Icon name={category.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={category.color} /></View>
      <View style={styles.transactionCopy}><Text style={styles.transactionTitle} numberOfLines={1}>{transaction.title}</Text><Text style={styles.transactionMeta}>{category.label} · {formatDate(transaction.date)}</Text></View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>{transaction.type === "income" ? "+" : "−"}{formatMoney(transaction.amount, currency)}</Text>
    </Pressable>
  );
}

export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Icon name="auto-graph" size={28} color={palette.ink} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel && onAction ? <Pressable style={styles.primaryButton} onPress={onAction}><Icon name="add" size={20} color="#FFF" /><Text style={styles.primaryButtonText}>{actionLabel}</Text></Pressable> : null}
    </View>
  );
}

export function LoadingState() {
  return <View style={styles.loadingState}><ActivityIndicator size="small" color={palette.accent} /><Text style={styles.loadingText}>نحضّر ملخصك…</Text></View>;
}

export function SearchField({ value, onChangeText, placeholder = "ابحث عن عملية" }: Pick<TextInputProps, "value" | "onChangeText"> & { placeholder?: string }) {
  return <View style={styles.searchField}><Icon name="search" size={20} color={palette.muted} /><TextInput accessibilityLabel={placeholder} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#A0AAA4" style={styles.searchInput} returnKeyType="search" /></View>;
}

export function FilterPill({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: keyof typeof MaterialIcons.glyphMap }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.filterPill, selected && styles.filterPillSelected]}>{icon ? <Icon name={icon} size={16} color={selected ? "#FFF" : palette.muted} /> : null}<Text style={[styles.filterText, selected && styles.filterTextSelected]}>{label}</Text></Pressable>;
}

export function CategoryPicker({ categories, selectedId, onSelect }: { categories: Category[]; selectedId: string; onSelect: (id: string) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPicker} directionalLockEnabled>{categories.map((category) => <Pressable key={category.id} onPress={() => onSelect(category.id)} accessibilityRole="button" accessibilityState={{ selected: selectedId === category.id }} style={[styles.categoryChoice, selectedId === category.id && { borderColor: category.color, backgroundColor: category.softColor }]}><Icon name={category.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={selectedId === category.id ? category.color : palette.muted} /><Text style={[styles.categoryChoiceText, selectedId === category.id && { color: category.color, fontWeight: "700" }]}>{category.label}</Text></Pressable>)}</ScrollView>;
}

export function FormField({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.formField}><Text style={styles.formLabel}>{label}</Text><TextInput {...props} placeholderTextColor="#A0AAA4" style={[styles.formInput, props.multiline && styles.formInputMultiline, props.style]} /></View>;
}

export function stylesForField() {
  return styles;
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 22 },
  eyebrow: { color: palette.accent, fontSize: 13, fontWeight: "700", marginBottom: 5, textAlign: "right" },
  screenTitle: { color: palette.ink, fontSize: 28, fontWeight: "800", textAlign: "right", letterSpacing: -0.4 },
  toast: { position: "absolute", zIndex: 20, top: 12, left: 16, right: 16, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 9, shadowColor: "#173F36", shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  toastText: { flex: 1, fontSize: 13, fontWeight: "700", textAlign: "right" },
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EEF0EA", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  offlineText: { flex: 1, color: palette.ink, fontSize: 12, fontWeight: "600", textAlign: "right" },
  balanceCard: { borderRadius: 24, padding: 20, marginBottom: 14, shadowColor: "#173F36", shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  balanceTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balanceLabel: { color: "#B9CDC4", fontSize: 13, fontWeight: "600", textAlign: "right", marginBottom: 5 },
  balanceValue: { color: "#FFFFFF", fontSize: 31, fontWeight: "800", textAlign: "right", letterSpacing: -0.8 },
  balanceMark: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.11)", alignItems: "center", justifyContent: "center" },
  balanceDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 18 },
  balanceStats: { flexDirection: "row", gap: 28 },
  balanceStat: { flex: 1 },
  statLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 5 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  balanceStatLabel: { color: "#B9CDC4", fontSize: 12, textAlign: "right" },
  balanceStatValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", textAlign: "right" },
  metricCard: { flex: 1, backgroundColor: palette.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: palette.border, minHeight: 120 },
  metricIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 10, alignSelf: "flex-end" },
  metricLabel: { color: palette.muted, fontSize: 12, fontWeight: "600", textAlign: "right" },
  metricValue: { color: palette.ink, fontSize: 16, fontWeight: "800", textAlign: "right", marginTop: 4 },
  metricCaption: { color: palette.muted, fontSize: 10, textAlign: "right", marginTop: 4 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 },
  sectionTitle: { color: palette.ink, fontSize: 17, fontWeight: "800", textAlign: "right" },
  sectionAction: { color: palette.accent, fontSize: 13, fontWeight: "800" },
  transactionRow: { flexDirection: "row", alignItems: "center", backgroundColor: palette.surface, borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#EFEBE3", gap: 11 },
  categoryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  transactionCopy: { flex: 1, alignItems: "flex-end" },
  transactionTitle: { color: palette.text, fontSize: 14, fontWeight: "700", textAlign: "right", width: "100%" },
  transactionMeta: { color: palette.muted, fontSize: 11, marginTop: 4, textAlign: "right", width: "100%" },
  transactionAmount: { fontSize: 13, fontWeight: "800", maxWidth: 105, textAlign: "left" },
  emptyState: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 20, backgroundColor: palette.surface, borderRadius: 20, borderWidth: 1, borderColor: palette.border, marginTop: 6 },
  emptyIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: palette.accentSoft, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: palette.ink, fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyDescription: { color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 7, maxWidth: 270 },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: palette.ink, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 18, marginTop: 18 },
  primaryButtonText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  loadingState: { alignItems: "center", justifyContent: "center", paddingVertical: 100, gap: 12 },
  loadingText: { color: palette.muted, fontSize: 13 },
  searchField: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, minHeight: 48 },
  searchInput: { flex: 1, color: palette.text, fontSize: 14, textAlign: "right", paddingVertical: 10 },
  filterPill: { minHeight: 37, borderRadius: 20, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 },
  filterPillSelected: { backgroundColor: palette.ink, borderColor: palette.ink },
  filterText: { color: palette.muted, fontSize: 12, fontWeight: "700" },
  filterTextSelected: { color: "#FFF" },
  categoryPicker: { gap: 8, paddingVertical: 4, paddingHorizontal: 1 },
  categoryChoice: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  categoryChoiceText: { color: palette.muted, fontSize: 11, fontWeight: "600" },
  formField: { marginBottom: 15 },
  formLabel: { color: palette.ink, fontSize: 13, fontWeight: "800", textAlign: "right", marginBottom: 7 },
  formInput: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: palette.border, color: palette.text, backgroundColor: palette.surface, paddingHorizontal: 14, fontSize: 15, textAlign: "right" },
  formInputMultiline: { minHeight: 84, paddingTop: 13, textAlignVertical: "top" },
});
