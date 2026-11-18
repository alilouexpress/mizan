import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BrandMark } from "@/components/brand-mark";
import { BalanceCard, EmptyState, Icon, LoadingState, MetricCard, OfflineBanner, ScreenTitle, SectionHeading, StatusToast, TransactionRow, palette } from "@/components/finance-ui";
import { formatMoney, getMonthLabel, useFinance } from "@/lib/finance-store";
import { ScreenContainer } from "@/components/screen-container";

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, settings, isLoading, isOnline, notice, monthlyTotals, updateSettings, setNotice } = useFinance();
  const recentTransactions = transactions.slice(0, 4);
  const dateLabel = new Date().toLocaleDateString("ar-MA", { weekday: "long", day: "numeric", month: "long" });

  if (isLoading) {
    return <ScreenContainer><LoadingState /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <StatusToast notice={notice} onDismiss={() => setNotice(null)} />
        <ScreenTitle eyebrow={dateLabel} title="صباحك المالي" action={<BrandMark size={46} />} />
        {!isOnline ? <OfflineBanner /> : null}
        {!settings.onboarded ? (
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}><Icon name="auto-awesome" size={20} color={palette.accent} /></View>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle}>أهلًا بك في ميزان</Text>
              <Text style={styles.welcomeText}>سجّل أول عملية، وخلي الصورة المالية أوضح من اليوم.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => updateSettings({ onboarded: true })} style={styles.welcomeButton}><Text style={styles.welcomeButtonText}>فهمت</Text></Pressable>
          </View>
        ) : null}

        <View style={styles.monthRow}><Text style={styles.monthLabel}>{getMonthLabel()}</Text><View style={styles.todayBadge}><View style={styles.todayDot} /><Text style={styles.todayText}>هذا الشهر</Text></View></View>
        <BalanceCard balance={monthlyTotals.balance} income={monthlyTotals.income} expense={monthlyTotals.expense} currency={settings.currency} />
        <View style={styles.metricRow}>
          <MetricCard label="الدخل" value={formatMoney(monthlyTotals.income, settings.currency)} icon="north-east" tone="income" caption="منذ بداية الشهر" />
          <MetricCard label="المصروفات" value={formatMoney(monthlyTotals.expense, settings.currency)} icon="south-east" tone="expense" caption="منذ بداية الشهر" />
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push("/add")} style={({ pressed }) => [styles.quickAdd, pressed && { transform: [{ scale: 0.985 }] }]}>
          <View style={styles.quickAddIcon}><Icon name="add" size={22} color={palette.ink} /></View>
          <View style={{ flex: 1 }}><Text style={styles.quickAddTitle}>سجّل عملية جديدة</Text><Text style={styles.quickAddText}>دخل أو مصروف في أقل من دقيقة</Text></View>
          <Icon name="chevron-left" size={20} color={palette.muted} />
        </Pressable>

        <SectionHeading title="آخر العمليات" action="كل العمليات" onAction={() => router.push("/transactions")} />
        {recentTransactions.length === 0 ? (
          <EmptyState title="سجلك جاهز للبداية" description="أضف أول دخل أو مصروف، وستظهر هنا لمحة مرتبة عن يومك المالي." actionLabel="أضف أول عملية" onAction={() => router.push("/add")} />
        ) : recentTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} currency={settings.currency} onPress={() => router.push({ pathname: "/add", params: { id: transaction.id } })} />)}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 30 },
  monthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  monthLabel: { color: palette.ink, fontSize: 15, fontWeight: "800", textAlign: "right" },
  todayBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: palette.accentSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  todayDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: palette.accent },
  todayText: { color: "#AA6815", fontSize: 11, fontWeight: "800" },
  metricRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  quickAdd: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#FFF4E5", borderColor: "#F8DDB9", borderWidth: 1, padding: 12, borderRadius: 18, marginTop: 2 },
  quickAddIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.accent, alignItems: "center", justifyContent: "center" },
  quickAddTitle: { color: palette.ink, fontSize: 14, fontWeight: "800", textAlign: "right" },
  quickAddText: { color: palette.muted, fontSize: 11, marginTop: 4, textAlign: "right" },
  welcomeCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F0F5EE", borderRadius: 18, borderWidth: 1, borderColor: "#DBE8D9", padding: 12, marginBottom: 16 },
  welcomeIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#FFF2D9", alignItems: "center", justifyContent: "center" },
  welcomeCopy: { flex: 1 },
  welcomeTitle: { color: palette.ink, fontSize: 13, fontWeight: "800", textAlign: "right" },
  welcomeText: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 3, textAlign: "right" },
  welcomeButton: { backgroundColor: palette.ink, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11 },
  welcomeButtonText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
});
