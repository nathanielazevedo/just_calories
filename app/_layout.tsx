import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IconButton, MD3DarkTheme, PaperProvider } from "react-native-paper";

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#10A37F",
    secondary: "#19C37D",
    background: "#212121",
    surface: "#2F2F2F",
    surfaceVariant: "#3E3E3E",
    error: "#EF4444",
    onBackground: "#ECECEC",
    onSurface: "#ECECEC",
    outline: "#4D4D4D",
    elevation: {
      level0: "transparent",
      level1: "#2F2F2F",
      level2: "#363636",
      level3: "#3D3D3D",
      level4: "#444444",
      level5: "#4B4B4B",
    },
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={darkTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2F2F2F",
          },
          headerTintColor: "#ECECEC",
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
            title: "Just Calories",
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
    />
  );
}
