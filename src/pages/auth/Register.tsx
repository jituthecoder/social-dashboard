import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  workspace_name: z.string().min(2, 'Workspace name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setApiError(null);
    try {
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        workspace_name: data.workspace_name,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        setApiError(res?.data?.message || 'Failed to create account.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Create Account</h3>
        <p className="text-xs text-slate-400">Start managing your social media in minutes</p>
      </div>

      {apiError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-400">
          {apiError}
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        placeholder="Alex Smith"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email address"
        type="email"
        placeholder="alex@w3lead.in"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Workspace Name"
        type="text"
        placeholder="Acme Marketing Team"
        error={errors.workspace_name?.message}
        {...register('workspace_name')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Repeat password"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Get Started Free
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};
