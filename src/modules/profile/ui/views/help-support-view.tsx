import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";
import { faqs } from "@/modules/profile/constants";
import FAQItem from "@/modules/profile/ui/components/FAQItem";

const HelpSupportView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Coming Soon",
      "Contact support will be available in a future update. Thank you for your patience!",
      [{ text: "OK", style: "default" }],
    );
  };

  return (
    <View className="flex-1 bg-app">
      <BlurNavigationHeader
        title="Help & Support"
        leftComponent={<BackButton onPress={() => router.back()} />}
        statusBarStyle={isDark ? "light" : "dark"}
        blurType={isDark ? "dark" : "light"}
      />

      <ScrollView className="flex-1 pt-32" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Header Section */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-600/20 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="support-agent" size={40} color={"#FF9900"} />
            </View>
            <Text className="text-2xl font-bold text-main mb-2 text-center">
              How can we help?
            </Text>
          </View>

          {/* FAQ Section */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-main mb-4">
              Frequently Asked Questions
            </Text>

            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
                isExpanded={expandedFAQ === index}
                onToggle={toggleFAQ}
              />
            ))}
          </View>

          {/* Contact Section */}
          <View className="bg-card rounded-3xl p-6 mb-6">
            <Text className="text-lg font-bold text-main mb-3">
              Still need help?
            </Text>
            <Text className="text-secondary text-sm leading-6 mb-4">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help you get the most out of Musez.
            </Text>

            <TouchableOpacity
              onPress={handleContactSupport}
              className="bg-primary rounded-2xl py-3 px-4 flex-row items-center justify-center"
            >
              <MaterialIcons name="email" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="items-center">
            <Text className="text-xs text-secondary">Musez v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpSupportView;
