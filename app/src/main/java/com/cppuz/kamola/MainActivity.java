package com.cppuz.kamola;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;

import java.util.Random;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private static final String CHANNEL_ID = "cppuz_channel";
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable notifRunnable;
    private String[] notifPhrases = new String[]{
        "Robot-ustoz kutyapti: bugun bitta dars qilamizmi? 🤖",
        "Kod yozishga tayyormisiz? Kichik topshiriqdan boshlaymiz! 💡",
        "Bitta dars — ertangi katta yutuq. Davom etamizmi? ⭐",
        "Kompilyator tayyor, bitta masala yechib ko'ramizmi? 💻",
        "Qisqa 10 daqiqalik dars — yetarli. Boshlaymizmi? ⏱️",
        "Xato qilish mumkin, muhimi urinib ko'rish! Davom etamiz 🚀",
        "Bugungi mashq tayyor. Birga bajaramizmi? ✨",
        "Yangi mavzu sizni kutyapti. Ko'rib chiqamizmi? 📚"
    };

    public class AndroidInterface {
        @JavascriptInterface
        public void showNotification(String title, String body) {
            showNotif(title, body);
        }

        @JavascriptInterface
        public void scheduleNotifs(String jsonPhrases) {
            try {
                JSONArray arr = new JSONArray(jsonPhrases);
                if (arr.length() == 0) return;
                String[] next = new String[arr.length()];
                for (int i = 0; i < arr.length(); i++) next[i] = arr.getString(i);
                notifPhrases = next;
            } catch (Exception ignored) {}
        }

        // index.html: AndroidInterface.vibrate(JSON.stringify(pattern))
        @JavascriptInterface
        public void vibrate(String json) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null || !v.hasVibrator()) return;
                long[] pattern;
                if (json != null && json.trim().startsWith("[")) {
                    JSONArray arr = new JSONArray(json);
                    pattern = new long[arr.length()];
                    for (int i = 0; i < arr.length(); i++) pattern[i] = arr.getLong(i);
                } else {
                    pattern = new long[]{0, Long.parseLong(json.trim())};
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createWaveform(pattern, -1));
                } else {
                    v.vibrate(pattern, -1);
                }
            } catch (Exception ignored) {}
        }

        // index.html: AndroidInterface.shareCode(code)
        @JavascriptInterface
        public void shareCode(String code) {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_TEXT, code);
            Intent chooser = Intent.createChooser(send, "Kodni yuborish");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(chooser);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createChannel();
        requestNotifPermission();

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new AndroidInterface(), "AndroidInterface");
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);

        // Har 2 soatda eslatma (faqat ilova ochiq/fonda tirik bo'lsa)
        notifRunnable = new Runnable() {
            @Override
            public void run() {
                SharedPreferences prefs = getSharedPreferences("cppuz", MODE_PRIVATE);
                long last = prefs.getLong("lastActive", System.currentTimeMillis());
                long idle = System.currentTimeMillis() - last;
                if (idle > 3600000L) {
                    long hours = idle / 3600000L;
                    String timeText = hours >= 2 ? hours + " soat bo'ldi, darsga qaytamizmi? " : "";
                    String phrase = notifPhrases[new Random().nextInt(notifPhrases.length)];
                    showNotif("CppUz - Robot-ustoz", timeText + phrase);
                }
                handler.postDelayed(this, 7200000L);
            }
        };
        handler.postDelayed(notifRunnable, 7200000L);
    }

    private void markActive() {
        getSharedPreferences("cppuz", MODE_PRIVATE)
            .edit().putLong("lastActive", System.currentTimeMillis()).apply();
    }

    @Override
    protected void onResume() {
        super.onResume();
        markActive();
    }

    @Override
    protected void onPause() {
        markActive();
        super.onPause();
    }

    private void requestNotifPermission() {
        if (Build.VERSION.SDK_INT >= 33
                && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID, "CppUz Dars", NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription("Dars eslatmalari");
            NotificationManager nm = getSystemService(NotificationManager.class);
            nm.createNotificationChannel(ch);
        }
    }

    private void showNotif(String title, String body) {
        if (Build.VERSION.SDK_INT >= 33
                && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true);
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        b.setContentIntent(pi);
        NotificationManagerCompat.from(this).notify((int) System.currentTimeMillis(), b.build());
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(notifRunnable);
        super.onDestroy();
    }
}
