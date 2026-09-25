# TEMPLE // WIRED

Android app for an authorized security assessment. Scope, exposure check, findings, and a report.

## Download

[temple-wired.apk](releases/temple-wired.apk)

Sideload that file on an Android phone. Allow install from unknown sources, then open it. Package id: `app.templewired.console`.

This build is a debug APK. The Play Store needs a signed AAB from the `android/` project, not this file.

## Server

The app opens [https://turbo-earth-amber-gold.grok.me](https://turbo-earth-amber-gold.grok.me). Chat and agents use Venice on the server. Set this only in the server environment, never in the app:

```
VENICE_API_KEY=your_venice_key
VENICE_MODEL=llama-3.3-70b
```

## Local

```bash
npm install
npm run dev
```
