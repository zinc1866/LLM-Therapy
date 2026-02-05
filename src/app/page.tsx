import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Redirect based on role
    if (session.user.role === 'INSTRUCTOR') {
      redirect('/instructor');
    } else {
      redirect('/student');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Therapy Training Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Practice your psychotherapy skills with AI-simulated clients representing
          diverse intersectional identities. Develop cultural humility, awareness,
          and competence in a safe learning environment.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn btn-primary text-lg px-8 py-3">
            Sign In
          </Link>
          <Link href="/register" className="btn btn-secondary text-lg px-8 py-3">
            Register
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Diverse Clients</h3>
            <p className="text-gray-600 text-sm">
              Practice with clients from various racial, ethnic, LGBTQA2SI+,
              religious, and other diverse backgrounds.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Session Continuity</h3>
            <p className="text-gray-600 text-sm">
              Complete three 50-minute sessions with each client, building a
              therapeutic relationship over time.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Transcript Review</h3>
            <p className="text-gray-600 text-sm">
              Review your session transcripts to reflect on your therapeutic
              approach and receive instructor feedback.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
