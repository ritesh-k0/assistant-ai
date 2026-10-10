package com.ritesh.lakshmiassistant

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.telecom.TelecomManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.ritesh.lakshmiassistant.telephony.AndroidBridge
import com.ritesh.lakshmiassistant.telephony.CallBridgeManager

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    // Permission launcher for runtime permissions (READ_PHONE_STATE, ANSWER_PHONE_CALLS, RECORD_AUDIO)
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions.entries.all { it.value }
        if (granted) {
            Toast.makeText(this, "Telephony & Audio permissions granted!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Some permissions were denied. Call detection may be limited.", Toast.LENGTH_LONG).show()
        }
    }

    // Role launcher for default dialer role (Android 10+)
    private val roleLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            Toast.makeText(this, "Lakshmi is now your Default Phone App!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Default phone app role was not granted.", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        setupWebView()

        // Register WebView with CallBridgeManager
        CallBridgeManager.registerWebView(webView)

        // Request initial permissions on launch if not granted
        checkAndRequestPermissions()
    }

    private fun setupWebView() {
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true

        // Attach native JavaScript bridge
        webView.addJavascriptInterface(AndroidBridge(this), "LakshmiAndroidBridge")

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = object : android.webkit.WebChromeClient() {
            override fun onPermissionRequest(request: android.webkit.PermissionRequest?) {
                // Grant microphone and audio recording permissions to the web app
                request?.grant(request.resources)
            }
        }

        // Load production URL or local bundled assets (e.g. file:///android_asset/index.html)
        // Or your deployed Netlify app URL
        val appUrl = getString(R.string.app_url)
        webView.loadUrl(appUrl)
    }

    fun requestTelephonyPermissions() {
        val permissions = mutableListOf(
            android.Manifest.permission.READ_PHONE_STATE,
            android.Manifest.permission.READ_CALL_LOG,
            android.Manifest.permission.RECORD_AUDIO
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            permissions.add(android.Manifest.permission.ANSWER_PHONE_CALLS)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(android.Manifest.permission.POST_NOTIFICATIONS)
        }

        requestPermissionLauncher.launch(permissions.toTypedArray())
    }

    fun promptDefaultDialer() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(Context.ROLE_SERVICE) as? RoleManager
            if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_DIALER)) {
                val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER)
                roleLauncher.launch(intent)
                return
            }
        }

        // Pre-Android 10
        val intent = Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
        intent.putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, packageName)
        startActivity(intent)
    }

    private fun checkAndRequestPermissions() {
        val hasPhoneState = ContextCompat.checkSelfPermission(
            this,
            android.Manifest.permission.READ_PHONE_STATE
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasPhoneState) {
            requestTelephonyPermissions()
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
