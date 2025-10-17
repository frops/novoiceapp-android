# Support Procedures

This guide documents the steps support agents should follow to confirm a customer's app version and apply over-the-air (OTA) updates when troubleshooting Novoice issues.

## Verifying a User's App Version

1. Ask the user to open the Novoice app and navigate to **Settings**.
2. At the bottom of the screen, capture both values shown:
   - **App version** — maps to `Application.nativeApplicationVersion` and should match the version declared in the latest store build.
   - **Build number** — maps to `Application.nativeBuildVersion` and differentiates between release candidates of the same version.
3. Record these values in the support ticket before continuing with troubleshooting.

## Prompting Users to Apply Updates

The app checks for OTA updates every time it launches and whenever it returns to the foreground. If a newer update has been published to the active channel, the user will see an in-app prompt offering to restart.

If the user declines the prompt, instruct them to close and reopen the app to trigger another check. Updates are downloaded silently and take effect once the user confirms the restart.

## Escalation Checklist

Before escalating an issue to engineering, confirm the following:

- The reported app version and build number match the most recent release or OTA deployment for the user's channel.
- The user has accepted any pending update prompt, or has force-quit/reopened the app to trigger a fresh check.
- Any reproduction steps and diagnostics include the captured version information.
