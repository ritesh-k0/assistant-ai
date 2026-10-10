// Android Native SIM Call Bridge for Lakshmi Assistant
// Supports standard window.Android bridge injection in Android WebView / Capacitor
// Handles incoming call detection, state synchronization, permissions, and fallback guidance.

export interface AndroidCallPayload {
  phoneNumber: string;
  callerName?: string;
  state: 'RINGING' | 'OFFHOOK' | 'IDLE' | 'SCREENING';
  timestamp?: number;
  simSlot?: number;
}

export interface AndroidBridgeStatus {
  isNativeAvailable: boolean;
  bridgeVersion?: string;
  hasPhonePermissions: boolean;
  isDefaultDialer: boolean;
  canInterceptSimAudio: boolean;
  audioInterceptionLimitationNotice: string;
}

declare global {
  interface Window {
    LakshmiAndroidBridge?: {
      getBridgeStatus?: () => string; // JSON string
      requestPhonePermissions?: () => void;
      requestDefaultDialerRole?: () => void;
      answerCall?: () => boolean;
      endCall?: () => boolean;
      playTtsIntoCall?: (base64Audio: string) => boolean;
      syncContacts?: (contactsJson: string) => void;
    };
  }
}

class AndroidCallBridgeService {
  private listeners: Array<(payload: AndroidCallPayload) => void> = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Listen for custom event dispatched by Android WebView evaluateJavascript
    window.addEventListener('lakshmi:incoming_call', ((event: CustomEvent<AndroidCallPayload>) => {
      if (event.detail) {
        this.notifyListeners(event.detail);
      }
    }) as EventListener);

    // Also attach global callback for legacy WebView interfaces
    (window as any).onNativeIncomingCall = (jsonStrOrObj: string | AndroidCallPayload) => {
      try {
        const payload: AndroidCallPayload =
          typeof jsonStrOrObj === 'string' ? JSON.parse(jsonStrOrObj) : jsonStrOrObj;
        this.notifyListeners(payload);
      } catch (e) {
        console.error('Failed to parse incoming native call payload:', e);
      }
    };
  }

  public getStatus(): AndroidBridgeStatus {
    const isNative = typeof window !== 'undefined' && !!window.LakshmiAndroidBridge;

    if (isNative && window.LakshmiAndroidBridge?.getBridgeStatus) {
      try {
        const statusJson = window.LakshmiAndroidBridge.getBridgeStatus();
        const parsed = JSON.parse(statusJson);
        return {
          isNativeAvailable: true,
          bridgeVersion: parsed.version || '1.0.0',
          hasPhonePermissions: !!parsed.hasPhonePermissions,
          isDefaultDialer: !!parsed.isDefaultDialer,
          canInterceptSimAudio: !!parsed.canInterceptSimAudio,
          audioInterceptionLimitationNotice:
            parsed.audioInterceptionLimitationNotice ||
            'Android restricts 3rd-party apps from capturing cellular modem audio streams without system/root privileges or default dialer telecom integration.',
        };
      } catch (err) {
        console.warn('Error reading LakshmiAndroidBridge status:', err);
      }
    }

    return {
      isNativeAvailable: isNative,
      bridgeVersion: isNative ? '1.0.0' : undefined,
      hasPhonePermissions: false,
      isDefaultDialer: false,
      canInterceptSimAudio: false,
      audioInterceptionLimitationNotice:
        'Standard Android security sandbox prevents non-system apps from directly tapping normal cellular voice modem downlink/uplink audio streams. Answering is supported via InCallService/TelecomManager when set as default dialer or via accessibility/CallScreeningService.',
    };
  }

  public requestPermissions() {
    if (window.LakshmiAndroidBridge?.requestPhonePermissions) {
      window.LakshmiAndroidBridge.requestPhonePermissions();
    } else {
      console.info('LakshmiAndroidBridge is not attached. Run inside Lakshmi Android wrapper.');
    }
  }

  public requestDefaultDialer() {
    if (window.LakshmiAndroidBridge?.requestDefaultDialerRole) {
      window.LakshmiAndroidBridge.requestDefaultDialerRole();
    } else {
      console.info('LakshmiAndroidBridge is not attached.');
    }
  }

  public answerNativeCall(): boolean {
    if (window.LakshmiAndroidBridge?.answerCall) {
      return window.LakshmiAndroidBridge.answerCall();
    }
    return false;
  }

  public endNativeCall(): boolean {
    if (window.LakshmiAndroidBridge?.endCall) {
      return window.LakshmiAndroidBridge.endCall();
    }
    return false;
  }

  public syncContactsToNative(contacts: any[]) {
    if (window.LakshmiAndroidBridge?.syncContacts) {
      try {
        window.LakshmiAndroidBridge.syncContacts(JSON.stringify(contacts));
      } catch (e) {
        console.error('Failed to sync contacts to native bridge:', e);
      }
    }
  }

  public onIncomingCall(listener: (payload: AndroidCallPayload) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(payload: AndroidCallPayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (e) {
        console.error('Error in incoming call bridge listener:', e);
      }
    });
  }
}

export const androidCallBridge = new AndroidCallBridgeService();
