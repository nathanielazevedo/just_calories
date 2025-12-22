import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import { UserData } from "./types";
import { loadUserData, saveUserData } from "./utils/storage";

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
  });

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    const saved = await loadUserData();
    if (saved) {
      setUserData(saved);
    }
  };

  const handleSave = async () => {
    await saveUserData(userData);
    router.back();
  };

  const updateField = (field: keyof UserData, value: string | number) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                👤 Personal Info
              </Text>
            </View>
            <Divider style={styles.divider} />
            <SegmentedButtons
              value={userData.gender}
              onValueChange={(value) => updateField("gender", value)}
              buttons={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
              style={styles.segmentedButtons}
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
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                🍽️ Daily Calories
              </Text>
            </View>
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

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          contentStyle={{ paddingVertical: 8 }}
          icon="check"
        >
          Save Changes
        </Button>
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
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  subsectionTitle: {
    fontWeight: "500",
    color: "#999",
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: "#3E3E3E",
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
});
