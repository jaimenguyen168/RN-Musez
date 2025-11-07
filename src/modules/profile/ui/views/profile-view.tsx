import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SettingsItem from "@/modules/profile/ui/components/SettingsItem";

const ProfileView = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const user: { name: string; email: string } = {
    name: "John Doe",
    email: "johndoe@gmail.com",
  };

  const coverImageUrl =
    "https://images.unsplash.com/photo-1491156855053-9cdff72c7f85?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2428";
  const avatarUrl =
    "https://images.unsplash.com/photo-1491156855053-9cdff72c7f85?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=400";

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

  const EditButton = (
    <TouchableOpacity className="bg-white/80 rounded-full p-2">
      <Ionicons name="pencil" size={20} color="#374151" />
    </TouchableOpacity>
  );

  const HeaderTitle = (
    <View className="-mb-24">
      {/* Profile Card overlaid on header */}
      <View className="bg-white rounded-3xl p-6 border border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: avatarUrl }}
              className="w-16 h-16 rounded-full mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {user.name}
              </Text>
              <Text className="text-gray-600">{user.email}</Text>
            </View>

            {EditButton}
          </View>
        </View>

        {/* Tier and Points */}
        <View className="flex-row items-center justify-between bg-primary-600/20 rounded-2xl p-4">
          <View className="flex-row items-center">
            <View className="bg-primary rounded-full p-2 mr-3">
              <Ionicons name="diamond" size={16} color="white" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              Tier Gold
            </Text>
          </View>
          <Text className="text-xl font-bold text-primary">500 Points</Text>
        </View>
      </View>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-6 py-4 bg-gray-50">
      <Text className="text-base font-light text-gray-600 tracking-wider">
        {title}
      </Text>
    </View>
  );

  const Divider = () => <View className="h-px bg-gray-200 mx-10" />;

  return (
    <ParallaxScrollView
      headerImage={coverImageUrl}
      headerTitle={HeaderTitle}
      animatedTitle={user.name}
      rightControl={EditButton}
      scrollThreshold={120}
      backgroundColor="white"
      showStatusBar={true}
      statusBarStyle="light-content"
      blurIntensity={20}
      blurType="light"
      headerHeight={280}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Animated.View
        className="bg-gray-50 flex-1 gap-4"
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
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                thumbColor={isDarkMode ? "#ffffff" : "#ffffff"}
                ios_backgroundColor="#E5E7EB"
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
            onPress={() => {}}
            className="flex-row items-center justify-between py-4 px-6"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="log-out-outline" size={24} color="#6B7280" />
              <Text className="ml-4 text-base font-medium text-gray-900">
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
