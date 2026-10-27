// app/_layout.tsx

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ThemeProvider } from "../contexts/theme-context";
import { useAppTheme } from "../contexts/theme-context";

function ThemedStatusBar() {
  const { tema, colors } = useAppTheme();
  useEffect(() => {
    if (Platform.OS === "android") void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  return <StatusBar style={tema === "dark" ? "light" : "dark"} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
    <ThemedStatusBar />
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="detail/[kota]"
        options={{ title: "Detail Cuaca" }}
      />

      <Stack.Screen
        name="tambah-favorit"
        options={{
          presentation: "modal",
          title: "Tambah Favorit",
        }}
      />
    </Stack>
    </ThemeProvider>
  );
}
