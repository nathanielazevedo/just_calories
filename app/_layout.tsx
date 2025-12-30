import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IconButton, MD3DarkTheme, PaperProvider } from "react-native-paper";
import { Colors } from "../constants/colors";

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    secondary: "#7FA045",
    background: Colors.background,
    surface: Colors.cardBackground,
    surfaceVariant: Colors.border,
    error: Colors.error,
    onBackground: Colors.textPrimary,
    onSurface: Colors.textPrimary,
    outline: Colors.border,
    elevation: {
      level0: "transparent",
      level1: Colors.cardBackground,
      level2: Colors.cardItemBackground,
      level3: Colors.border,
      level4: Colors.border,
      level5: Colors.border,
    },
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={darkTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#4A6B2E",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          headerShadowVisible: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Ledger",
            headerShown: true,
            headerRight: () => <HeaderRight />,
          }}
        />
        <Stack.Screen
          name="user-info"
          options={{
            title: "Settings",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="week-detail"
          options={{
            title: "Week Details",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            title: "About & Privacy",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </PaperProvider>
  );
}

function HeaderRight() {
  const router = useRouter();
  return (
    <IconButton
      icon="account-cog"
      size={24}
      onPress={() => router.push("/user-info")}
      style={{ margin: 0 }}
    />
  );
}
