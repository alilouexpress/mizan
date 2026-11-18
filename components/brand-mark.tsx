import { View } from "react-native";

import { palette } from "@/components/finance-ui";

export function BrandMark({ size = 52 }: { size?: number }) {
  const stroke = Math.max(3, size * 0.08);
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: palette.accentSoft, alignItems: "center", justifyContent: "center" }} accessibilityLabel="شعار ميزان">
      <View style={{ width: size * 0.56, height: size * 0.56, borderRadius: size * 0.28, borderWidth: stroke, borderColor: palette.ink, transform: [{ rotate: "45deg" }] }} />
      <View style={{ position: "absolute", width: size * 0.14, height: size * 0.14, borderRadius: size, backgroundColor: palette.accent }} />
    </View>
  );
}
