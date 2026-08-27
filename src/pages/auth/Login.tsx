import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setApiError(null);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        setApiError(res?.data?.message || 'Failed to login. Please check your credentials.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Sign In</h3>
        <p className="text-xs text-slate-400">Access your workspace and social accounts</p>
      </div>

      {apiError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-400">
          {apiError}
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        placeholder="alex@w3lead.in"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center text-xs text-slate-400 cursor-pointer">
          <input type="checkbox" className="rounded border-slate-800 bg-slate-900 text-indigo-600 mr-2" />
          Remember me
        </label>
        <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline font-medium">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Sign In
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
};
