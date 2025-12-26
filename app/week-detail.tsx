import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Card,
  Checkbox,
  Divider,
  IconButton,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import { Colors } from "../constants/colors";
import { ActualWeight, DailyWeightProjection, UserData } from "./types";
import { loadActualWeights, saveActualWeight } from "./utils/actual-weights";
import { projectWeekDaily } from "./utils/calculations";
import { loadUserData } from "./utils/storage";

export default function WeekDetailScreen() {
  const { week } = useLocalSearchParams<{ week: string }>();
  const weekNumber = parseInt(week || "0");
  const [dailyProjections, setDailyProjections] = useState<
    DailyWeightProjection[]
  >([]);
  const [actualData, setActualData] = useState<Record<string, ActualWeight>>(
    {}
  );
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<
    "weight" | "calories" | "exercise" | null
  >(null);
  const [editValue, setEditValue] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);

  const loadData = useCallback(async () => {
    const userData = await loadUserData();
    if (userData) {
      setUserData(userData);
      setDailyProjections(projectWeekDaily(userData, weekNumber));
    }
    const weights = await loadActualWeights();
    const dataMap: Record<string, ActualWeight> = {};
    weights.forEach((w: ActualWeight) => {
      dataMap[w.date] = w;
    });
    setActualData(dataMap);
  }, [weekNumber]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveData = async (
    date: string,
    field: "weight" | "calories" | "exercise"
  ) => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value > 0) {
      const updateData: ActualWeight = { date };

      if (field === "weight") {
        updateData.weight = value;
      } else if (field === "calories") {
        updateData.caloriesEaten = value;
      } else if (field === "exercise") {
        updateData.caloriesBurnedExercise = value;
      }

      await saveActualWeight(updateData);

      setActualData((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          ...updateData,
        },
      }));
    }
    setEditingDate(null);
    setEditingField(null);
    setEditValue("");
  };

  const startEditing = (
    date: string,
    field: "weight" | "calories" | "exercise",
    currentValue?: number
  ) => {
    setEditingDate(date);
    setEditingField(field);
    setEditValue(currentValue ? String(currentValue) : "");
  };

  const toggleGoal = async (date: string, goal: string) => {
    const dayData = actualData[date] || { date };
    const completedGoals = dayData.completedGoals || [];

    const newCompletedGoals = completedGoals.includes(goal)
      ? completedGoals.filter((g) => g !== goal)
      : [...completedGoals, goal];

    const updateData: ActualWeight = {
      ...dayData,
      completedGoals: newCompletedGoals,
    };

    await saveActualWeight(updateData);

    setActualData((prev) => ({
      ...prev,
      [date]: updateData,
    }));
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text variant="labelMedium" style={styles.weekLabel}>
          Week {weekNumber} - Daily Breakdown
        </Text>

        {/* Week Summary Card */}
        {dailyProjections.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Week Overview
              </Text>
              <Divider style={styles.divider} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Starting Weight
                  </Text>
                  <Text variant="headlineSmall" style={styles.summaryValue}>
                    {dailyProjections[0].weight.toFixed(1)} lbs
                  </Text>
                </View>

                <Text variant="headlineMedium" style={styles.summaryArrow}>
                  →
                </Text>

                <View style={styles.summaryItem}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Ending Weight
                  </Text>
                  <Text variant="headlineSmall" style={styles.summaryValue}>
                    {dailyProjections[
                      dailyProjections.length - 1
                    ].weight.toFixed(1)}{" "}
                    lbs
                  </Text>
                </View>
              </View>

              <View style={styles.summaryChange}>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Expected Change
                </Text>
                <Text
                  variant="titleLarge"
                  style={[
                    styles.changeValue,
                    {
                      color:
                        dailyProjections[dailyProjections.length - 1].weight <
                        dailyProjections[0].weight
                          ? Colors.success
                          : Colors.warning,
                    },
                  ]}
                >
                  {(
                    dailyProjections[dailyProjections.length - 1].weight -
                    dailyProjections[0].weight
                  ).toFixed(2)}{" "}
                  lbs
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {dailyProjections.map((daily, index) => {
          const dateKey = daily.date.split("T")[0];
          const dayData = actualData[dateKey];
          const date = new Date(daily.date);
          const dateStr = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });

          const renderEditableField = (
            label: string,
            field: "weight" | "calories" | "exercise",
            currentValue: number | undefined,
            unit: string = ""
          ) => {
            const isEditing = editingDate === dateKey && editingField === field;

            if (isEditing) {
              return (
                <View style={styles.editContainer}>
                  <Text variant="bodySmall" style={styles.fieldLabel}>
                    {label}
                  </Text>
                  <View style={styles.editRow}>
                    <TextInput
                      value={editValue}
                      onChangeText={setEditValue}
                      keyboardType="decimal-pad"
                      mode="outlined"
                      dense
                      style={styles.input}
                      autoFocus
                    />
                    <IconButton
                      icon="check"
                      size={20}
                      onPress={() => handleSaveData(dateKey, field)}
                    />
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => {
                        setEditingDate(null);
                        setEditingField(null);
                      }}
                    />
                  </View>
                </View>
              );
            }

            return (
              <TouchableRipple
                onPress={() => startEditing(dateKey, field, currentValue)}
                style={styles.fieldTouchable}
              >
                <View style={styles.fieldContainer}>
                  <Text variant="bodySmall" style={styles.fieldLabel}>
                    {label}
                  </Text>
                  {currentValue !== undefined ? (
                    <View style={styles.fieldValueRow}>
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.fieldValue,
                          field === "weight" && {
                            color:
                              currentValue > daily.weight
                                ? Colors.warning
                                : currentValue < daily.weight
                                ? Colors.success
                                : Colors.textPrimary,
                          },
                        ]}
                      >
                        {currentValue.toFixed(field === "weight" ? 1 : 0)}{" "}
                        {unit}
                      </Text>
                      <IconButton icon="pencil" size={16} />
                    </View>
                  ) : (
                    <View style={styles.fieldValueRow}>
                      <Text variant="bodyMedium" style={styles.noData}>
                        Tap to add
                      </Text>
                      <IconButton icon="plus" size={16} />
                    </View>
                  )}
                </View>
              </TouchableRipple>
            );
          };

          return (
            <Card key={daily.day} style={styles.dayCard}>
              <Card.Content>
                <View style={styles.dayHeader}>
                  <View>
                    <Text variant="titleLarge" style={styles.dayName}>
                      {daily.dayName}
                    </Text>
                    <Text variant="bodySmall" style={styles.dateText}>
                      {dateStr}
                    </Text>
                  </View>
                  <View style={styles.projectedContainer}>
                    <Text variant="bodySmall" style={styles.fieldLabel}>
                      Projected
                    </Text>
                    <Text
                      variant="headlineSmall"
                      style={styles.projectedWeight}
                    >
                      {daily.weight.toFixed(1)} lbs
                    </Text>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.fieldsGrid}>
                  {renderEditableField(
                    "Weight",
                    "weight",
                    dayData?.weight,
                    "lbs"
                  )}
                  {renderEditableField(
                    "Calories Eaten",
                    "calories",
                    dayData?.caloriesEaten,
                    "cal"
                  )}
                  {renderEditableField(
                    "Exercise",
                    "exercise",
                    dayData?.caloriesBurnedExercise,
                    "cal"
                  )}
                </View>

                {/* Daily Goals Section */}
                {userData?.dailyGoals && userData.dailyGoals.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    <Text variant="bodySmall" style={styles.goalsHeader}>
                      Daily Goals
                    </Text>
                    <View style={styles.goalsList}>
                      {userData.dailyGoals.map((goal, index) => {
                        const isCompleted =
                          dayData?.completedGoals?.includes(goal) || false;
                        return (
                          <TouchableRipple
                            key={index}
                            onPress={() => toggleGoal(dateKey, goal)}
                            style={styles.goalItem}
                          >
                            <View style={styles.goalRow}>
                              <Checkbox
                                status={isCompleted ? "checked" : "unchecked"}
                                color={Colors.primary}
                              />
                              <Text
                                style={[
                                  styles.goalText,
                                  isCompleted && styles.goalTextCompleted,
                                ]}
                              >
                                {goal}
                              </Text>
                            </View>
                          </TouchableRipple>
                        );
                      })}
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          );
        })}
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
  weekLabel: {
    color: Colors.textSecondary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryCard: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
  },
  summaryTitle: {
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 10,
  },
  summaryValue: {
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  summaryArrow: {
    color: Colors.textTertiary,
    marginHorizontal: 16,
  },
  summaryChange: {
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  changeValue: {
    fontWeight: "700",
    marginTop: 4,
  },
  dayCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  dayName: {
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  dateText: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  projectedContainer: {
    alignItems: "flex-end",
  },
  projectedWeight: {
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 4,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: Colors.border,
  },
  fieldsGrid: {
    gap: 12,
  },
  fieldTouchable: {
    borderRadius: 8,
    overflow: "hidden",
  },
  fieldContainer: {
    backgroundColor: Colors.cardItemBackground,
    padding: 16,
    borderRadius: 8,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 10,
  },
  fieldValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldValue: {
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  noData: {
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  editContainer: {
    backgroundColor: Colors.cardItemBackground,
    padding: 16,
    borderRadius: 8,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.border,
  },
  goalsHeader: {
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 10,
  },
  goalsList: {
    gap: 8,
  },
  goalItem: {
    borderRadius: 8,
    overflow: "hidden",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardItemBackground,
    paddingRight: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goalText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  goalTextCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
});
