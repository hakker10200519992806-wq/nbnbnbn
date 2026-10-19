# CppUz – Kamola uchun

C++ o'rganish ilovasi (HTML/JS, offline) — Android WebView ichida APK sifatida.

## APK olish (GitHub Actions)

1. Repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `TG_BOT_TOKEN`, Value: Telegram bot tokeningiz (BotFather'dan)
2. Kodni `main` branchga push qiling.
3. **Actions** tabida "Build APK" tugagach, run ichidan **CppUz-Kamola-apk** artifactini yuklab oling,
   zip ichidagi `app-debug.apk` ni telefonga o'rnating.

> Token repoda saqlanmaydi: `index.html` da `__TG_BOT_TOKEN__` placeholder turadi,
> build vaqtida Secret'dan qo'yiladi.

## Lokal build

```
gradle assembleDebug     # Gradle 8.7+, JDK 17, Android SDK 34
```

## Tuzilma

- `app/src/main/assets/` – veb ilova (index.html, manifest.json, sw.js, icons)
- `app/src/main/java/com/cppuz/kamola/MainActivity.java` – WebView + bildirishnoma + vibratsiya + ulashish
