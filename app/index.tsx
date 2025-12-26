import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { Colors } from "../constants/colors";
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
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Update current time every second for live calorie progress
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [loadSavedData])
  );

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1000ms = 1 second

    return () => clearInterval(interval);
  }, []);

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
  const poundsPerDay = netCalories / 3500; // Positive net = weight gain, Negative net = weight loss
  const daysPerPound = poundsPerDay !== 0 ? 1 / Math.abs(poundsPerDay) : 0; // Days needed to lose/gain 1 pound
  const weightDiff = userData.weight - userData.goalWeight;

  // Calculate progress, handling edge cases
  const totalWeightToLose = Math.abs(
    userData.weight - (userData.goalWeight || userData.weight)
  );
  const progress =
    totalWeightToLose > 0
      ? Math.max(0, Math.min(1, 1 - weightDiff / totalWeightToLose))
      : 0;

  // Calculate total calories to lose and calories burned so far
  const totalCaloriesToLose = weightDiff * 3500;
  const startDate = new Date(userData.startDate);
  const millisSinceStart = Math.max(
    0,
    currentTime.getTime() - startDate.getTime()
  );
  const daysSinceStart = millisSinceStart / (1000 * 60 * 60 * 24);
  const caloriesBurnedSoFar = Math.abs(netCalories) * daysSinceStart;
  const calorieProgress =
    totalCaloriesToLose > 0
      ? Math.max(0, Math.min(1, caloriesBurnedSoFar / totalCaloriesToLose))
      : 0;

  // Calculate expected end date
  const expectedEndDate =
    projections.length > 0
      ? new Date(projections[projections.length - 1].date)
      : null;
  const endDateStr = expectedEndDate
    ? expectedEndDate.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Determine current week
  const today = currentTime.toISOString().split("T")[0];
  const currentWeek = projections.find((proj) => {
    const weekRange = getWeekDateRange(userData, proj.week);
    return today >= weekRange.startDate && today <= weekRange.endDate;
  })?.week;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Overview */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.progressLabel}>
              Overview
            </Text>
            <Divider style={styles.overviewDivider} />

            <View style={styles.weightCardsRow}>
              <View style={styles.weightCard}>
                <Text variant="bodySmall" style={styles.weightCardLabel}>
                  Starting Weight
                </Text>
                <Text variant="headlineMedium" style={styles.weightCardValue}>
                  {userData.weight}
                </Text>
                <Text variant="bodySmall" style={styles.weightCardUnit}>
                  lbs
                </Text>
              </View>
              <View style={styles.weightCard}>
                <Text variant="bodySmall" style={styles.weightCardLabel}>
                  Goal Weight
                </Text>
                <Text variant="headlineMedium" style={styles.goalWeightValue}>
                  {userData.goalWeight}
                </Text>
                <Text variant="bodySmall" style={styles.weightCardUnit}>
                  lbs
                </Text>
              </View>
            </View>

            {endDateStr && weightDiff > 0 && (
              <View style={styles.goalInfoContainer}>
                <View style={styles.circularProgressRow}>
                  <View style={styles.circularProgressItem}>
                    <AnimatedCircularProgress
                      size={120}
                      width={12}
                      fill={progress * 100}
                      tintColor="#6B8E23"
                      backgroundColor="#C4B5A0"
                      rotation={0}
                      lineCap="round"
                    >
                      {(fill) => (
                        <View style={styles.circularProgressCenter}>
                          <Text
                            variant="headlineSmall"
                            style={styles.circularProgressText}
                          >
                            {fill.toFixed(0)}%
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={styles.circularProgressSubtext}
                          >
                            Weight
                          </Text>
                        </View>
                      )}
                    </AnimatedCircularProgress>
                    <Text variant="bodySmall" style={styles.progressText}>
                      {weightDiff.toFixed(1)} lbs to go
                    </Text>
                  </View>

                  <View style={styles.circularProgressItem}>
                    <AnimatedCircularProgress
                      size={120}
                      width={12}
                      fill={calorieProgress * 100}
                      tintColor="#6B8E23"
                      backgroundColor="#C4B5A0"
                      rotation={0}
                      lineCap="round"
                    >
                      {(fill) => (
                        <View style={styles.circularProgressCenter}>
                          <Text
                            variant="headlineSmall"
                            style={styles.circularProgressText}
                          >
                            {fill.toFixed(2)}%
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={styles.circularProgressSubtext}
                          >
                            Calories
                          </Text>
                        </View>
                      )}
                    </AnimatedCircularProgress>
                    <Text variant="bodySmall" style={styles.progressText}>
                      {caloriesBurnedSoFar.toFixed(2)} burned
                    </Text>
                  </View>
                </View>

                <View style={styles.statsCardsRow}>
                  <View style={styles.statCard}>
                    <Text variant="bodySmall" style={styles.statCardLabel}>
                      Expected Loss
                    </Text>
                    <Text variant="titleLarge" style={styles.statCardValue}>
                      {weightDiff.toFixed(1)}
                    </Text>
                    <Text variant="bodySmall" style={styles.statCardUnit}>
                      lbs
                    </Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text variant="bodySmall" style={styles.statCardLabel}>
                      Total Calories
                    </Text>
                    <Text variant="titleLarge" style={styles.statCardValue}>
                      {(weightDiff * 3500).toFixed(0)}
                    </Text>
                    <Text variant="bodySmall" style={styles.statCardUnit}>
                      cal
                    </Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text variant="bodySmall" style={styles.statCardLabel}>
                      Expected Date
                    </Text>
                    <Text variant="titleMedium" style={styles.statCardValue}>
                      {endDateStr}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
        {/* Burn Rates */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.progressLabel}>
              Burn Rates
            </Text>
            <View style={styles.dailyStatsGrid}>
              <View style={styles.dailyStatCard}>
                <Text variant="bodySmall" style={styles.dailyStatLabel}>
                  Intake
                </Text>
                <Text variant="headlineSmall" style={styles.dailyStatValue}>
                  {userData.caloriesEaten}
                </Text>
              </View>
              <View style={styles.dailyStatCard}>
                <Text variant="bodySmall" style={styles.dailyStatLabel}>
                  BMR
                </Text>
                <Text variant="headlineSmall" style={styles.dailyStatValue}>
                  {bmr}
                </Text>
              </View>
              <View style={styles.dailyStatCard}>
                <Text variant="bodySmall" style={styles.dailyStatLabel}>
                  Exercise
                </Text>
                <Text variant="headlineSmall" style={styles.dailyStatValue}>
                  {userData.caloriesBurnedExercise}
                </Text>
              </View>
              <View style={[styles.dailyStatCard, styles.netStatCard]}>
                <Text variant="bodySmall" style={styles.dailyStatLabel}>
                  Net
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.dailyStatValue,
                    { color: netCalories > 0 ? "#D4856B" : "#6B8E23" },
                  ]}
                >
                  {netCalories > 0 ? "+" : ""}
                  {netCalories}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <Text variant="labelMedium" style={styles.sectionHeader}>
              Weight Change
            </Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  Per Day
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.metricValue,
                    {
                      color:
                        poundsPerDay < 0
                          ? Colors.success
                          : poundsPerDay > 0
                          ? Colors.warning
                          : Colors.textTertiary,
                    },
                  ]}
                >
                  {poundsPerDay < 0 ? "-" : "+"}
                  {Math.abs(poundsPerDay).toFixed(3)}
                </Text>
                <Text variant="bodySmall" style={styles.metricUnit}>
                  lbs
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  Per Week
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.metricValue,
                    {
                      color:
                        poundsPerDay < 0
                          ? Colors.success
                          : poundsPerDay > 0
                          ? Colors.warning
                          : Colors.textTertiary,
                    },
                  ]}
                >
                  {poundsPerDay < 0 ? "-" : "+"}
                  {Math.abs(poundsPerDay * 7).toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={styles.metricUnit}>
                  lbs
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  Per Month
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.metricValue,
                    {
                      color:
                        poundsPerDay < 0
                          ? Colors.success
                          : poundsPerDay > 0
                          ? Colors.warning
                          : Colors.textTertiary,
                    },
                  ]}
                >
                  {poundsPerDay < 0 ? "-" : "+"}
                  {Math.abs(poundsPerDay * 30).toFixed(1)}
                </Text>
                <Text variant="bodySmall" style={styles.metricUnit}>
                  lbs
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <Text variant="labelMedium" style={styles.sectionHeader}>
              Calorie Burn Rate
            </Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  Per Hour
                </Text>
                <Text variant="headlineSmall" style={styles.metricValue}>
                  {(Math.abs(netCalories) / 24).toFixed(1)}
                </Text>
                <Text variant="bodySmall" style={styles.metricUnit}>
                  cal
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  Per Day
                </Text>
                <Text variant="headlineSmall" style={styles.metricValue}>
                  {Math.abs(netCalories).toFixed(0)}
                </Text>
                <Text variant="bodySmall" style={styles.metricUnit}>
                  cal
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  Per Week
                </Text>
                <Text variant="headlineSmall" style={styles.metricValue}>
                  {(Math.abs(netCalories) * 7).toFixed(0)}
                </Text>
                <Text variant="bodySmall" style={styles.metricUnit}>
                  cal
                </Text>
              </View>
            </View>

            {poundsPerDay < 0 && (
              <>
                <Divider style={styles.divider} />
                <Text variant="labelMedium" style={styles.sectionHeader}>
                  Time to Lose
                </Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Text variant="bodySmall" style={styles.metricLabel}>
                      1 Pound
                    </Text>
                    <Text variant="headlineSmall" style={styles.metricValue}>
                      {daysPerPound.toFixed(1)}
                    </Text>
                    <Text variant="bodySmall" style={styles.metricUnit}>
                      days
                    </Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text variant="bodySmall" style={styles.metricLabel}>
                      3 Pounds
                    </Text>
                    <Text variant="headlineSmall" style={styles.metricValue}>
                      {(daysPerPound * 3).toFixed(1)}
                    </Text>
                    <Text variant="bodySmall" style={styles.metricUnit}>
                      days
                    </Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text variant="bodySmall" style={styles.metricLabel}>
                      5 Pounds
                    </Text>
                    <Text variant="headlineSmall" style={styles.metricValue}>
                      {(daysPerPound * 5).toFixed(1)}
                    </Text>
                    <Text variant="bodySmall" style={styles.metricUnit}>
                      days
                    </Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text variant="bodySmall" style={styles.metricLabel}>
                      10 Pounds
                    </Text>
                    <Text variant="headlineSmall" style={styles.metricValue}>
                      {(daysPerPound * 10).toFixed(0)}
                    </Text>
                    <Text variant="bodySmall" style={styles.metricUnit}>
                      days
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Weekly Projections */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.progressLabel}>
              Weekly Projections
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.timeline}>
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

                const isOnTrack =
                  actualWeight !== null && actualWeight !== undefined
                    ? actualWeight <= proj.endWeight
                    : null;

                const isCurrentWeek = proj.week === currentWeek;

                return (
                  <TouchableRipple
                    key={proj.week}
                    onPress={() => handleWeekClick(proj.week)}
                    style={[
                      styles.timelineItem,
                      isCurrentWeek && styles.currentWeekItem,
                    ]}
                  >
                    <View style={styles.timelineContent}>
                      {/* Week content */}
                      <View style={styles.timelineBody}>
                        <View style={styles.timelineHeader}>
                          <View>
                            <Text
                              variant="titleMedium"
                              style={styles.weekTitle}
                            >
                              Week {proj.week}
                            </Text>
                            <Text variant="bodySmall" style={styles.weekDate}>
                              {startStr} - {endStr}
                            </Text>
                          </View>
                          <View style={styles.timelineWeights}>
                            <Text
                              variant="bodySmall"
                              style={styles.weightLabel}
                            >
                              Target
                            </Text>
                            <Text
                              variant="titleMedium"
                              style={styles.weightValue}
                            >
                              {proj.endWeight} lbs
                            </Text>
                          </View>
                        </View>

                        <View style={styles.timelineStats}>
                          <View style={styles.timelineStat}>
                            <Text variant="bodySmall" style={styles.statLabel}>
                              Actual
                            </Text>
                            {actualWeight !== null &&
                            actualWeight !== undefined ? (
                              <Text
                                variant="titleSmall"
                                style={[
                                  styles.timelineStatValue,
                                  {
                                    color:
                                      actualWeight > proj.endWeight
                                        ? Colors.warning
                                        : actualWeight < proj.endWeight
                                        ? Colors.success
                                        : Colors.textPrimary,
                                  },
                                ]}
                              >
                                {actualWeight.toFixed(1)} lbs
                              </Text>
                            ) : (
                              <Text variant="bodyMedium" style={styles.noData}>
                                No data
                              </Text>
                            )}
                          </View>

                          <View style={styles.timelineStat}>
                            <Text variant="bodySmall" style={styles.statLabel}>
                              Total Change
                            </Text>
                            <Text
                              variant="titleSmall"
                              style={[
                                styles.timelineStatValue,
                                {
                                  color:
                                    change > 0
                                      ? Colors.warning
                                      : change < 0
                                      ? Colors.success
                                      : Colors.textTertiary,
                                },
                              ]}
                            >
                              {change > 0 ? "+" : ""}
                              {change.toFixed(1)} lbs
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableRipple>
                );
              })}
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
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
    color: Colors.textSecondary,
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
    backgroundColor: Colors.cardBackground,
  },
  overviewDivider: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: Colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  progressLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHeader: {
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "left",
  },
  currentWeight: {
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  goalContainer: {
    alignItems: "flex-end",
  },
  goalWeight: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  weightCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  weightCard: {
    flex: 1,
    backgroundColor: Colors.cardItemBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weightCardLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  weightCardValue: {
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  goalWeightValue: {
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  weightCardUnit: {
    color: Colors.textTertiary,
    marginTop: 4,
  },
  circularProgressContainer: {
    marginTop: 20,
    marginBottom: 8,
    alignItems: "center",
  },
  circularProgressCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgressText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
  circularProgressSubtext: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressText: {
    marginTop: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  circularProgressRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  circularProgressItem: {
    alignItems: "center",
    flex: 1,
  },
  goalInfoContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statsCardsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: Colors.cardItemBackground,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardLabel: {
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: "center",
    fontSize: 11,
  },
  statCardValue: {
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  statCardUnit: {
    color: Colors.textTertiary,
    marginTop: 2,
    fontSize: 11,
  },
  calorieProgressContainer: {
    marginTop: 16,
  },
  goalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalInfoItem: {
    alignItems: "center",
  },
  endDateLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 10,
    textAlign: "center",
  },
  endDateValue: {
    color: Colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
  calorieRateContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#3E3E3E",
  },
  calorieRateTitle: {
    color: "#999",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  calorieRateRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  calorieRateItem: {
    alignItems: "center",
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "600",
  },
  divider: {
    marginVertical: 16,
    backgroundColor: Colors.border,
  },
  dailyStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  dailyStatCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.cardItemBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  netStatCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  dailyStatLabel: {
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  dailyStatValue: {
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: Colors.cardItemBackground,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricLabel: {
    color: "#000000",
    marginBottom: 6,
    textAlign: "center",
    fontSize: 11,
  },
  metricValue: {
    fontWeight: "bold",
    color: "#6B8E23",
  },
  metricUnit: {
    color: "#666",
    marginTop: 2,
    fontSize: 11,
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
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  statUnit: {
    color: Colors.textTertiary,
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
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  totalValue: {
    fontWeight: "bold",
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentWeekItem: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  timelineContent: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.cardBackground,
  },
  timelineConnector: {
    alignItems: "center",
    marginRight: 16,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textTertiary,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  timelineDotSuccess: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  timelineDotWarning: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineBody: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  weekTitle: {
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  weekDate: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timelineWeights: {
    alignItems: "flex-end",
  },
  weightLabel: {
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  weightValue: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  timelineStats: {
    flexDirection: "row",
    gap: 24,
  },
  timelineStat: {
    flex: 1,
  },
  timelineStatValue: {
    fontWeight: "600",
    marginTop: 4,
  },
  noData: {
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
