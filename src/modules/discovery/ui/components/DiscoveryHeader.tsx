import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/provider/ThemeProvider";

interface DiscoveryHeaderProps {
  place: string;
  onLocationPress: () => void;
  rightComponent?: React.ReactNode;
  secondRightComponent?: React.ReactNode;
}

const DiscoveryHeader = ({
  place,
  onLocationPress,
  rightComponent,
  secondRightComponent,
}: DiscoveryHeaderProps) => {
  const { isDark } = useTheme();
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: textMain }]}>Musez</Text>
        <TouchableOpacity onPress={onLocationPress} style={styles.locationRow} activeOpacity={0.7}>
          <Ionicons name="location-sharp" size={13} color={Colors.Primary} />
          <Text style={[styles.locationText, { color: textSub }]} numberOfLines={1}>
            {place}
          </Text>
          <Ionicons name="chevron-forward" size={12} color={textSub} />
        </TouchableOpacity>
      </View>

      <View style={styles.right}>
        {secondRightComponent}
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  left: { flex: 1, gap: 3 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 13, fontWeight: "500", flexShrink: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 12 },
});

export default DiscoveryHeader;
