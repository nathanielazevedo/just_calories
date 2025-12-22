import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  DataTable,
  Divider,
  ProgressBar,
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
        <View style={styles.emptyIcon}>
          <Text style={{ fontSize: 64 }}>📊</Text>
        </View>
        <Text variant="displaySmall" style={styles.title}>
          Just Calories
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Track your weight journey with daily calorie management
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/user-info")}
          style={styles.setupButton}
          contentStyle={{ paddingVertical: 8 }}
        >
          Set Up Profile
        </Button>
      </View>
    );
  }

  const bmr = calculateBMR(userData);
  const netCalories = calculateNetCalories(userData);
  const totalBurned = bmr + userData.caloriesBurnedExercise;
  const weightDiff = userData.weight - userData.goalWeight;
  const progress = Math.max(
    0,
    Math.min(
      1,
      1 -
        weightDiff /
          Math.abs(userData.weight - (userData.goalWeight || userData.weight))
    )
  );

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Goal Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <View>
                <Text variant="labelMedium" style={styles.progressLabel}>
                  Current Weight
                </Text>
                <Text variant="headlineMedium" style={styles.currentWeight}>
                  {userData.weight} lbs
                </Text>
              </View>
              <View style={styles.goalContainer}>
                <Text variant="labelMedium" style={styles.progressLabel}>
                  Goal
                </Text>
                <Text variant="titleLarge" style={styles.goalWeight}>
                  {userData.goalWeight} lbs
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={progress}
                color="#10A37F"
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.progressText}>
                {weightDiff > 0
                  ? `${weightDiff.toFixed(1)} lbs to go`
                  : "Goal reached! 🎉"}
              </Text>
            </View>
          </Card.Content>
        </Card>
        {/* Daily Burn */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                🔥 Daily Burn
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  BMR (Resting)
                </Text>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {bmr}
                </Text>
                <Text variant="bodySmall" style={styles.statUnit}>
                  cal/day
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  Exercise
                </Text>
                <Text variant="headlineSmall" style={styles.statValue}>
                  {userData.caloriesBurnedExercise}
                </Text>
                <Text variant="bodySmall" style={styles.statUnit}>
                  cal/day
                </Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <View style={styles.totalItem}>
                <Text variant="labelMedium" style={styles.totalLabel}>
                  Total Burned
                </Text>
                <Text variant="titleLarge" style={styles.totalValue}>
                  {totalBurned} cal
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text variant="labelMedium" style={styles.totalLabel}>
                  Net Calories
                </Text>
                <Text
                  variant="titleLarge"
                  style={[
                    styles.totalValue,
                    { color: netCalories > 0 ? "#EF4444" : "#10A37F" },
                  ]}
                >
                  {netCalories > 0 ? "+" : ""}
                  {netCalories}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Weekly Projections */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                📈 Weekly Projections
              </Text>
            </View>
            <Divider style={styles.divider} />
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
                    style={styles.tableRow}
                  >
                    <DataTable.Cell>
                      <View>
                        <Text variant="bodyMedium" style={styles.weekText}>
                          Week {proj.week}
                        </Text>
                        <Text variant="bodySmall" style={styles.dateRange}>
                          {startStr} - {endStr}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodyMedium">{proj.startWeight}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodyMedium">{proj.endWeight}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      {actualWeight !== null && actualWeight !== undefined ? (
                        <Text
                          variant="bodyMedium"
                          style={{
                            color:
                              actualWeight > proj.endWeight
                                ? "#EF4444"
                                : actualWeight < proj.endWeight
                                ? "#10A37F"
                                : "#ECECEC",
                            fontWeight: "600",
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
                        variant="bodyMedium"
                        style={{
                          color:
                            change > 0
                              ? "#EF4444"
                              : change < 0
                              ? "#10A37F"
                              : "#666",
                          fontWeight: "500",
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
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#212121",
  },
  emptyIcon: {
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    color: "#999",
    marginBottom: 32,
    lineHeight: 24,
  },
  setupButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  progressCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#2F2F2F",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  progressLabel: {
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  currentWeight: {
    fontWeight: "bold",
    color: "#ECECEC",
  },
  goalContainer: {
    alignItems: "flex-end",
  },
  goalWeight: {
    color: "#10A37F",
    fontWeight: "600",
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3E3E3E",
  },
  progressText: {
    marginTop: 8,
    color: "#999",
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#2F2F2F",
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "600",
  },
  divider: {
    marginVertical: 16,
    backgroundColor: "#3E3E3E",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: "#999",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontWeight: "bold",
    color: "#ECECEC",
  },
  statUnit: {
    color: "#666",
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  totalItem: {
    alignItems: "center",
    flex: 1,
  },
  totalLabel: {
    color: "#999",
    marginBottom: 8,
  },
  totalValue: {
    fontWeight: "bold",
  },
  tableRow: {
    minHeight: 64,
  },
  weekText: {
    fontWeight: "500",
  },
  dateRange: {
    color: "#999",
    marginTop: 2,
  },
});
