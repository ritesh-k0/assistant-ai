package com.ritesh.lakshmiassistant.telephony

import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log

/**
 * Android CallScreeningService (API 24+)
 *
 * CRITICAL ARCHITECTURAL DISTINCTION:
 * CallScreeningService allows the application to verify incoming caller ID
 * and tell Telecom whether to allow, silence, or reject the call BEFORE it rings.
 *
 * WARNING:
 * CallScreeningService CANNOT answer calls.
 * CallScreeningService CANNOT access raw call audio or provide two-way conversation.
 * Any claim that CallScreeningService alone can hold a conversation is technically false.
 */
class LakshmiCallScreeningService : CallScreeningService() {

    companion object {
        private const val TAG = "LakshmiCallScreening"
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val handle = callDetails.handle
        val phoneNumber = handle?.schemeSpecificPart ?: "Unknown"

        Log.d(TAG, "Screening incoming call: $phoneNumber")

        // Screened calls notification to web view
        CallBridgeManager.notifyIncomingCall(phoneNumber, "SCREENING")

        // Build standard screening response (do not disallow or reject unless requested)
        val response = CallResponse.Builder()
            .setDisallowCall(false)
            .setRejectCall(false)
            .setSilenceCall(false)
            .setSkipCallLog(false)
            .setSkipNotification(false)
            .build()

        respondToCall(callDetails, response)
    }
}
