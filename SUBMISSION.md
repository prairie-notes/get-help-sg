# Hackathon submission copy

## Project title

Get Help SG

## Category

**Apps for your life** — the track explicitly includes consumer health and everyday-life applications.

## One-line summary

A privacy-conscious Singapore mental-health wayfinder that turns an uncertain first message into safer, practical and locally relevant support options.

## Description

Get Help SG helps Singapore residents understand where they can start when looking for mental-health support. A guided conversational flow asks what feels most helpful, what type of access works, and which challenges are relevant. It then recommends suitable free, public or private pathways without diagnosing the visitor.

Safety is built into the experience. Language associated with immediate harm brings urgent Singapore support to the front, while emergency and 24/7 options remain available from every screen. The current flow is deterministic and keeps answers in page state; typed mental-health information is not sent to a generative model or analytics service.

For people seeking private care, Get Help SG includes separate psychiatry and psychology, therapy and counselling directories. Visitors can browse by region and neighbourhood, search clinics, filter by published fees or availability, shortlist up to three clinics and compare addresses, fees, booking routes and opening hours. Unknown information is labelled for confirmation rather than guessed, and source links make corrections auditable.

Codex accelerated product design, implementation, directory normalisation, testing and deployment. The project owner directed the safety boundaries, Singapore-only taxonomy, region classifications, content standards and provider corrections.

The core Codex project thread ran on GPT-5.6-family models. GPT-5.6 contributed product reasoning, code generation, UX and safety-copy iteration, provider-data normalisation, regression tests and release validation. It was used during development rather than at runtime, so visitors’ mental-health answers are not sent to an OpenAI API.

## Features to highlight

- Guided, non-diagnostic support triage
- Immediate safety routing and persistent urgent-help access
- Singapore-only free, public and private resources
- Psychiatry and psychology or counselling clinic finders
- Consistent region and neighbourhood grouping
- Clinic search, filters, sorting, shortlist and comparison
- Session-only data handling and plain-language privacy explanation
- Source-linked directory information and correction workflow
- Responsive and keyboard-accessible interface

## Judging and testing

- **Live app:** https://get-help-sg.qzhum1996.chatgpt.site/
- **Account required:** No
- **Suggested test:** Enter “I’m feeling depressed,” choose therapy or medical support, select an access preference and challenges, then explore a private directory, filter clinics and compare a shortlist.
- **Repository URL:** `TODO: add the GitHub repository URL`
- **Public YouTube demo:** `TODO: add the public YouTube URL`
- **Codex /feedback Session ID:** `TODO: type /, select /feedback from the Codex command menu in the core project thread, and paste the returned ID`

## GPT-5.6 model statement

Local Codex session metadata confirms GPT-5.6-family model usage throughout the core project thread. The `/feedback` Session ID supplied with the submission is the judge-facing reference for that thread.
