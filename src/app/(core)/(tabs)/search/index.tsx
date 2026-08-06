import React, { useRef, useState } from "react";
import { Stack } from "expo-router";
import type { SearchBarCommands } from "react-native-screens";
import { useOrganicTheme } from "@/constants/organicTheme";
import DiscoverySearchView from "@/modules/discovery/ui/views/discovery-search-view";

export default function SearchScreen() {
  const c = useOrganicTheme();
  const searchBarRef = useRef<SearchBarCommands>(null) as React.RefObject<SearchBarCommands>;
  const [query, setQuery] = useState("");

  // Used by recent/suggestion taps to skip typing — pushes text straight into the native bar.
  const runSearch = (term: string) => {
    searchBarRef.current?.setText(term);
    setQuery(term);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Search",
          // headerLargeTitle intentionally omitted: it collides with NativeTabs + ScrollView
          // and renders blank until an interaction forces relayout (expo/expo#40717, unresolved upstream).
          headerTitleStyle: { fontFamily: "Caprasimo_400Regular", color: c.text },
          headerStyle: { backgroundColor: c.bg },
          headerShadowVisible: false,
          headerTintColor: c.accent,
          headerSearchBarOptions: {
            ref: searchBarRef,
            placeholder: "Search museums near you",
            autoFocus: true,
            tintColor: c.accent,
            barTintColor: c.surfaceAlt,
            hideWhenScrolling: false,
            onChangeText: (e) => setQuery(e.nativeEvent.text),
          },
        }}
      />
      <DiscoverySearchView query={query} onRunSearch={runSearch} />
    </>
  );
}
