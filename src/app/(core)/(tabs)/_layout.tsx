import React from "react";
import { NativeTabs, Label, Icon } from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/colors";
import { RevenueCatProvider } from "@/provider/RevenueCatProvider";
import { PaywallProvider } from "@/provider/PaywallProvider";

export default function TabsLayout() {
  return (
    <RevenueCatProvider>
      <PaywallProvider>
      <NativeTabs
        blurEffect="prominent"
        tintColor={Colors.Primary}
        minimizeBehavior="onScrollDown"
      >
        <NativeTabs.Trigger name="discovery">
          <Label>Discovery</Label>
          <Icon
            sf={{ default: "safari", selected: "safari.fill" }}
            drawable="compass_drawable"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="snap">
          <Label>Snap</Label>
          <Icon
            sf={{
              default: "camera.viewfinder",
              selected: "camera.circle",
            }}
            drawable="camera_drawable"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="favorite">
          <Label>Favorite</Label>
          <Icon
            sf={{ default: "heart", selected: "heart.fill" }}
            drawable="star_drawable"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Label>Profile</Label>
          <Icon
            sf={{ default: "person", selected: "person.fill" }}
            drawable="person_drawable"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
      </PaywallProvider>
    </RevenueCatProvider>
  );
}
