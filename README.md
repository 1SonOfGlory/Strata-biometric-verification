# Strata | Biometric Content Verification Layer

**Strata** is a browser-based forensic environment designed to ensure academic and editorial integrity. Unlike traditional plagiarism checkers that scan for matching text, Strata analyzes the *process* of writing itself.

## Features

- **Biometric Keystroke Dynamics:** Tracks the rhythm of authorship (bursts, pauses, edits) to distinguish human writing from AI generation.
- **Secure Shadow-DOM Overlay:** Injects a protected writing environment over any webpage (Google Docs, Word Online) without CSS conflict.
- **Forensic Visualization:**
  - 🟢 **Clean Text:** Typed organically.
  - 🔵 **Edited Text:** Human corrections and rewrites.
  - 🔴 **Pasted Text:** External sources (flagged for review).
- **Session Replay:** A DVR-style playback engine to review the exact creation timeline of the document.

## 🛠 Tech Stack

- **Core:** Vanilla JavaScript (ES6+)
- **Architecture:** Chrome Extension (Manifest V3)
- **UI Isolation:** Shadow DOM
- **Storage:** Local Session State (Privacy-first)

## 📦 Installation (Developer Mode)

1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer Mode** (top right).
4. Click **Load Unpacked** and select the folder.
5. Click the Strata icon on any webpage to launch the secure environment.

---
*Built by Jabess Omane *
