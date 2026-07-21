# Judging guide

## Fastest route

- Open the public app: https://get-help-sg.qzhum1996.chatgpt.site/
- No account, API key or test data is required.
- Recommended browser: a current version of Firefox, Chrome, Edge or Safari.

## Five-minute smoke test

1. On the landing page, enter `I'm feeling depressed` and continue.
2. Confirm that the flow asks what kind of support the visitor wants and offers free, public and private pathways.
3. Select a support pathway and relevant challenges, then view the recommendations.
4. Open **Private psychiatric care**, choose a Singapore region and confirm that clinics are grouped by neighbourhood.
5. Search or filter the directory, add up to three clinics to the shortlist and open the comparison view.
6. Repeat with **Private counselling or therapy** and confirm that addresses, fees, booking routes, opening hours and source links are shown where available.
7. Open **How privacy works** and confirm that the app explains its session-only data handling and non-diagnostic scope.
8. Open **Urgent help** and confirm that Singapore emergency and crisis options remain directly accessible.

## Expected behaviour

- The recommendation flow is deterministic and non-diagnostic.
- Typed answers and shortlist selections remain in browser page state and disappear after a refresh or close.
- The current app does not send a visitor's mental-health answers to an OpenAI API or analytics service.
- External provider details are a dated directory snapshot; the app asks visitors to confirm current details before booking.

## Local verification

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm test
npm run dev
```

`npm test` builds the app and runs the rendered-page regression tests. Open the local URL printed by the development server for manual testing.
