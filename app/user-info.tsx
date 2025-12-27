import { usePreventRemove } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import { Colors } from "../constants/colors";
import { UserData } from "./types";
import { clearActualWeights } from "./utils/actual-weights";
import { clearUserData, loadUserData, saveUserData } from "./utils/storage";

export default function UserInfoScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    age: 30,
    weight: 180,
    heightFeet: 5,
    heightInches: 10,
    gender: "male",
    caloriesEaten: 2000,
    caloriesBurnedExercise: 300,
    startDate: new Date().toISOString().split("T")[0],
    goalWeight: 170,
    dailyGoals: [],
  });
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(
    null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    Alert.alert(
      "Unsaved Changes",
      "You have unsaved changes. Are you sure you want to leave?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            setHasUnsavedChanges(false);
            // Use setTimeout to ensure state updates before navigation
            setTimeout(() => router.back(), 0);
          },
        },
      ]
    );
  });

  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    if (originalUserData) {
      const hasChanges =
        JSON.stringify(userData) !== JSON.stringify(originalUserData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [userData, originalUserData]);

  const loadSavedData = async () => {
    const saved = await loadUserData();
    if (saved) {
      setUserData(saved);
      setOriginalUserData(saved);
    }
  };

  const handleSave = async () => {
    await saveUserData(userData);
    setOriginalUserData(userData);
    setHasUnsavedChanges(false);
    router.back();
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your data, including profile information and actual weights. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            await clearUserData();
            await clearActualWeights();
            router.replace("/");
          },
        },
      ]
    );
  };

  const updateField = (field: keyof UserData, value: string | number) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setUserData((prev) => ({
        ...prev,
        dailyGoals: [...(prev.dailyGoals || []), newGoal.trim()],
      }));
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    setUserData((prev) => ({
      ...prev,
      dailyGoals: (prev.dailyGoals || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.progressLabel}>
              Personal Info
            </Text>
            <Divider style={styles.divider} />
            <SegmentedButtons
              value={userData.gender}
              onValueChange={(value) => updateField("gender", value)}
              buttons={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
              style={styles.segmentedButtons}
              theme={{
                colors: {
                  secondaryContainer: Colors.primary,
                  onSecondaryContainer: "#FFFFFF",
                },
              }}
            />

            <TextInput
              label="Age (years)"
              value={String(userData.age)}
              onChangeText={(text) => updateField("age", Number(text) || 0)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Weight Goals
              </Text>
            </View>
            <View style={styles.weightRow}>
              <TextInput
                label="Current Weight"
                value={String(userData.weight)}
                onChangeText={(text) =>
                  updateField("weight", Number(text) || 0)
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.inputHalf}
                right={<TextInput.Affix text="lbs" />}
              />
              <TextInput
                label="Goal Weight"
                value={String(userData.goalWeight)}
                onChangeText={(text) =>
                  updateField("goalWeight", Number(text) || 0)
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.inputHalf}
                right={<TextInput.Affix text="lbs" />}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Height
              </Text>
            </View>
            <View style={styles.row}>
              <TextInput
                label="Feet"
                value={String(userData.heightFeet)}
                onChangeText={(text) =>
                  updateField("heightFeet", Number(text) || 0)
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.inputSmall}
                right={<TextInput.Affix text="ft" />}
              />
              <TextInput
                label="Inches"
                value={String(userData.heightInches)}
                onChangeText={(text) =>
                  updateField("heightInches", Number(text) || 0)
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.inputSmall}
                right={<TextInput.Affix text="in" />}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.progressLabel}>
              Daily Calories
            </Text>
            <Divider style={styles.divider} />
            <TextInput
              label="Calories Eaten (Daily)"
              value={String(userData.caloriesEaten)}
              onChangeText={(text) =>
                updateField("caloriesEaten", Number(text) || 0)
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="cal" />}
            />
            <TextInput
              label="Exercise Calories (Daily)"
              value={String(userData.caloriesBurnedExercise)}
              onChangeText={(text) =>
                updateField("caloriesBurnedExercise", Number(text) || 0)
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="cal" />}
            />

            <Divider style={styles.divider} />

            <TextInput
              label="Start Date"
              value={userData.startDate}
              onChangeText={(text) => updateField("startDate", text)}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD"
              left={<TextInput.Icon icon="calendar" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.progressLabel}>
              Daily Goals
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.goalInputRow}>
              <TextInput
                label="New Goal"
                value={newGoal}
                onChangeText={setNewGoal}
                mode="outlined"
                style={styles.goalInput}
                placeholder="e.g., Drink 8 glasses of water"
                onSubmitEditing={addGoal}
              />
              <Button
                mode="contained"
                onPress={addGoal}
                style={styles.addButton}
                contentStyle={{ paddingVertical: 8 }}
                buttonColor={Colors.primary}
                textColor="#FFFFFF"
              >
                Add
              </Button>
            </View>

            {userData.dailyGoals && userData.dailyGoals.length > 0 && (
              <View style={styles.goalsList}>
                {userData.dailyGoals.map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <Text style={styles.goalText}>{goal}</Text>
                    <Button
                      mode="text"
                      onPress={() => removeGoal(index)}
                      textColor={Colors.warning}
                      compact
                    >
                      Remove
                    </Button>
                  </View>
                ))}
              </View>
            )}

            {(!userData.dailyGoals || userData.dailyGoals.length === 0) && (
              <Text style={styles.emptyText}>
                No daily goals yet. Add goals to track in your week details.
              </Text>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          contentStyle={{ paddingVertical: 8 }}
          buttonColor={Colors.primary}
          textColor="#FFFFFF"
        >
          Save Changes
        </Button>

        <Button
          mode="outlined"
          onPress={handleClearData}
          style={styles.button}
          contentStyle={{ paddingVertical: 8 }}
          textColor={Colors.warning}
        >
          Clear All Data
        </Button>
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  progressLabel: {
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subsectionTitle: {
    fontWeight: "500",
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: Colors.border,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  weightRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputSmall: {
    flex: 1,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 12,
  },
  goalInputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  goalInput: {
    flex: 1,
  },
  addButton: {
    justifyContent: "center",
    borderRadius: 12,
  },
  goalsList: {
    gap: 8,
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardItemBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
});
