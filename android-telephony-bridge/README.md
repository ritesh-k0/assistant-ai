# Lakshmi Assistant - Android Native SIM Call Handling & Bridge Guide

This document describes the exact architecture, Android OS boundaries, permissions, and step-by-step instructions for running **Lakshmi Assistant** as an Android application with native SIM cellular call detection and answering.

---

## 1. Project Stack Identification (Requirement #1)

- **Existing Project Stack**:
  - **Frontend**: React 18 SPA (Vite + TypeScript + Tailwind CSS).
  - **Backend / APIs**: Node.js Express server (`server.ts`) with Netlify serverless functions (`netlify/functions/api.ts`).
  - **Database & Auth**: Supabase PostgreSQL + Supabase GoTrue Auth.
  - **Initial Android State**: The project was originally a pure Web Single Page App without Capacitor or Cordova wrappers.
  - **Implemented Solution**: High-performance Native Android WebView container with bidirectional JavaScript Bridge (`LakshmiAndroidBridge`), maintaining 100% of the web UI, Supabase data, and auth flows while giving native Android access to telephony APIs.

---

## 2. Technical & Android Security Reality Check (Requirements #4, #5 & #6)

### A. Call Screening vs. Answering Calls
- **`CallScreeningService`**:
  - Android API introduced in Android 7 (API 24) and expanded in Android 10 (API 29).
  - **What it can do**: Inspects the incoming phone number before the phone rings and tells the OS whether to allow, reject, or silence the call.
  - **What it CANNOT do**: *CallScreeningService cannot answer calls, cannot maintain call state, and cannot capture or inject audio*.
- **`InCallService` (Telecom Framework)**:
  - Required to actually control and answer active cellular calls (`call.answer(VideoProfile.STATE_AUDIO_ONLY)` and `call.disconnect()`).
  - To bind `InCallService`, Android requires Lakshmi Assistant to be requested and accepted by the user as the **Default Phone / Dialer App** (`ROLE_DIALER`).

### B. Cellular Modem Audio Interception Restrictions (Crucial)
- Standard Android security sandbox and Linux kernel drivers strictly isolate the cellular voice modem.
- Third-party Android apps **cannot access raw digital downlink/uplink audio streams** (`AudioSource.VOICE_CALL` requires `android.permission.CAPTURE_AUDIO_OUTPUT`, which is a system-only signature permission granted only to pre-installed OEM apps).
- **Legitimate Technical Approach for Two-Way Lakshmi Voice**:
  - When Lakshmi answers the call (via `InCallService`), the bridge automatically triggers `setAudioRoute(CallAudioState.ROUTE_SPEAKER)`.
  - The phone operates on **loudspeaker mode**, allowing the Android device microphone to pick up the caller's spoken voice and Lakshmi's Gemini voice response to play over the speaker, facilitating a natural conversation without violating Android OS security rules.

---

## 3. Privacy, Call Recording & Legal Compliance (Requirement #8)

- **Consent First**: In India and most jurisdictions, recording calls without two-party consent carries legal liability.
- **Enforced Rule**: Lakshmi Assistant **does NOT record raw audio files silently**.
- When the automated response is triggered after the 20-second unanswered timer, Lakshmi speaks:
  > *"Namaste, Ritesh abhi phone nahi utha pa rahe hain. Aap batayein, kya kaam hai?"*
- Caller messages are only captured as text notes or reminders explicitly left by the caller.

---

## 4. API Key & Supabase Security (Requirement #9)

- Frontend code **never** contains the Supabase service-role key or Gemini API secret keys.
- All Gemini AI inference and TTS voice synthesis run securely through the backend proxy (`/api/chat` and `/api/voice/tts`).
- Supabase access uses the restricted publishable anonymous key (`VITE_SUPABASE_ANON_KEY`) with Row Level Security (RLS) policies.

---

## 5. Android Studio Project Structure

The native project is located in `/android-telephony-bridge/`:
```text
android-telephony-bridge/
├── build.gradle.kts
├── settings.gradle.kts
└── app/
    ├── build.gradle.kts
    └── src/
        └── main/
            ├── AndroidManifest.xml
            ├── java/com/ritesh/lakshmiassistant/
            │   ├── MainActivity.kt
            │   └── telephony/
            │       ├── CallBridgeManager.kt
            │       ├── CallReceiver.kt
            │       ├── LakshmiCallScreeningService.kt
            │       ├── LakshmiInCallService.kt
            │       └── AndroidBridge.kt
            └── res/
                ├── layout/activity_main.xml
                └── values/
                    ├── strings.xml
                    └── styles.xml
```

---

## 6. How to Build, Install & Test on Vivo / iQOO (Funtouch OS / Origin OS)

### Step 1: Build the APK
1. Open the project in Android Studio (or run from command line):
   ```bash
   ./gradlew assembleDebug
   ```
2. The generated APK will be located at:
   `android-telephony-bridge/app/build/outputs/apk/debug/app-debug.apk`

### Step 2: Install via ADB or Direct Transfer
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
Or copy `app-debug.apk` directly to your Vivo/iQOO phone storage and install via the native File Manager.

### Step 3: Critical Vivo / iQOO (Funtouch OS) Settings
Vivo and iQOO devices enforce aggressive background process killing and custom permission managers. To ensure native SIM call interception works consistently:
1. **Autostart Permission**:
   - Go to **Settings > Apps > Autostart** (or *i Manager > App Management > Autostart*).
   - Find **Lakshmi Assistant** and toggle **Allow Autostart / Associated Autostart** to **ON**.
2. **Background Power Consumption**:
   - Go to **Settings > Battery > Background Power Consumption Management**.
   - Select **Lakshmi Assistant** and choose **"Don't restrict background battery usage"** (High background power consumption).
3. **Default Phone App (ROLE_DIALER)**:
   - Go to **Settings > Apps > Default Apps > Phone App**.
   - Select **Lakshmi Assistant** as the Default Phone App.
4. **Floating Window / Display over other apps**:
   - Go to **Settings > Apps > Special App Access > Display over other apps**.
   - Ensure **Lakshmi Assistant** has permission to display over other apps so the incoming call screen appears even when the phone is on the home screen or locked.

---

## 7. Two-Way AI Audio Reality Check & Technical Truth

| Feature | Supported natively? | Mechanism / Restriction |
| :--- | :--- | :--- |
| **Incoming SIM Call Detection** | **YES** | Intercepted via `CallReceiver` (`ACTION_PHONE_STATE_CHANGED`) & `LakshmiInCallService`. |
| **Caller Phone Number ID** | **YES** | Provided by `EXTRA_INCOMING_NUMBER` with `READ_PHONE_STATE` & `READ_CALL_LOG`. |
| **Programmatic Call Answering** | **YES** | `LakshmiInCallService.answerCurrentCall()` (with `ROLE_DIALER`) or TelecomManager `acceptRingingCall()`. |
| **Programmatic Call Hanging Up** | **YES** | `LakshmiInCallService.endCurrentCall()` or TelecomManager `endCall()`. |
| **Direct Digital Cellular Modem Audio Injection/Tapping** | **NO** (Android OS restriction) | Android strictly blocks non-system apps from injecting digital PCM audio directly into the cellular modem uplink/downlink (`CAPTURE_AUDIO_OUTPUT` is signature-only). |
| **Real-world Two-Way Lakshmi Voice** | **YES (via Speakerphone)** | When answered, `LakshmiInCallService` sets audio route to `ROUTE_SPEAKER`. Ambient mic captures caller sound, and Gemini voice replies play via device loudspeaker. |
