# TEMPLE // WIRED

Android app for an authorized security assessment. Scope, exposure check, findings, and a report.

## Download

Direct file: [temple-wired.apk](https://github.com/TAesthetics/lilabruce/releases/download/v0.1.0/temple-wired.apk)

Sideload that file on an Android phone. Allow install from unknown sources, then open it. Package id: `app.templewired.console`.

This build is a debug APK. The Play Store needs a signed AAB from the `android/` project, not this file.

## Railway

The repo includes an Android project. Railway must use the Dockerfile, not Gradle. `railway.toml` already says that.

In the Railway service, set:

```
VENICE_API_KEY=your_venice_key
VENICE_MODEL=llama-3.3-70b
```

Optional, for data that survives a restart: add a Postgres plugin and set `DATABASE_URL`. Without it the app uses a local database on the container disk.

Railway injects `PORT`. The server listens on `0.0.0.0` and that port.

## Local

```bash
npm install
npm run dev
```
