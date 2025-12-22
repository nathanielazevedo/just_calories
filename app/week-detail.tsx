import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Card,
  DataTable,
  Divider,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { ActualWeight, DailyWeightProjection } from "./types";
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

  const loadData = useCallback(async () => {
    const userData = await loadUserData();
    if (userData) {
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

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                📅 Week {weekNumber} - Daily Breakdown
              </Text>
            </View>
            <Divider style={styles.divider} />
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Day</DataTable.Title>
                <DataTable.Title numeric>Proj Wt</DataTable.Title>
                <DataTable.Title numeric>Actual Wt</DataTable.Title>
                <DataTable.Title numeric>Calories</DataTable.Title>
                <DataTable.Title numeric>Exercise</DataTable.Title>
              </DataTable.Header>

              {dailyProjections.map((daily, index) => {
                const dateKey = daily.date.split("T")[0];
                const dayData = actualData[dateKey];
                const date = new Date(daily.date);
                const dateStr = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                const renderEditableCell = (
                  field: "weight" | "calories" | "exercise",
                  currentValue: number | undefined,
                  unit: string = ""
                ) => {
                  const isEditing =
                    editingDate === dateKey && editingField === field;

                  if (isEditing) {
                    return (
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
                    );
                  }

                  if (currentValue !== undefined) {
                    let color = "#ECECEC";
                    if (field === "weight") {
                      color =
                        currentValue > daily.weight
                          ? "#EF4444"
                          : currentValue < daily.weight
                          ? "#10A37F"
                          : "#ECECEC";
                    }

                    return (
                      <View style={styles.actualWeightRow}>
                        <Text
                          variant="bodyMedium"
                          style={{
                            color,
                            fontWeight: field === "weight" ? "600" : "400",
                          }}
                        >
                          {currentValue.toFixed(field === "weight" ? 1 : 0)}
                          {unit}
                        </Text>
                        <IconButton
                          icon="pencil"
                          size={16}
                          onPress={() =>
                            startEditing(dateKey, field, currentValue)
                          }
                        />
                      </View>
                    );
                  }

                  return (
                    <IconButton
                      icon="plus"
                      size={20}
                      onPress={() => startEditing(dateKey, field)}
                    />
                  );
                };

                return (
                  <DataTable.Row key={daily.day} style={styles.tableRow}>
                    <DataTable.Cell>
                      <View>
                        <Text variant="bodyMedium" style={styles.dayName}>
                          {daily.dayName}
                        </Text>
                        <Text variant="bodySmall" style={styles.dateText}>
                          {dateStr}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text variant="bodyMedium" style={styles.projectedWeight}>
                        {daily.weight.toFixed(1)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      {renderEditableCell("weight", dayData?.weight, " lbs")}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      {renderEditableCell(
                        "calories",
                        dayData?.caloriesEaten,
                        " cal"
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      {renderEditableCell(
                        "exercise",
                        dayData?.caloriesBurnedExercise,
                        " cal"
                      )}
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#2F2F2F",
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: "600",
  },
  divider: {
    marginVertical: 16,
    backgroundColor: "#3E3E3E",
  },
  tableRow: {
    minHeight: 64,
  },
  dayName: {
    fontWeight: "500",
  },
  dateText: {
    color: "#999",
    marginTop: 2,
  },
  projectedWeight: {
    color: "#999",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginVertical: -8,
  },
  input: {
    width: 90,
    marginRight: 4,
    backgroundColor: "#3E3E3E",
  },
  actualWeightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  dataColumn: {
    alignItems: "flex-end",
  },
});
