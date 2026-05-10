# Manual Testing

## Simulate inbound SMS before A2P approval

Use this when Twilio A2P approval is pending and real SMS replies are blocked.
The simulator posts a signed Twilio-style webhook to your local app, so it exercises the real webhook route, AI reply generation, database writes, structured extraction, and duplicate `MessageSid` handling.

1. Start the app:

```powershell
npm run dev
```

2. Submit a test lead with the same phone number you will simulate.

3. In a second PowerShell window, run:

```powershell
npm run simulate:inbound -- --from +16195551234 --body "I need roof repair ASAP"
```

4. Reply again with the same phone number to continue the conversation:

```powershell
npm run simulate:inbound -- --from +16195551234 --body "Water is leaking into the kitchen and I own the home"
```

5. To test duplicate webhook handling, reuse the same `--sid` twice:

```powershell
npm run simulate:inbound -- --from +16195551234 --body "This is a duplicate test" --sid SM11111111111111111111111111111111
npm run simulate:inbound -- --from +16195551234 --body "This is a duplicate test" --sid SM11111111111111111111111111111111
```

Expected result: the second request returns successfully but does not create another user message or AI reply.

Notes:
- Use the phone number from an active test lead.
- The route may still attempt outbound Twilio sends. If A2P is pending, Twilio may reject delivery, but the database/AI flow can still be inspected in the dashboard.
- The script signs the request with `TWILIO_AUTH_TOKEN` from `.env.local`; do not paste that token into chat or docs.
