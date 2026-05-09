import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">You&apos;re all set!</h1>
        <p className="text-gray-500 mb-8">
          Your trial is active. Head to your dashboard to set up your lead intake widget.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
