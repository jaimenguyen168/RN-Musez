import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SettingsItem from "@/modules/profile/ui/components/SettingsItem";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";

const ProfileView = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const { setTheme, isDark } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const user = useQuery(api.function.users.getCurrentUser);

  const coverImageUrl =
    "https://images.unsplash.com/photo-1491156855053-9cdff72c7f85?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2428";

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

  const scrollThreshold = 50;

  const animatedPaddingTop = scrollY.interpolate({
    inputRange: [0, scrollThreshold],
    outputRange: [84, 42],
    extrapolate: "clamp",
  });

  const handleLogOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/users/edit");
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!user) {
    return null;
  }

  const EditButton = (
    <TouchableOpacity
      onPress={handleEditProfile}
      className="bg-surface rounded-full p-2"
    >
      <Ionicons
        name="pencil"
        size={20}
        color={isDark ? "#F3F4F6" : "#374151"}
      />
    </TouchableOpacity>
  );

  const HeaderTitle = (
    <View className="-mb-24">
      {/* Profile Card overlaid on header */}
      <View className="bg-card border-soft rounded-3xl p-6 border">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: user.imageUrl }}
              className="w-16 h-16 rounded-full mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-xl font-bold mb-1 text-main">
                {user.username}
              </Text>
              <Text className="text-secondary">{user.email}</Text>
            </View>

            {EditButton}
          </View>
        </View>

        {/* Tier and Points */}
        <View className="flex-row items-center justify-between rounded-2xl p-4 bg-primary-600/20 dark:bg-primary-600/30">
          <View className="flex-row items-center">
            <View className="bg-primary rounded-full p-2 mr-3">
              <Ionicons name="diamond" size={16} color="white" />
            </View>
            <Text className="text-lg font-semibold text-main">Tier Gold</Text>
          </View>
          <Text className="text-xl font-bold text-primary">500 Points</Text>
        </View>
      </View>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-6 py-4 bg-card">
      <Text className="text-base font-light tracking-wider text-secondary">
        {title}
      </Text>
    </View>
  );

  const Divider = () => <View className="h-px mx-10 bg-divider" />;

  return (
    <ParallaxScrollView
      headerImage={coverImageUrl}
      headerTitle={HeaderTitle}
      animatedTitle={user.username}
      rightControl={EditButton}
      scrollThreshold={120}
      backgroundColor={isDark ? "#111827" : "white"}
      showStatusBar={true}
      statusBarStyle="light"
      blurType="dark"
      headerHeight={280}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Animated.View
        className="flex-1 gap-4 bg-app"
        style={{
          paddingTop: animatedPaddingTop,
        }}
      >
        {/* Settings Sections */}
        <View className="mx-4 rounded-3xl overflow-hidden">
          <SectionHeader title="General" />

          <SettingsItem
            icon="globe-outline"
            title="Language"
            onPress={() => {}}
          />

          <SettingsItem
            icon="moon-outline"
            title="Dark Mode"
            showArrow={false}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{
                  false: isDark ? "#374151" : "#E5E7EB",
                  true: "#10B981",
                }}
                thumbColor="#ffffff"
                ios_backgroundColor={isDark ? "#374151" : "#E5E7EB"}
              />
            }
          />
        </View>

        <Divider />

        <View className="mx-4 mb-6 rounded-3xl overflow-hidden">
          <SectionHeader title="Preferences" />

          <SettingsItem
            icon="shield-checkmark-outline"
            title="Legal & Policies"
            onPress={() => {}}
          />

          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => {}}
          />

          <TouchableOpacity
            onPress={handleLogOut}
            className="flex-row items-center justify-between py-4 px-6 bg-card"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons
                name="log-out-outline"
                size={24}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className="ml-4 text-base font-medium text-main">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ParallaxScrollView>
  );
};

export default ProfileView;
