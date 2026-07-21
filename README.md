# Get Help SG

Get Help SG is a Singapore-only mental-health wayfinding website. It helps a person move from “I am not sure where to start” to a practical next step without attempting to diagnose them.

**Live demo:** https://get-help-sg.qzhum1996.chatgpt.site/

## Judge quick start

The fastest way to test Get Help SG is through the public demo above. No account, API key or test data is required.

For a focused walkthrough, follow the [judging guide](JUDGING_GUIDE.md). To run the project locally:

```bash
npm install
npm test
npm run dev
```

## What it does

- Starts with a plain-language check-in and a guided support flow.
- Detects urgent language and places Singapore emergency and 24/7 crisis options first.
- Lets people choose the support they want, including free resources, subsidised or public care, and private care.
- Considers challenges, preferred care mode, age group, funding preference and language preference.
- Recommends relevant Singapore resources using deterministic matching rather than clinical diagnosis.
- Provides separate private psychiatry and psychology, therapy and counselling directories.
- Groups clinics consistently by Singapore region and neighbourhood.
- Shows addresses, published fees, booking routes, opening hours and source links where available.
- Supports clinic search, filters, sorting, a three-clinic shortlist and side-by-side comparison.
- Keeps answers in the browser session; the current version does not create an account or send typed answers to analytics.

## Safety and scope

Get Help SG is a navigation aid, not a crisis-monitoring service, medical service or diagnostic tool. Urgent support is always available from the site header. Users are reminded to confirm fees, availability, credentials and clinic information directly before booking.

The recommendation flow is deterministic. No generative model evaluates a visitor’s mental-health text at runtime, which keeps the behaviour reviewable and avoids sending sensitive free-text answers to an external AI service.

## Run locally

### Requirements

- Node.js 22.13 or newer
- npm
- A current browser

The project is supported on Windows, macOS and Linux wherever the required Node.js version is available.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

### Validate a production build

```bash
npm test
```

This builds the app and runs the rendered-page regression tests.

## Main implementation

- `app/revised-home.tsx` contains the guided flow, safety handling, recommendation logic, clinic filters, shortlist and comparison interface.
- `app/page.tsx` contains the Singapore resource and clinic directory snapshot plus clinic detail records.
- `app/globals.css` contains the responsive visual system.
- `tests/rendered-html.test.mjs` checks the production render and important directory corrections.
- `.openai/hosting.json` connects the project to its public Sites deployment.

## How Codex was used

Codex was the implementation partner throughout the project. It accelerated:

- turning the initial conversational concept into a working responsive site;
- iterating on the triage flow, safety language, privacy copy and accessible interaction states;
- building clinic search, filters, neighbourhood grouping, shortlisting and comparison;
- normalising a large Singapore provider directory and applying detailed address and booking corrections;
- configuring Node.js and Git, writing regression tests, validating builds and publishing the app.

The human–Codex collaboration was deliberately hands-on. The project owner made the key product and editorial decisions: Singapore-only scope, non-diagnostic positioning, public/private/free care pathways, region definitions, clinic-level rather than clinician-level listings, required listing fields and individual provider corrections. Codex translated those decisions into code, highlighted inconsistencies, preserved changes across iterations and verified each release.

### How GPT-5.6 contributed

Local metadata for the core Codex project thread confirms that GPT-5.6-family models powered the work across the session. GPT-5.6 contributed to product reasoning, code generation, UX and safety-copy iteration, provider-data normalisation, regression-test design and release validation. The model was used as a development collaborator through Codex, not as a runtime mental-health decision-maker: the deployed site does not send a visitor’s answers to an OpenAI API.

## Privacy

The current app does not require a name, NRIC, phone number or diagnosis. Form answers and the shortlist are held only in page state and disappear when the page is refreshed or closed. External clinic and support links have their own privacy practices.

## Licence

This project is licensed under the [MIT License](LICENSE). Provider names, addresses and other directory details remain subject to their respective owners' rights and should be checked against the linked sources.

## Directory maintenance

Provider information changes. Listings should be treated as a dated directory snapshot, checked against official clinic pages, registries and professional directories, and reconfirmed before use. The interface labels unknown or unverified information instead of estimating it.

## Hackathon materials

- [Submission copy](SUBMISSION.md)
- [Under-three-minute demo script](DEMO_SCRIPT.md)
- [Judging and smoke-test guide](JUDGING_GUIDE.md)
- [Final submission checklist](SUBMISSION_CHECKLIST.md)
