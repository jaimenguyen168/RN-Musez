import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { Museum } from "@/types/museum";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/provider/ThemeProvider";
import { useLocationManager } from "@/hooks/useLocationManager";
import { calculateAndFormatDistance, DistanceUnit } from "@/utils/distance";

interface MuseumInfoListProps {
  title: string;
  museums: Museum[];
  onCardPress: (museumId: string) => void;
}

const MuseumInfoList = ({ title, museums, onCardPress }: MuseumInfoListProps) => {
  const { isDark } = useTheme();
  if (museums.length === 0) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#F9FAFB" : "#111827" }]}>{title}</Text>
      </View>

      <View style={styles.listContainer}>
        {museums.map((museum, index) => (
          <MuseumInfoCard
            key={museum.placeId}
            museum={museum}
            onCardPress={() => onCardPress(museum.placeId)}
            isLast={index === museums.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

export default MuseumInfoList;

const MuseumInfoCard = ({
  museum,
  onCardPress,
  isLast,
}: {
  museum: Museum;
  onCardPress: () => void;
  isLast: boolean;
}) => {
  const { isDark } = useTheme();
  const { coords } = useLocationManager(false);

  const formattedDistance = useMemo(() => {
    if (!coords || !museum.geometry?.location) return null;
    return calculateAndFormatDistance(
      coords,
      { latitude: museum.geometry.location.lat, longitude: museum.geometry.location.lng },
      "imperial" as DistanceUnit,
    );
  }, [coords, museum.geometry?.location]);

  const isOpen = museum.openingHours?.openNow ?? museum.currentOpeningHours?.openNow;

  return (
    <TouchableOpacity
      onPress={onCardPress}
      activeOpacity={0.7}
      style={[
        styles.row,
        {
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderBottomColor: isDark ? "#374151" : "#F3F4F6",
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: isDark ? "#374151" : "#F0F4FF" }]}>
        <Ionicons name="business-outline" size={18} color="#6366F1" />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text
          style={[styles.rowName, { color: isDark ? "#F9FAFB" : "#111827" }]}
          numberOfLines={1}
        >
          {museum.name}
        </Text>
        <View style={styles.rowMeta}>
          {formattedDistance && (
            <Text style={[styles.rowMetaText, { color: isDark ? "#9CA3AF" : "#9CA3AF" }]}>
              {formattedDistance}
            </Text>
          )}
          {formattedDistance && museum.vicinity && (
            <Text style={[styles.rowMetaText, { color: isDark ? "#6B7280" : "#D1D5DB" }]}>  ·  </Text>
          )}
          {(museum.vicinity || museum.formattedAddress) && (
            <Text
              style={[styles.rowMetaText, { color: isDark ? "#9CA3AF" : "#9CA3AF", flex: 1 }]}
              numberOfLines={1}
            >
              {museum.vicinity || museum.formattedAddress}
            </Text>
          )}
        </View>
      </View>

      {/* Status + chevron */}
      <View style={styles.rowRight}>
        {isOpen !== undefined && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOpen
                  ? isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)"
                  : isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: isOpen ? (isDark ? "#34D399" : "#059669") : (isDark ? "#F87171" : "#DC2626") },
              ]}
            >
              {isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? "#4B5563" : "#D1D5DB"}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  listContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 13,
    fontWeight: "600",
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowMetaText: {
    fontSize: 11,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
