import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";

const SubscriptionsView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [subscribing, setSubscribing] = useState(false);

  // Mock current plan - replace with your actual subscription logic
  const currentPlan = { id: "free", name: "Free", price: 0 };
  const isProUser = false; // Replace with actual pro check

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      interval: "month",
      features: [
        "🏛️ Museum Discovery",
        "📍 Location-Based Search",
        "🤖 AI Artwork Analysis (Limited)",
        "🎨 Personal Art Collection",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 14.99,
      interval: "month",
      yearlyPrice: 11.99,
      popular: true,
      trialDays: 7,
      features: [
        "🎨 Personal Art Collection",
        "🏛️ Museum Discovery",
        "📍 Location-Based Search",
        "🤖 AI Artwork Analysis (Unlimited)",
        "🆘 24/7 Priority Support",
      ],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      Alert.alert("Free Plan", "You are already on the free plan!");
      return;
    }

    setSubscribing(true);
    try {
      // Here you would integrate with your payment system
      Alert.alert(
        "Coming Soon",
        "Payment integration will be available soon!",
        [{ text: "OK" }],
      );
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const formatPrice = (price: number, interval: string) => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}/${interval}`;
  };

  const PlanCard = ({ plan }: { plan: any }) => {
    const isCurrentPlan = currentPlan.id === plan.id;

    return (
      <View
        className={`p-6 rounded-3xl mb-4 border-2 ${
          isCurrentPlan ? "border-soft bg-card" : "border-soft bg-card"
        }`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                className={`text-2xl font-bold ${
                  isCurrentPlan ? "text-secondary" : "text-main"
                }`}
              >
                {plan.name}
              </Text>
              {plan.popular && (
                <View className="bg-primary px-2 py-1 rounded-full ml-2">
                  <Text className="text-white text-xs font-semibold">
                    POPULAR
                  </Text>
                </View>
              )}
            </View>
            <Text
              className={`text-3xl font-black mt-1 ${
                isCurrentPlan ? "text-secondary" : "text-main"
              }`}
            >
              {formatPrice(plan.price, plan.interval)}
            </Text>
            {plan.yearlyPrice && (
              <Text className="text-primary font-medium text-sm">
                ${plan.yearlyPrice}/mo when billed annually
              </Text>
            )}
            {plan.trialDays && plan.id !== "free" && (
              <Text className="text-secondary font-medium text-sm">
                {plan.trialDays}-day free trial
              </Text>
            )}
          </View>

          {isCurrentPlan && (
            <View className="bg-surface px-3 py-1 rounded-full">
              <Text className="text-secondary font-semibold text-sm">
                Current
              </Text>
            </View>
          )}
        </View>

        <View className="space-y-3 mb-4">
          {plan.features.map((feature: string, index: number) => (
            <View key={index} className="flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={isCurrentPlan ? "#9ca3af" : "#FF9900"}
              />
              <Text className="text-secondary ml-3 flex-1 text-sm">
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {!isCurrentPlan && (
          <TouchableOpacity
            className={`py-4 rounded-2xl ${
              subscribing ? "bg-surface" : "bg-primary"
            }`}
            onPress={() => handleSubscribe(plan.id)}
            disabled={subscribing}
          >
            {subscribing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center font-semibold text-lg text-white">
                {plan.trialDays
                  ? `Start ${plan.trialDays}-Day Trial`
                  : "Select Plan"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-app">
      <BlurNavigationHeader
        title="Subscription"
        leftComponent={<BackButton onPress={() => router.back()} />}
        blurType={isDark ? "dark" : "light"}
        statusBarStyle={isDark ? "light" : "dark"}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 32 }}
      >
        {/* Current Plan Overview */}
        <View className="px-4 mb-6">
          <Text className="text-2xl font-bold text-main mb-4">
            Current Plan
          </Text>
          <View className="bg-card rounded-2xl p-4 border border-soft">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-semibold text-main">
                  {currentPlan.name}
                </Text>
                <Text className="text-secondary">
                  {formatPrice(currentPlan.price, "month")}
                </Text>
              </View>
              <View className="bg-primary/10 rounded-lg px-3 py-1">
                <Text className="text-primary font-semibold">
                  {isProUser ? "PRO" : "FREE"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Plans Section */}
        <View className="px-4 mb-6">
          <Text className="text-2xl font-bold text-main mb-2">
            Choose Your Plan
          </Text>
          <Text className="text-secondary mb-6">
            Unlock the full potential of artwork discovery
          </Text>

          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        {/* Footer */}
        <View className="px-4">
          <View className="flex-row items-center justify-center">
            <Ionicons name="lock-closed" size={16} className="text-secondary" />
            <Text className="text-secondary text-sm ml-2">
              Secure payments powered by Clerk
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubscriptionsView;
