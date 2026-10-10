package com.ritesh.lakshmiassistant.telephony

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.telecom.TelecomManager
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat
import com.ritesh.lakshmiassistant.MainActivity
import org.json.JSONObject

/**
 * Android JavaScriptInterface mapped into window.LakshmiAndroidBridge
 */
class AndroidBridge(private val activity: MainActivity) {

    @JavascriptInterface
    fun getBridgeStatus(): String {
        val hasPhoneState = ContextCompat.checkSelfPermission(
            activity,
            android.Manifest.permission.READ_PHONE_STATE
        ) == PackageManager.PERMISSION_GRANTED

        val telecomManager = activity.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
        val isDefaultDialer = telecomManager?.defaultDialerPackage == activity.packageName

        val json = JSONObject().apply {
            put("version", "1.0.0")
            put("hasPhonePermissions", hasPhoneState)
            put("isDefaultDialer", isDefaultDialer)
            put("canInterceptSimAudio", false)
            put(
                "audioInterceptionLimitationNotice",
                "Android sandbox prohibits non-system applications from directly recording or injecting digital audio streams into the cellular modem (VOICE_CALL). Lakshmi routes voice via loudspeaker and audio focus."
            )
        }
        return json.toString()
    }

    @JavascriptInterface
    fun requestPhonePermissions() {
        activity.runOnUiThread {
            activity.requestTelephonyPermissions()
        }
    }

    @JavascriptInterface
    fun requestDefaultDialerRole() {
        activity.runOnUiThread {
            activity.promptDefaultDialer()
        }
    }

    @JavascriptInterface
    fun answerCall(): Boolean {
        // First try InCallService if bound
        val inCallSuccess = LakshmiInCallService.answerCurrentCall()
        if (inCallSuccess) return true

        // Otherwise fallback to TelecomManager acceptRingingCall (API 26+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val telecomManager = activity.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
            if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.ANSWER_PHONE_CALLS)
                == PackageManager.PERMISSION_GRANTED
            ) {
                return try {
                    telecomManager?.acceptRingingCall()
                    true
                } catch (e: Exception) {
                    false
                }
            }
        }
        return false
    }

    @JavascriptInterface
    fun endCall(): Boolean {
        val inCallSuccess = LakshmiInCallService.endCurrentCall()
        if (inCallSuccess) return true

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val telecomManager = activity.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
            if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.ANSWER_PHONE_CALLS)
                == PackageManager.PERMISSION_GRANTED
            ) {
                return try {
                    telecomManager?.endCall()
                    true
                } catch (e: Exception) {
                    false
                }
            }
        }
        return false
    }

    @JavascriptInterface
    fun syncContacts(contactsJson: String) {
        // Can be stored in SQLite / Room or SharedPreferences for offline caller matching
    }
}
