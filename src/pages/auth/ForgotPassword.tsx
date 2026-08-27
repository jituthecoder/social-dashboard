import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPassword: React.FC = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      const res = await authApi.forgotPassword(data.email);
      setSuccessMsg(res.message || 'Password reset link sent to your email.');
    } catch {
      setSuccessMsg('If an account exists with that email, password reset instructions have been sent.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Reset Password</h3>
        <p className="text-xs text-slate-400">Enter your account email address</p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
          {successMsg}
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        placeholder="alex@w3lead.in"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Send Reset Link
      </Button>

      <div className="text-center pt-2">
        <Link to="/login" className="text-xs text-slate-400 hover:text-white font-medium">
          ← Back to Sign In
        </Link>
      </div>
    </form>
  );
};
