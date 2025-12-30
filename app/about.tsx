import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { Colors } from "../constants/colors";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Disclaimer */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              ⚠️ Disclaimer
            </Text>
            <Text variant="bodyMedium" style={styles.disclaimerText}>
              Ledger is a tracking tool for informational purposes only. It does
              not provide medical, nutritional, or health advice. Always consult
              a qualified professional regarding health or dietary decisions.
            </Text>
          </Card.Content>
        </Card>

        {/* How It Works */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              How It Works
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Weight Projections
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Ledger calculates your Basal Metabolic Rate (BMR) using the
              Mifflin-St Jeor equation and projects your weight loss based on
              your daily calorie deficit. Every 3,500 calories equals
              approximately 1 pound of weight change.
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Tracking Progress
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              The app shows both projected progress (based on your calorie plan)
              and actual progress (based on weight entries). The circular
              progress indicators use light green for projected values and dark
              green for actual values, helping you see if you're on track.
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Daily Goals
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Set custom daily goals in Settings to track habits beyond just
              calories and weight. Check off your goals each day to build
              consistency.
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Weekly View
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Each week shows your projected weight for every day. Enter your
              actual weight to compare against projections and adjust your plan
              as needed.
            </Text>
          </Card.Content>
        </Card>

        {/* Privacy Policy */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Privacy Policy
            </Text>
            <Text variant="bodySmall" style={styles.lastUpdated}>
              Last updated: December 30, 2025
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Data Storage
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Ledger stores all your data locally on your device. We do not
              collect, transmit, or store any of your personal information on
              external servers.
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Information We Collect
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              We do not collect any personal information. All data you enter
              into the app (weight, calories, goals, etc.) remains exclusively
              on your device.
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Third-Party Services
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Ledger does not use any third-party analytics, tracking, or
              advertising services.
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Data Security
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Your data is protected by your device's built-in security
              features. We recommend using device encryption and security
              features provided by your operating system.
            </Text>

            <Text variant="titleMedium" style={styles.subsectionTitle}>
              Changes to This Policy
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              We may update this privacy policy from time to time. Any changes
              will be reflected in the app and on our website.
            </Text>
          </Card.Content>
        </Card>

        {/* Contact */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Contact
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Questions or feedback? Email us at{" "}
              <Text style={styles.link}>ledgercalories@gmail.com</Text>
            </Text>
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
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: Colors.cardBackground,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  subsectionTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  disclaimerText: {
    color: Colors.warning,
    lineHeight: 22,
    fontWeight: "500",
  },
  bodyText: {
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  lastUpdated: {
    color: Colors.textTertiary,
    fontStyle: "italic",
    marginBottom: 16,
  },
  link: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
