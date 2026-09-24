import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../../api/subscriptions';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Check, CreditCard, Zap, ShieldCheck } from 'lucide-react';
import { loadRazorpayScript } from '../../lib/razorpay';

export const BillingOverview: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleSubscribe = async (planId: number, planName: string) => {
    try {
      setLoadingPlanId(planId);
      setStatusMessage(null);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setStatusMessage({ type: 'error', text: 'Failed to load Razorpay payment gateway SDK. Please check your internet connection.' });
        setLoadingPlanId(null);
        return;
      }

      const orderRes = await subscriptionsApi.createOrder({
        plan_id: planId,
        billing_cycle: billingCycle,
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const orderData = orderRes.data;

      const options = {
        key: orderData.razorpay_key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'A4AutoPost',
        description: `Upgrade to ${planName} (${billingCycle} subscription)`,
        order_id: orderData.order_id,
        handler: async (paymentResponse: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await subscriptionsApi.verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyRes.success) {
              setStatusMessage({ type: 'success', text: `Successfully upgraded to ${planName}!` });
              queryClient.invalidateQueries({ queryKey: ['usage'] });
            } else {
              setStatusMessage({ type: 'error', text: verifyRes.message || 'Payment verification failed' });
            }
          } catch (err: any) {
            setStatusMessage({ type: 'error', text: err?.response?.data?.message || err?.message || 'Payment verification failed' });
          } finally {
            setLoadingPlanId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
          },
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.response?.data?.message || err?.message || 'Error initiating Razorpay checkout' });
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Subscription & Billing</h2>
          <p className="text-xs text-slate-400">Manage plan tier, usage limits, and active features</p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Yearly Billing
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      <Card className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/20 border-indigo-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Active Workspace Subscription
            </span>
            <h3 className="text-lg font-bold text-white">
              {subscription?.plan?.name || 'Free Plan'}
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
              const isFree = p.price_monthly === 0;
              const price = billingCycle === 'yearly' ? (p.price_yearly ?? p.price_monthly * 10) : p.price_monthly;
              const isLoading = loadingPlanId === p.id;

              return (
                <Card
                  key={p.id}
                  hoverEffect
                  className={`space-y-4 flex flex-col justify-between ${
                    isCurrent ? 'border-indigo-500/50 ring-1 ring-indigo-500/30 bg-indigo-950/10' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{p.name}</h4>
                      {isCurrent && <Badge variant="purple">Current Plan</Badge>}
                    </div>

                    <div>
                      <span className="text-3xl font-extrabold text-white">?{price}</span>
                      <span className="text-xs text-slate-400"> /{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
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
                    disabled={isCurrent || isFree || isLoading}
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    onClick={() => handleSubscribe(p.id, p.name)}
                  >
                    {isLoading
                      ? 'Processing...'
                      : isCurrent
                      ? 'Active Plan'
                      : isFree
                      ? 'Default Tier'
                      : `Upgrade to ${p.name}`}
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
