#!/usr/bin/env node

/**
 * Setup script for mobile app development
 * Installs Capacitor and native platform dependencies
 *
 * Usage:
 *   npm run setup:mobile          # Full setup
 *   npm run setup:mobile -- ios   # iOS only
 *   npm run setup:mobile -- android # Android only
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const args = process.argv.slice(2);
const targetPlatform = args[0]; // 'ios', 'android', or undefined for both
const isCI = process.env.CI === "true";
const isMac = os.platform() === "darwin";

const log = (msg) => console.log(`\n📱 ${msg}`);
const error = (msg) => {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
};
const warn = (msg) => console.warn(`\n⚠️  ${msg}`);

async function runCommand(cmd, description) {
  try {
    log(description);
    execSync(cmd, { stdio: "inherit", shell: "/bin/bash" });
    return true;
  } catch (e) {
    warn(`Failed: ${description}`);
    return false;
  }
}

async function setup() {
  log("TEMPLE WIRED Mobile Setup");
  log("========================\n");

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split(".")[0].slice(1));
  if (majorVersion < 20) {
    error(`Node.js 20+ required. Current: ${nodeVersion}`);
  }
  log(`✓ Node.js ${nodeVersion}`);

  // Install Capacitor CLI globally
  await runCommand("npm install -g @capacitor/cli", "Installing Capacitor CLI...");

  // Install Capacitor dependencies
  await runCommand(
    "npm install @capacitor/core @capacitor/cli",
    "Installing Capacitor core...",
  );

  // Install mobile plugins
  const plugins = [
    "@capacitor/app",
    "@capacitor/keyboard",
    "@capacitor/status-bar",
    "@capacitor/push-notifications",
    "@capacitor/local-notifications",
    "@capacitor/biometric-auth",
    "@capacitor/camera",
    "@capacitor/geolocation",
  ];

  await runCommand(
    `npm install ${plugins.join(" ")}`,
    "Installing Capacitor plugins...",
  );

  const shouldSetupIOS = !targetPlatform || targetPlatform === "ios";
  const shouldSetupAndroid = !targetPlatform || targetPlatform === "android";

  // iOS Setup
  if (shouldSetupIOS) {
    if (!isMac && !isCI) {
      warn("iOS development requires macOS. Skipping iOS setup.");
    } else {
      log("\n🍎 iOS Setup");
      log("============");

      // Check if iOS already exists
      const iosPath = path.join(process.cwd(), "ios");
      if (!fs.existsSync(iosPath)) {
        await runCommand("npx cap add ios", "Adding iOS platform...");
      } else {
        log("✓ iOS platform already exists");
      }

      // Install CocoaPods
      if (isMac) {
        await runCommand(
          "cd ios/App && pod install && cd ../.. ",
          "Installing CocoaPods...",
        );
      }

      log("✓ iOS setup complete");
      log("Next: npx cap open ios");
    }
  }

  // Android Setup
  if (shouldSetupAndroid) {
    log("\n🤖 Android Setup");
    log("================");

    // Check if Android SDK is available
    const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
    if (!androidHome && !isCI) {
      warn("ANDROID_HOME not set. Please set it and run again:");
      warn(`export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS`);
      warn(`export ANDROID_HOME=$HOME/Android/Sdk  # Linux`);
    } else if (androidHome) {
      log(`✓ Android SDK found at ${androidHome}`);
    }

    // Check if Android platform exists
    const androidPath = path.join(process.cwd(), "android");
    if (!fs.existsSync(androidPath)) {
      await runCommand("npx cap add android", "Adding Android platform...");
    } else {
      log("✓ Android platform already exists");
    }

    // Create signing keystore (optional)
    const keystorePath = path.join(process.cwd(), "temple-wired-key.keystore");
    if (!fs.existsSync(keystorePath) && !isCI) {
      const createKeystore = process.argv.includes("--keystore");
      if (createKeystore) {
        await runCommand(
          `keytool -genkey -v -keystore ${keystorePath} \\
            -keyalg RSA -keysize 2048 -validity 10000 \\
            -alias temple-wired`,
          "Creating release keystore...",
        );
        log("✓ Keystore created. Store safely!");
      } else {
        log("⚠️  Skipping keystore creation. Use --keystore to create.");
      }
    }

    log("✓ Android setup complete");
    log("Next: npx cap open android");
  }

  // Sync web assets
  await runCommand("npm run build", "Building web assets...");
  await runCommand("npx cap sync", "Syncing to native projects...");

  // Final checklist
  log("\n✅ Setup Complete!");
  log("=================\n");

  if (shouldSetupIOS && isMac) {
    log("iOS Next Steps:");
    log("  npx cap open ios");
    log("  # In Xcode: Select simulator/device → Run");
  }

  if (shouldSetupAndroid) {
    log("Android Next Steps:");
    log("  npx cap open android");
    log("  # In Android Studio: Select emulator/device → Run");
  }

  log("\nDevelopment:");
  log("  npm run dev          # Start web dev server");
  log("  npx cap sync         # After code changes");
  log("  npx cap open ios     # Re-open Xcode");
  log("  npx cap open android # Re-open Android Studio");

  log("\nBuilding for Release:");
  log("  npm run build");
  log("  See MOBILE_BUILD.md for detailed iOS/Android release steps");

  log("\nUseful Commands:");
  log("  npx cap open ios");
  log("  npx cap open android");
  log("  npx cap sync ios");
  log("  npx cap sync android");
  log("  npx cap add plugin @capacitor/camera");

  log("\nDocumentation:");
  log("  https://capacitorjs.com");
  log("  Local: MOBILE_BUILD.md\n");
}

setup().catch(error);
