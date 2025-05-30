export default function Footer() {
    return (
      <footer className="bg-gray-700 text-white text-center p-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} Bitcoin Bounty Platform. All rights reserved.</p>
        <p className="text-xs mt-1">
          Disclaimer: This platform facilitates challenge postings and submissions.
          Actual Bitcoin transactions are handled externally by users.
        </p>
      </footer>
    );
  }