const config = {
  appId: "app.templewired.console",
  appName: "TEMPLE WIRED",
  webDir: "dist/client",
  android: {
    allowMixedContent: false,
  },
  server: {
    url: "https://turbo-earth-amber-gold.grok.me",
    androidScheme: "https",
    allowNavigation: [
      "turbo-earth-amber-gold.grok.me",
      "*.grok.me",
      "checkout.stripe.com",
      "*.stripe.com",
    ],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0b0c0e",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b0c0e",
    },
  },
};

export default config;
