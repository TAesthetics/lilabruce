const config = {
  appId: "app.templewired.console",
  appName: "TEMPLE WIRED",
  appVersion: "1.0.0",
  appBuild: "1",
  webDir: "dist/client",

  server: {
    androidScheme: "https",
    iosScheme: "https",
    hostname: "app.templewired.local",
    cleartext: ["*.templewired.local"],
  },

  ios: {
    contentInset: "automatic",
  },

  android: {
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0b0c0e",
      fadeOutDuration: 500,
      showSpinner: true,
      spinnerColor: "#00d9ff",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#00d9ff",
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0b0c0e",
    },
    SafeArea: {
      offset: 0,
    },
  },
};

export default config;
