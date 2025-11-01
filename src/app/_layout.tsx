import "../global.css";
import SetupLayout from "@/layouts/setup-layout";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export default function RootLayout() {
  const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
  });

  return (
    <ConvexProvider client={convex}>
      <SetupLayout />
    </ConvexProvider>
  );
}
