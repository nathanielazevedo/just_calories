# App Store Submission Checklist

## ✅ Configuration Complete
- [x] Updated app.json with proper metadata
- [x] Set bundle identifier: `com.justcalories.app`
- [x] Set version: 1.0.0
- [x] Set build number: 1
- [x] Configured dark mode theme

## 📱 Required Assets

### App Icon (Required)
- [ ] Create `assets/images/icon.png` (1024x1024 pixels)
  - No transparency
  - Square image
  - Recommended: Simple, recognizable design with scale/food imagery
  - Colors: Use #10A37F (green) and #212121 (dark background)

### Splash Screen (Required)
- [ ] Create `assets/images/splash-icon.png` (recommended 200x200 pixels)
  - Can be a simplified version of your app icon
  - Will be centered on dark background (#212121)

### Android Icons (Optional - if submitting to Google Play)
- [ ] `assets/images/android-icon-foreground.png` (432x432)
- [ ] `assets/images/android-icon-background.png` (432x432)
- [ ] `assets/images/android-icon-monochrome.png` (432x432)

### Favicon (Optional - for web)
- [ ] `assets/images/favicon.png` (48x48)

## 🔧 EAS Build Setup

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure Build
```bash
eas build:configure
```

### 4. Create Build for iOS
```bash
eas build --platform ios
```

## 📝 App Store Connect Setup

### App Information
- **App Name**: Just Calories
- **Subtitle**: Simple Weight Loss Tracking
- **Category**: Health & Fitness
- **Age Rating**: 4+ (No restricted content)

### Description (Suggested)
```
Track your weight loss journey with Just Calories - the simple, no-nonsense calorie tracker.

FEATURES:
• Set your weight goals and track progress
• Calculate your daily BMR automatically
• Track calories eaten and exercise burned
• See daily, weekly, and monthly weight loss projections
• Timeline view of your weekly progress
• Clean, dark interface optimized for daily use

Just Calories focuses on what matters: calories in vs calories out. No subscriptions, no complicated features - just simple weight tracking that works.

PRIVACY:
All your data is stored locally on your device. We don't collect, store, or share any of your personal information.
```

### Keywords (Suggested)
```
calorie tracker, weight loss, BMR calculator, diet tracker, fitness tracker, weight management, calorie counter, health tracker
```

### Screenshots Needed
You'll need to provide screenshots in these sizes:
- iPhone 6.9" (Pro Max): 1320 x 2868 pixels (3-10 screenshots)
- iPhone 6.7" (Pro Max): 1290 x 2796 pixels
- iPhone 6.5" (Max): 1242 x 2688 pixels
- iPad Pro 12.9": 2048 x 2732 pixels (if supporting iPad)

**Recommended Screenshots:**
1. Overview screen showing progress bar and current weight
2. Daily Burn equation view
3. Weekly Projections timeline
4. Week Detail page with daily breakdown
5. Settings/Profile page

### Privacy Policy
- [ ] Since you're storing data locally only, create a simple privacy policy stating:
  - No data collection
  - All data stored locally on device
  - No third-party analytics or tracking
  - No account creation required

## 🚀 Build Process

### For TestFlight (Internal Testing)
```bash
# Build for iOS (creates .ipa file)
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios
```

### For Production Release
```bash
# Build production version
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## 📋 Pre-Submission Checklist

- [ ] Test on physical iOS device
- [ ] Verify all screens work correctly
- [ ] Test data persistence (save/load user data)
- [ ] Test "Clear All Data" functionality
- [ ] Verify dark mode appearance
- [ ] Check for any console errors or warnings
- [ ] Test on different iPhone sizes
- [ ] Ensure app doesn't crash on edge cases (no data, extreme values)
- [ ] Create App Store Connect listing
- [ ] Prepare screenshots
- [ ] Write/review app description
- [ ] Create privacy policy (can be simple text file or web page)
- [ ] Get App Store review guidelines approval

## 📄 Additional Files to Create

### Privacy Policy (privacy-policy.txt)
Create a simple privacy policy file or host it on a website. Required for App Store submission.

### Support URL
You'll need a support URL for App Store Connect. This can be:
- A simple GitHub repository
- A basic website
- An email address formatted as a URL

## 💡 Tips for Approval

1. **App Store Review Guidelines**: Make sure your app provides real value
2. **Metadata**: Keep descriptions clear and don't make false claims
3. **Privacy**: Be transparent about data usage (you're not collecting any)
4. **Testing**: Provide a test account if needed (not required for this app)
5. **Response Time**: Reviews typically take 24-48 hours

## 🎨 Icon Design Suggestions

Since you don't have icons yet, here are some ideas:
- Scale icon with calorie symbols
- Plate with utensils
- Graph/chart trending downward
- Number "0" styled as a plate
- Simple "JC" monogram

You can use tools like:
- Figma (free)
- Canva (free tier available)
- Icon generators online
- Hire a designer on Fiverr ($5-20)

## Next Steps

1. Create the app icon and splash screen
2. Install and configure EAS CLI
3. Create an Apple Developer account ($99/year)
4. Generate a build with `eas build`
5. Test with TestFlight
6. Submit for App Store review

---

**Note**: You'll need an active Apple Developer Program membership ($99 USD/year) to submit to the App Store.
