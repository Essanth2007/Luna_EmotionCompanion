import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="luna-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-[-5%] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute -bottom-20 left-[-5%] h-[400px] w-[400px] rounded-full bg-blue-600/12 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </div>
            <span className="text-xl font-extrabold text-gradient">Luna</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8 md:p-10">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-white/45">Sign in to continue your wellness journey</p>
          </div>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          By signing in you agree to our{' '}
          <Link href="#" className="text-white/45 hover:text-white/60 transition-colors">Terms</Link>{' '}and{' '}
          <Link href="#" className="text-white/45 hover:text-white/60 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
