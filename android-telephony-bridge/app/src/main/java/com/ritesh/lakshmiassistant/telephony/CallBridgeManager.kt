package com.ritesh.lakshmiassistant.telephony

import android.webkit.WebView
import org.json.JSONObject
import java.lang.ref.WeakReference

/**
 * Singleton manager coordinating native telephony events with the WebView JavaScript interface.
 */
object CallBridgeManager {

    private var webViewRef: WeakReference<WebView>? = null

    fun registerWebView(webView: WebView) {
        webViewRef = WeakReference(webView)
    }

    fun notifyIncomingCall(phoneNumber: String, state: String) {
        val payload = JSONObject().apply {
            put("phoneNumber", phoneNumber)
            put("state", state)
            put("timestamp", System.currentTimeMillis())
        }
        dispatchJsEvent(payload.toString())
    }

    fun notifyCallState(phoneNumber: String, state: String) {
        val payload = JSONObject().apply {
            put("phoneNumber", phoneNumber)
            put("state", state)
            put("timestamp", System.currentTimeMillis())
        }
        dispatchJsEvent(payload.toString())
    }

    private fun dispatchJsEvent(jsonString: String) {
        webViewRef?.get()?.post {
            val script = """
                (function() {
                    try {
                        var payload = $jsonString;
                        if (window.onNativeIncomingCall) {
                            window.onNativeIncomingCall(payload);
                        }
                        var event = new CustomEvent('lakshmi:incoming_call', { detail: payload });
                        window.dispatchEvent(event);
                    } catch(e) {
                        console.error('Bridge dispatch error:', e);
                    }
                })();
            """.trimIndent()
            webViewRef?.get()?.evaluateJavascript(script, null)
        }
    }
}
