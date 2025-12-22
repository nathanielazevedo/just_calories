import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, SegmentedButtons, TextInput } from "react-native-paper";
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
          <Card.Title title="Your Info" titleVariant="titleLarge" />
          <Card.Content>
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

            <TextInput
              label="Current Weight (lbs)"
              value={String(userData.weight)}
              onChangeText={(text) => updateField("weight", Number(text) || 0)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Goal Weight (lbs)"
              value={String(userData.goalWeight)}
              onChangeText={(text) =>
                updateField("goalWeight", Number(text) || 0)
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="Height (ft)"
                value={String(userData.heightFeet)}
                onChangeText={(text) =>
                  updateField("heightFeet", Number(text) || 0)
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.inputSmall}
              />
              <TextInput
                label="Height (in)"
                value={String(userData.heightInches)}
                onChangeText={(text) =>
                  updateField("heightInches", Number(text) || 0)
                }
                keyboardType="numeric"
                mode="outlined"
                style={styles.inputSmall}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Daily Calories" titleVariant="titleLarge" />
          <Card.Content>
            <TextInput
              label="Calories Eaten"
              value={String(userData.caloriesEaten)}
              onChangeText={(text) =>
                updateField("caloriesEaten", Number(text) || 0)
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Calories Burned (Exercise)"
              value={String(userData.caloriesBurnedExercise)}
              onChangeText={(text) =>
                updateField("caloriesBurnedExercise", Number(text) || 0)
              }
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Start Date"
              value={userData.startDate}
              onChangeText={(text) => updateField("startDate", text)}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save
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
  },
  card: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  inputSmall: {
    flex: 1,
    marginBottom: 16,
  },
  button: {
    marginBottom: 32,
  },
});
