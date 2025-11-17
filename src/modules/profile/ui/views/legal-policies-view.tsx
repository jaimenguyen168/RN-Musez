import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";

const LegalPoliciesView = () => {
  const router = useRouter();
  const { isDark } = useTheme();

  const SectionTitle = ({ children }: { children: string }) => (
    <Text className="text-lg font-bold text-main mb-3 mt-6">{children}</Text>
  );

  const SectionContent = ({ children }: { children: string }) => (
    <Text className="text-sm text-secondary leading-6 mb-4">{children}</Text>
  );

  const BulletPoint = ({ children }: { children: string }) => (
    <Text className="text-sm text-secondary leading-6 mb-2 ml-4">
      • {children}
    </Text>
  );

  return (
    <View className="flex-1 bg-app">
      <BlurNavigationHeader
        title="Legal & Policies"
        leftComponent={<BackButton onPress={() => router.back()} />}
        statusBarStyle={isDark ? "light" : "dark"}
        blurType={isDark ? "dark" : "light"}
      />

      <ScrollView className="flex-1 pt-32" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Introduction */}
          <Text className="text-base text-main font-medium mb-4">
            Last updated: November 16, 2025
          </Text>

          <SectionContent>
            By using Musez (&quot;the App&quot;), you agree to comply with the
            following terms and policies regarding content usage, copyright, and
            artificial intelligence features.
          </SectionContent>

          {/* Copyright Policy */}
          <SectionTitle>Copyright Policy</SectionTitle>
          <SectionContent>
            We respect intellectual property rights and expect our users to do
            the same. The following guidelines apply to all content within the
            App:
          </SectionContent>

          <BulletPoint>
            All artwork images analyzed by the App remain the property of their
            respective copyright holders.
          </BulletPoint>
          <BulletPoint>
            Users may only upload images they own or have proper permission to
            use.
          </BulletPoint>
          <BulletPoint>
            The App is intended for personal, educational, and non-commercial
            use unless explicitly stated otherwise.
          </BulletPoint>
          <BulletPoint>
            We do not claim ownership of any user-uploaded content or artwork
            images.
          </BulletPoint>

          {/* AI Usage Policy */}
          <SectionTitle>Artificial Intelligence Usage</SectionTitle>
          <SectionContent>
            Musez uses artificial intelligence to analyze and provide insights
            about artwork. Please understand the following about our AI
            features:
          </SectionContent>

          <BulletPoint>
            AI-generated analysis is for informational and educational purposes
            only.
          </BulletPoint>
          <BulletPoint>
            AI insights should not be considered professional art appraisals or
            expert opinions.
          </BulletPoint>
          <BulletPoint>
            The accuracy of AI-generated content may vary and should be verified
            through other sources.
          </BulletPoint>
          <BulletPoint>
            We continuously improve our AI models, and analysis results may
            change over time.
          </BulletPoint>

          {/* Data Usage */}
          <SectionTitle>Data Usage</SectionTitle>
          <SectionContent>
            When you use our AI features, the following data practices apply:
          </SectionContent>

          <BulletPoint>
            Uploaded images are processed temporarily for analysis and are not
            permanently stored by our AI providers.
          </BulletPoint>
          <BulletPoint>
            Analysis results may be saved locally on your device for your
            personal reference.
          </BulletPoint>
          <BulletPoint>
            We do not use your uploaded content to train our AI models without
            explicit consent.
          </BulletPoint>

          {/* User Responsibilities */}
          <SectionTitle>User Responsibilities</SectionTitle>
          <SectionContent>As a user of Musez, you agree to:</SectionContent>

          <BulletPoint>
            Only upload content you have the right to use and analyze.
          </BulletPoint>
          <BulletPoint>
            Use the App and its AI features responsibly and ethically.
          </BulletPoint>
          <BulletPoint>
            Not attempt to reverse-engineer or misuse our AI technology.
          </BulletPoint>
          <BulletPoint>
            Respect the intellectual property rights of artists and content
            creators.
          </BulletPoint>

          {/* Limitation of Liability */}
          <SectionTitle>Limitation of Liability</SectionTitle>
          <SectionContent>
            The App and its AI features are provided &quot;as is&quot; without
            warranties. We are not liable for:
          </SectionContent>

          <BulletPoint>
            Inaccuracies in AI-generated analysis or insights.
          </BulletPoint>
          <BulletPoint>
            Decisions made based on AI-provided information.
          </BulletPoint>
          <BulletPoint>
            Any copyright issues arising from user-uploaded content.
          </BulletPoint>

          {/* Contact Information */}
          <SectionTitle>Contact Us</SectionTitle>
          <SectionContent>
            If you have questions about these policies or need to report
            copyright concerns, please contact our support team through the Help
            & Support section in the app.
          </SectionContent>

          <View className="mb-8">
            <Text className="text-xs text-secondary text-center">
              These terms may be updated periodically. Continued use of the App
              constitutes acceptance of any changes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LegalPoliciesView;
