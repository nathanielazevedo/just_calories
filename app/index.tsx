import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  DataTable,
  Text,
} from "react-native-paper";
import { UserData, WeightProjection } from "./types";
import { getLastWeightForWeek } from "./utils/actual-weights";
import {
  calculateBMR,
  calculateNetCalories,
  getWeekDateRange,
  projectWeight,
} from "./utils/calculations";
import { loadUserData } from "./utils/storage";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projections, setProjections] = useState<WeightProjection[]>([]);
  const [actualWeights, setActualWeights] = useState<
    Record<number, number | null>
  >({});

  const loadSavedData = useCallback(async () => {
    const saved = await loadUserData();
    if (saved) {
      setUserData(saved);
      const projs = projectWeight(saved);
      setProjections(projs);

      // Load actual weights for each week
      const actuals: Record<number, number | null> = {};
      for (const proj of projs) {
        const { startDate, endDate } = getWeekDateRange(saved, proj.week);
        const lastWeight = await getLastWeightForWeek(startDate, endDate);
        actuals[proj.week] = lastWeight;
      }
      setActualWeights(actuals);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [loadSavedData])
  );

  const handleWeekClick = (weekNumber: number) => {
    router.push(`/week-detail?week=${weekNumber}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="displayMedium" style={styles.title}>
          Just Calories
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Get started by setting up your info
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/user-info")}
          style={styles.button}
        >
          Set Up Profile
        </Button>
      </View>
    );
  }

  const bmr = calculateBMR(userData);
  const netCalories = calculateNetCalories(userData);
  const totalBurned = bmr + userData.caloriesBurnedExercise;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Your Daily Burn" titleVariant="titleLarge" />
          <Card.Content>
            <DataTable>
              <DataTable.Row>
                <DataTable.Cell>BMR (Resting)</DataTable.Cell>
                <DataTable.Cell numeric>{bmr} cal</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Exercise</DataTable.Cell>
                <DataTable.Cell numeric>
                  {userData.caloriesBurnedExercise} cal
                </DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Total Burned</DataTable.Cell>
                <DataTable.Cell numeric>{totalBurned} cal</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Net Calories</DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text
                    style={{ color: netCalories > 0 ? "#e74c3c" : "#27ae60" }}
                  >
                    {netCalories > 0 ? "+" : ""}
                    {netCalories} cal
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Weekly Projections" titleVariant="titleLarge" />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Week</DataTable.Title>
                <DataTable.Title numeric>Start</DataTable.Title>
                <DataTable.Title numeric>End</DataTable.Title>
                <DataTable.Title numeric>Actual</DataTable.Title>
                <DataTable.Title numeric>Change</DataTable.Title>
              </DataTable.Header>
              {projections.map((proj, index) => {
                const change = proj.endWeight - projections[0].startWeight;
                const actualWeight = actualWeights[proj.week];

                // Get week date range for display
                const weekRange = userData
                  ? getWeekDateRange(userData, proj.week)
                  : null;
                const startDate = weekRange
                  ? new Date(weekRange.startDate)
                  : new Date(proj.date);
                const endDate = weekRange
                  ? new Date(weekRange.endDate)
                  : new Date(proj.date);

                const startStr = startDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const endStr = endDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <DataTable.Row
                    key={proj.week}
                    onPress={() => handleWeekClick(proj.week)}
                  >
                    <DataTable.Cell>
                      <View>
                        <Text>Week {proj.week}</Text>
                        <Text variant="bodySmall" style={{ color: "#888" }}>
                          {startStr} - {endStr}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{proj.startWeight}</DataTable.Cell>
                    <DataTable.Cell numeric>{proj.endWeight}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      {actualWeight !== null && actualWeight !== undefined ? (
                        <Text
                          style={{
                            color:
                              actualWeight > proj.endWeight
                                ? "#e74c3c"
                                : actualWeight < proj.endWeight
                                ? "#27ae60"
                                : "#ECECEC",
                          }}
                        >
                          {actualWeight.toFixed(1)}
                        </Text>
                      ) : (
                        <Text style={{ color: "#666" }}>-</Text>
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text
                        style={{
                          color:
                            change > 0
                              ? "#e74c3c"
                              : change < 0
                              ? "#27ae60"
                              : "#666",
                        }}
                      >
                        {change > 0 ? "+" : ""}
                        {change.toFixed(1)} lbs
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
            </DataTable>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#212121",
  },
  container: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#212121",
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
