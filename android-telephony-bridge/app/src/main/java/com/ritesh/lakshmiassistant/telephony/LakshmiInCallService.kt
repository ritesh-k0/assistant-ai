package com.ritesh.lakshmiassistant.telephony

import android.os.Build
import android.telecom.Call
import android.telecom.CallAudioState
import android.telecom.InCallService
import android.util.Log

/**
 * Android InCallService (API 23+)
 *
 * This service is bound by Android Telecom framework when Lakshmi Assistant
 * is designated as the Default Phone / Dialer App.
 *
 * CAPABILITIES:
 * - Programmatically answers incoming SIM cellular calls via call.answer(videoState)
 * - Programmatically rejects/disconnects calls via call.disconnect()
 * - Controls audio routing (earpiece, speakerphone, bluetooth)
 *
 * CELLULAR AUDIO REALITY:
 * - Third-party Android apps CANNOT inject artificial audio directly into the cellular modem uplink
 *   or capture modem downlink audio digitally without system-level permissions.
 * - For voice interaction on normal consumer Android devices, Lakshmi activates Speakerphone mode
 *   (setAudioRoute(CallAudioState.ROUTE_SPEAKER)) so the phone's physical microphone and loudspeaker
 *   permit conversational speech interaction.
 */
class LakshmiInCallService : InCallService() {

    companion object {
        private const val TAG = "LakshmiInCallService"
        var currentActiveCall: Call? = null

        fun answerCurrentCall(): Boolean {
            return try {
                currentActiveCall?.let {
                    it.answer(android.telecom.VideoProfile.STATE_AUDIO_ONLY)
                    Log.i(TAG, "Successfully answered incoming call via InCallService")
                    true
                } ?: false
            } catch (e: Exception) {
                Log.e(TAG, "Error answering call: ${e.message}")
                false
            }
        }

        fun endCurrentCall(): Boolean {
            return try {
                currentActiveCall?.let {
                    it.disconnect()
                    Log.i(TAG, "Successfully disconnected call via InCallService")
                    true
                } ?: false
            } catch (e: Exception) {
                Log.e(TAG, "Error ending call: ${e.message}")
                false
            }
        }
    }

    private val callCallback = object : Call.Callback() {
        override fun onStateChanged(call: Call, state: Int) {
            super.onStateChanged(call, state)
            val number = call.details?.handle?.schemeSpecificPart ?: "Unknown"

            when (state) {
                Call.STATE_RINGING -> {
                    Log.d(TAG, "InCallService: Ringing from $number")
                    CallBridgeManager.notifyIncomingCall(number, "RINGING")
                }
                Call.STATE_ACTIVE -> {
                    Log.d(TAG, "InCallService: Active (Offhook)")
                    CallBridgeManager.notifyCallState(number, "OFFHOOK")
                    // Switch to speakerphone so ambient voice interaction works
                    setAudioRoute(CallAudioState.ROUTE_SPEAKER)
                }
                Call.STATE_DISCONNECTED -> {
                    Log.d(TAG, "InCallService: Disconnected")
                    CallBridgeManager.notifyCallState(number, "IDLE")
                    currentActiveCall = null
                }
            }
        }
    }

    override fun onCallAdded(call: Call) {
        super.onCallAdded(call)
        currentActiveCall = call
        call.registerCallback(callCallback)

        val number = call.details?.handle?.schemeSpecificPart ?: "Unknown"
        Log.i(TAG, "onCallAdded: Incoming Call Registered for $number, state=${call.state}")

        if (call.state == Call.STATE_RINGING) {
            CallBridgeManager.notifyIncomingCall(number, "RINGING")
        }
    }

    override fun onCallRemoved(call: Call) {
        super.onCallRemoved(call)
        call.unregisterCallback(callCallback)
        if (currentActiveCall == call) {
            currentActiveCall = null
        }
    }
}
