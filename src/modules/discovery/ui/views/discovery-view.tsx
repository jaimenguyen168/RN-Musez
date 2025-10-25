import { FlatList, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import DiscoveryHeader from "@/modules/discovery/ui/components/DiscoveryHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const DiscoveryView = () => {
  const router = useRouter();

  const handleLocationPress = () => {
    router.push("/discovery/map");
  };

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        data={[1]}
        renderItem={() => <View />}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={() => (
          <DiscoveryHeader
            place="Philadelphia, USA"
            onLocationPress={handleLocationPress}
            onChatPress={() => {}}
            onBellPress={() => {}}
          />
        )}
      />
    </SafeAreaView>
  );
};
export default DiscoveryView;
