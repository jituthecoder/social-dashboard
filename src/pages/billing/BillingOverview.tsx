import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../../api/subscriptions';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Check, CreditCard, Zap } from 'lucide-react';

export const BillingOverview: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  const { data: usageRes, isLoading: loadingUsage } = useQuery({
    queryKey: ['usage', activeWorkspace?.id],
    queryFn: () => subscriptionsApi.getUsage(),
    enabled: !!activeWorkspace,
  });

  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionsApi.getPlans(),
  });

  const subscription = usageRes?.data?.subscription;
  const usage = usageRes?.data?.usage;
  const plans = plansRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Subscription & Billing</h2>
        <p className="text-xs text-slate-400">Manage plan tier, usage limits, and active features</p>
      </div>

      {/* Usage Summary Card */}
      <Card className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/20 border-indigo-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Active Workspace Subscription
            </span>
            <h3 className="text-lg font-bold text-white">
              {subscription?.plan?.name || 'Free Trial Tier'}
            </h3>
          </div>
          <Badge variant="success">Status: Active</Badge>
        </div>

        {loadingUsage ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">AI Generations Used</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {usage?.ai_generations || 0} / {subscription?.plan?.limits?.ai_generations || 10}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Posts Published (This Month)</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {usage?.posts_published || 0} / {subscription?.plan?.limits?.posts_published || 30}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Connected Channels</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {usage?.social_accounts || 0} / {subscription?.plan?.limits?.social_accounts || 3}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Subscription Tier Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Available Subscription Plans
        </h3>

        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isCurrent = subscription?.plan?.id === p.id || (p.slug === 'free' && !subscription);
              return (
                <Card key={p.id} hoverEffect className={`space-y-4 flex flex-col justify-between ${isCurrent ? 'border-indigo-500/50 ring-1 ring-indigo-500/30' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{p.name}</h4>
                      {isCurrent && <Badge variant="purple">Current</Badge>}
                    </div>

                    <div>
                      <span className="text-3xl font-extrabold text-white">${p.price_monthly}</span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Up to {p.limits?.social_accounts || 3} Social Accounts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{p.limits?.posts_published || 30} Posts per Month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{p.limits?.ai_generations || 10} AI Generations</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={isCurrent ? 'outline' : 'primary'}
                    disabled={isCurrent}
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    onClick={() => alert('Payment Gateway Integration Ready (Stripe/Razorpay Architecture).')}
                  >
                    {isCurrent ? 'Active Plan' : 'Select Plan'}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
