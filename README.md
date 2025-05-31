# Bitcoin Bounty Job Challenge Platform

This project is a platform where companies can post interview challenges (coding tasks, data analysis problems, blockchain puzzles) with Bitcoin bounties as rewards. Developers can complete these challenges, submit their solutions via GitHub, and the best submission wins the Bitcoin bounty.

## Live Deployment

**Live Application Link:**
https://bitcoin-bounty.vercel.app/

## Features

 **Company Dashboard:**
    Post new job challenges with Bitcoin bounties.
    Review submissions from developers.
    Select a winner for the challenge.
    Mark bounties as paid (external Bitcoin transaction assumed).

 **Developer Portal:**
     Browse open bounties and challenges.
     Submit solutions via GitHub repository link and solution hash (e.g., commit hash).
     View submission status.
     Provide Bitcoin address for receiving bounties.

 **Public Auditability:**
     All significant platform actions (challenge posting, submissions, winner selection, payment confirmation) are publicly logged.

 **User Authentication:** Secure login and registration for companies and developers.

## Tech Stack

 **Frontend:** Next.js, React, TypeScript
 **Backend:** Firebase
     Firebase Authentication
     Firestore (Database)
     Firebase Cloud Functions (for backend logic like audit logging - *conceptual, can be expanded*)

 **Styling:** Tailwind CSS

* **Deployment:** Vercel
  
## Project Setup & Folder Structure
The project is structured as a standard Next.js application:

 `components/`: Reusable React components.
     `auth/`: Authentication related components.
     `bounties/`: Components for displaying and managing bounties and submissions.
     `common/`: Shared components like Layout, Navbar, Footer.
     `utils/`: Utility components like AuditLogDisplay.
 `lib/`: Helper functions, Firebase configuration, custom hooks.
     `firebase.ts`: Firebase app initialization.
     `auth.ts`: Firebase authentication logic.
     `firestore.ts`: Firestore database interaction functions.
     `hooks.ts`: Custom React hooks (e.g., `useAuth`).
 `pages/`: Next.js pages, representing routes in the application.
     `api/`: (Optional) Next.js API routes if not solely relying on Firebase Functions for backend.
 `public/`: Static assets.
 `styles/`: Global styles and CSS modules.
 `types/`: TypeScript type definitions.
 `.env.local`: Environment variables (Firebase config).

## Prerequisites

 Node.js (v18.x or later recommended)
 npm or yarn
 A Firebase project (set up Firestore, Authentication)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://bitcoin-bounty.vercel.app/
cd bitcoin-bounty-platform

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
