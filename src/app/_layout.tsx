import React from "react";
import "../global.css";
import SetupLayout from "@/layouts/setup-layout";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export default function RootLayout() {
  const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
  });

  console.log("Convex URL:", process.env.EXPO_PUBLIC_CONVEX_URL);
  console.log("NODE_ENV:", process.env.NODE_ENV);

  return (
    <ConvexProvider client={convex}>
      <SetupLayout />
    </ConvexProvider>
  );
}
