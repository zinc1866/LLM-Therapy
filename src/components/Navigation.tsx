'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const isInstructor = session.user.role === 'INSTRUCTOR';
  const baseUrl = isInstructor ? '/instructor' : '/student';

  const navItems = isInstructor
    ? [
        { href: '/instructor', label: 'Dashboard' },
        { href: '/instructor/clients', label: 'Clients' },
        { href: '/instructor/students', label: 'Students' },
        { href: '/instructor/transcripts', label: 'Transcripts' },
      ]
    : [
        { href: '/student', label: 'Dashboard' },
        { href: '/student/transcripts', label: 'My Transcripts' },
      ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={baseUrl} className="text-xl font-bold text-primary-600">
              Therapy Training
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name}{' '}
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {isInstructor ? 'Instructor' : 'Student'}
              </span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
