package com.ritesh.lakshmiassistant.telephony

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log

/**
 * BroadcastReceiver triggered whenever cellular SIM call state transitions:
 * - EXTRA_STATE_RINGING (Incoming call with incomingNumber)
 * - EXTRA_STATE_OFFHOOK (Call picked up)
 * - EXTRA_STATE_IDLE (Call ended/declined/missed)
 */
class CallReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "LakshmiCallReceiver"
        var lastState = TelephonyManager.CALL_STATE_IDLE
        var savedNumber: String? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

            Log.d(TAG, "Telephony State Changed: $stateStr, Number: $incomingNumber")

            val state = when (stateStr) {
                TelephonyManager.EXTRA_STATE_RINGING -> TelephonyManager.CALL_STATE_RINGING
                TelephonyManager.EXTRA_STATE_OFFHOOK -> TelephonyManager.CALL_STATE_OFFHOOK
                TelephonyManager.EXTRA_STATE_IDLE -> TelephonyManager.CALL_STATE_IDLE
                else -> TelephonyManager.CALL_STATE_IDLE
            }

            onCustomCallStateChanged(context, state, incomingNumber)
        }
    }

    private fun onCustomCallStateChanged(context: Context, state: Int, incomingNumber: String?) {
        if (lastState == state) {
            return
        }

        when (state) {
            TelephonyManager.CALL_STATE_RINGING -> {
                savedNumber = incomingNumber
                Log.i(TAG, "INCOMING SIM CALL RINGING: $incomingNumber")
                // Notify the WebView JavaScript bridge
                CallBridgeManager.notifyIncomingCall(incomingNumber ?: "Unknown", "RINGING")
            }

            TelephonyManager.CALL_STATE_OFFHOOK -> {
                Log.i(TAG, "CALL ANSWERED / OFFHOOK")
                CallBridgeManager.notifyCallState(savedNumber ?: "Unknown", "OFFHOOK")
            }

            TelephonyManager.CALL_STATE_IDLE -> {
                Log.i(TAG, "CALL TERMINATED / IDLE")
                CallBridgeManager.notifyCallState(savedNumber ?: "Unknown", "IDLE")
                savedNumber = null
            }
        }

        lastState = state
    }
}
