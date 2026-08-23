'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    // Placeholder for actual password reset logic
    console.log('Forgot password data:', data);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Back Link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>

              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Reset your password
                </h2>
                <p className="text-sm text-foreground/70">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-foreground/30"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white py-6 text-lg shadow-lg shadow-primary/25"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Check your email
              </h2>
              <p className="text-sm text-foreground/70">
                We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
            </div>

            {/* Back to Login */}
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-border/50 hover:bg-foreground/5"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </span>
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ForgotPasswordForm;
