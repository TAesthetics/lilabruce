# TEMPLE WIRED — Mobile App Build Guide

Build native iOS and Android apps from the web codebase using Capacitor.

---

## Prerequisites

### All Platforms
- Node.js 22+
- npm or yarn
- Git

### iOS (macOS only)
- Xcode 15+
- CocoaPods
- Apple Developer Account (for TestFlight/App Store)
- Minimum iOS target: 14.0

### Android
- Android Studio 2023+
- Android SDK 34+
- Java 17+
- Google Play Developer Account (for Play Store)
- Minimum Android: API 30

---

## Setup

### 1. Install Capacitor CLI

```bash
npm install -g @capacitor/cli
```

### 2. Install Native Platforms

```bash
# iOS (macOS only)
npm install @capacitor/ios
npx cap add ios

# Android
npm install @capacitor/android
npx cap add android

# Mobile utilities
npm install @capacitor/core @capacitor/app @capacitor/keyboard @capacitor/status-bar
npm install @capacitor/push-notifications @capacitor/local-notifications
npm install @capacitor/biometric-auth
```

### 3. Build Web Assets

```bash
npm run build
```

This creates `dist/client/` which Capacitor wraps in native shells.

---

## Development

### Live Reload (Faster Development)

#### iOS

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Open iOS project and run on device/simulator
npx cap open ios

# In Xcode: Product → Scheme → Select simulator/device → Run
# App will auto-reload when you save files
```

#### Android

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Open Android project
npx cap open android

# In Android Studio: Select emulator/device → Run (Shift+F10)
# App will auto-reload when you save files
```

### Sync Changes

After modifying web code:

```bash
npx cap sync          # Copies dist/ to native projects
npx cap sync ios      # iOS only
npx cap sync android  # Android only
```

---

## Building for Release

### iOS Release Build

#### 1. Update Version

```bash
# Update version in package.json and capacitor.config.ts
npm run build
npx cap sync ios
```

#### 2. Open Xcode

```bash
npx cap open ios
```

#### 3. Configure Signing

- Xcode → App → Signing & Capabilities
- Team: Select your Apple Developer Team
- Bundle Identifier: `app.templewired.console`
- Code Sign Identity: "Apple Development"

#### 4. Create Archive

```bash
# In Xcode
Product → Archive

# Or from command line
xcodebuild archive \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath ./build/App.xcarchive
```

#### 5. Upload to TestFlight / App Store

```bash
# Using Xcode Organizer
Window → Organizer → Archives → Distribute App

# Or using xcrun
xcrun altool --upload-app \
  --file ./build/App.xcarchive \
  --type ipa \
  --apiKey YOUR_KEY_ID \
  --apiIssuer YOUR_ISSUER_ID
```

### Android Release Build

#### 1. Update Version

Edit `android/app/build.gradle`:

```gradle
android {
  compileSdk 34
  defaultConfig {
    versionCode 1
    versionName "1.0.0"
  }
}
```

#### 2. Create Keystore

```bash
keytool -genkey -v \
  -keystore temple-wired-key.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias temple-wired
```

**Keep this file safe!** You'll need it for every future update.

#### 3. Sign Release APK

Edit `android/app/build.gradle`:

```gradle
signingConfigs {
  release {
    keyStore file('temple-wired-key.keystore')
    keyStorePassword System.getenv("KEYSTORE_PASSWORD")
    keyAlias System.getenv("KEY_ALIAS")
    keyPassword System.getenv("KEY_PASSWORD")
  }
}

buildTypes {
  release {
    signingConfig signingConfigs.release
  }
}
```

#### 4. Build Bundle (for Play Store)

```bash
cd android
./gradlew bundleRelease

# Output: app/release/app-release.aab
```

Or APK (for direct distribution):

```bash
./gradlew assembleRelease

# Output: app/release/app-release.apk
```

#### 5. Upload to Play Store

1. Create app at [play.google.com/console](https://play.google.com/console)
2. Upload `app-release.aab` in Release section
3. Fill metadata (screenshots, description, category)
4. Pricing: Free (with in-app purchases via Stripe)
5. Submit for review

---

## App Store Submission Checklist

### iOS (App Store)

- [ ] App icons (1024x1024 PNG)
- [ ] Screenshots (6.5-inch and larger)
- [ ] App Preview video (optional)
- [ ] App Description (max 30 characters)
- [ ] Keywords (100 characters)
- [ ] Support URL
- [ ] Privacy Policy URL
- [ ] Content ratings (questionnaire)
- [ ] Age restrictions
- [ ] Category: Business / Productivity
- [ ] Pricing: Free
- [ ] In-app purchases: Subscription (€20/month)

### Android (Play Store)

- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (min 2, max 8 per device type)
- [ ] App description (80 characters short, 4000 long)
- [ ] Content rating questionnaire
- [ ] Target audience: 13+
- [ ] Category: Business / Productivity
- [ ] Pricing: Free
- [ ] In-app products: Subscription (€20/month)
- [ ] Privacy policy URL
- [ ] Contact email

---

## Metadata & Assets

### Icons

Place app icons at:

```
public/icons/
├── icon-192x192.png    (Android launcher)
├── icon-512x512.png    (App Store)
├── icon-1024x1024.png  (Play Store)
└── icon-rounded.png    (iOS, circular)
```

#### Generate Icons from SVG

```bash
npm install -g @capacitor/assets

npx cap-assets generate --assetPath ./public/icons
```

This auto-generates all required sizes for iOS and Android.

### Splash Screens

Configure in `capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchAutoHide: true,
    backgroundColor: "#0b0c0e",
    fadeOutDuration: 500,
  },
}
```

Create splash image: `public/splash.png` (2732x2732 PNG)

---

## Push Notifications

### iOS (APNs)

1. Create APNs Certificate in [Apple Developer](https://developer.apple.com)
2. Download `.p8` file
3. Upload to Firebase or Stripe (for notification relay)

### Android (FCM)

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Download `google-services.json`
3. Place in `android/app/`
4. Configure FCM credentials in backend

### Sending Notifications

```typescript
import { PushNotifications } from "@capacitor/push-notifications";

// Send from backend
const res = await fetch("/api/notify", {
  method: "POST",
  body: JSON.stringify({
    userId: "user-123",
    title: "New finding",
    body: "SQL injection detected",
    data: { engagementId: "eng-456" },
  }),
});
```

---

## Native Permissions

### iOS (Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access for QR code scanning</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Location for target mapping</string>

<key>NSBiometryUsageDescription</key>
<string>Biometric authentication</string>
```

### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Capacitor handles most of this automatically.

---

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests (via Playwright)

```bash
npm run test:e2e
```

### Device Testing

#### iOS

```bash
# Run on simulator
npx cap open ios
# Select simulator in Xcode → Product → Run

# Run on device (requires provisioning profile)
# Connect device → Xcode will auto-detect
# Product → Run
```

#### Android

```bash
# Run on emulator
npx cap open android
# Select emulator in Android Studio → Run

# Run on device
# Enable USB debugging on device
# adb devices  # Should show your device
# Android Studio → Run
```

---

## Troubleshooting

### iOS

```bash
# Clear build cache
rm -rf ios/App/Pods
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reinstall pods
cd ios/App && pod install && cd ../..

# Rebuild
npx cap sync ios
```

### Android

```bash
# Clear gradle cache
./gradlew clean

# Rebuild
npx cap sync android
./gradlew bundleRelease
```

### Web in App

```bash
# Check console for errors
# Xcode: Debug → Open System Log → Filter "temple"
# Android Studio: Logcat → App package: app.templewired.console
```

---

## Version Management

Update everywhere:

```bash
# package.json
{
  "version": "1.1.0"
}

# capacitor.config.ts
appVersion: "1.1.0",
appBuild: "2",

# android/app/build.gradle
versionCode 2
versionName "1.1.0"

# ios/App/App.xcodeproj (via Xcode)
# Target → General → Version: 1.1.0, Build: 2
```

Then:

```bash
npm run build
npx cap sync
```

---

## Distribution Channels

| Channel | Timeline | Audience | Steps |
|---------|----------|----------|-------|
| **TestFlight (iOS)** | 24-48 hours | Internal/Beta | Xcode Organizer → Distribute → TestFlight |
| **App Store (iOS)** | 24-48 hours | Public | App Store Connect → Submit for Review |
| **Play Store (Android)** | 2-4 hours | Public | Play Console → Production release |
| **Direct APK (Android)** | Instant | Specific users | Share `app-release.apk` |
| **Enterprise (iOS)** | Instant | Organization | Enterprise certificate + MDM |

---

## Revenue & Billing

### In-App Purchases (iOS)

Configured via App Store Connect:
- Product ID: `temple.month.20`
- Price: €19.99 (or local equivalent)
- Billing period: Monthly auto-renewable

### In-App Purchases (Android)

Configured via Play Console:
- SKU: `temple.month.20`
- Price: €19.99
- Billing period: Monthly auto-renewable

### Backend Integration

Verify receipts server-side:

```typescript
// iOS
const verified = await verifyAppStoreReceipt(receipt);

// Android
const verified = await verifyPlayStoreReceipt(packageName, productId, token);
```

---

## Monitoring & Analytics

### Crash Reporting

```bash
npm install @sentry/capacitor
```

```typescript
import * as Sentry from "@sentry/capacitor";

Sentry.init({
  dsn: "https://key@sentry.io/project",
  environment: "production",
});
```

### Analytics

```bash
npm install firebase
```

Track events:

```typescript
import { Analytics } from "firebase/analytics";

logEvent(analytics, "assessment_started", {
  target: "example.com",
  engagement_id: "eng-123",
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Mobile

on: [push]

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      
      - run: npm install
      - run: npm run build
      - run: npx cap sync
      
      # Build iOS
      - run: |
          xcodebuild archive \
            -workspace ios/App/App.xcworkspace \
            -scheme App \
            -configuration Release
      
      # Build Android
      - run: |
          cd android && ./gradlew bundleRelease
```

---

## Support

For issues:

1. Check Capacitor docs: [capacitorjs.com](https://capacitorjs.com)
2. Check platform-specific guides:
   - [Xcode Help](https://help.apple.com/xcode)
   - [Android Studio Guide](https://developer.android.com/studio/intro)
3. Search [GitHub Issues](https://github.com/TAesthetics/lilabruce/issues)
4. Create new issue with logs from Xcode/Android Studio

---

**Ready to ship!** 🚀 Follow this guide to deploy TEMPLE WIRED to both app stores.
