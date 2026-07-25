import Navbar from '@/components/layout/Navbar';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="glass rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-gradient">Welcome back</span>
              </h1>
              <p className="text-foreground/70">
                Sign in to your Luna account
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
