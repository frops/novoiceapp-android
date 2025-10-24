# Support Procedures

This guide documents the steps support agents should follow to confirm a customer's app version and apply over-the-air (OTA) updates when troubleshooting Novoice issues.

## Verifying a User's App Version

1. Ask the user to open the Novoice app and navigate to **Settings**.
2. At the bottom of the screen, capture both values shown:
   - **App version** — maps to `Application.nativeApplicationVersion` and should match the version declared in the latest store build.
   - **Build number** — maps to `Application.nativeBuildVersion` and differentiates between release candidates of the same version.
3. Record these values in the support ticket before continuing with troubleshooting.

## Applying Updates

The app checks for OTA updates every time it launches and whenever it returns to the foreground. If a newer update has been published to the active channel, it downloads silently and is applied the next time the user relaunches the app. Ask the user to force-quit and reopen Novoice to pick up the latest bundle.

## Escalation Checklist

Before escalating an issue to engineering, confirm the following:

- The reported app version and build number match the most recent release or OTA deployment for the user's channel.
- The user has force-quit and reopened the app to trigger a fresh OTA check if an update is suspected.
- Any reproduction steps and diagnostics include the captured version information.
