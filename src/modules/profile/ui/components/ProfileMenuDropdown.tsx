import React from "react";
import { ContextMenu, Host, Button } from "@expo/ui/swift-ui";
import { Image, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

interface ProfileMenuDropdownProps {
  imageSize?: number;
}

const ProfileMenuDropdown = ({ imageSize = 40 }: ProfileMenuDropdownProps) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useQuery(api.function.users.getCurrentUser);

  // Built-in menu options
  const profileMenuOptions = [
    {
      value: "profile",
      label: "Profile",
      systemImage: "person.circle" as const,
    },
    {
      value: "edit",
      label: "Edit Profile",
      systemImage: "pencil.circle" as const,
    },
    {
      value: "signout",
      label: "Sign Out",
      systemImage: "arrow.right.square" as const,
    },
  ];

  // Built-in action handler
  const handleProfileMenuAction = (action: string) => {
    switch (action) {
      case "profile":
        router.push("/profile");
        break;
      case "edit":
        router.push("/users/edit");
        break;
      case "signout":
        Alert.alert("Logout", "Are you sure you want to logout?", [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => signOut(),
          },
        ]);
        break;
    }
  };

  const handleOptionSelect = (option: (typeof profileMenuOptions)[0]) => {
    handleProfileMenuAction(option.value);
  };

  const triggerContent = (
    <TouchableOpacity activeOpacity={0.8}>
      <Image
        source={{ uri: user?.imageUrl }}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: imageSize / 2,
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <Host style={{ height: imageSize, width: imageSize }}>
      <ContextMenu>
        <ContextMenu.Items>
          {profileMenuOptions.map((option) => (
            <Button
              key={option.value}
              systemImage={option.systemImage || "circle"}
              onPress={() => handleOptionSelect(option)}
              variant="bordered"
            >
              {option.label}
            </Button>
          ))}
        </ContextMenu.Items>
        <ContextMenu.Trigger>{triggerContent}</ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
};

export default ProfileMenuDropdown;
