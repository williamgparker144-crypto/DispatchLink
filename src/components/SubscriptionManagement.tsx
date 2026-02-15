import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CreditCard,
  Calendar,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Crown,
  Zap,
  RefreshCw,
  FileText,
  ExternalLink,
  Shield,
  Clock,
  ChevronRight
} from 'lucide-react';

interface SubscriptionManagementProps {
  onBack: () => void;
}

interface SubscriptionData {
  id: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  price: number;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
}

interface Invoice {
  id: string;
  amount_paid: number;
  status: string;
  created: number;
  invoice_pdf: string;
  hosted_invoice_url: string;
}

const PLANS = {
  basic: {
    name: 'Basic Dispatcher',
    price: 19.99,
    icon: Zap,
    color: '#1a365d'
  },
  premier: {
    name: 'Premier Dispatcher',
    price: 49.99,
    icon: Crown,
    color: '#ff6b35'
  }
};

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);

  // Demo subscription data for display purposes
  useEffect(() => {
    // Simulate loading subscription data
    setTimeout(() => {
      setSubscription({
        id: 'sub_demo123',
        planId: 'premier',
        planName: 'Premier Dispatcher',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        price: 49.99,
        stripeSubscriptionId: 'sub_demo123',
        stripeCustomerId: 'cus_demo123'
      });
      setInvoices([
        {
          id: 'inv_1',
          amount_paid: 4999,
          status: 'paid',
          created: Date.now() / 1000 - 30 * 24 * 60 * 60,
          invoice_pdf: '#',
          hosted_invoice_url: '#'
        },
        {
          id: 'inv_2',
          amount_paid: 4999,
          status: 'paid',
          created: Date.now() / 1000 - 60 * 24 * 60 * 60,
          invoice_pdf: '#',
          hosted_invoice_url: '#'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleManageBilling = async () => {
    setActionLoading('billing');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'create-portal-session',
          customerId: subscription?.stripeCustomerId,
          successUrl: window.location.href
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading('cancel');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'cancel-subscription',
          subscriptionId: subscription?.stripeSubscriptionId
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.subscription) {
        setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
        setSuccess('Your subscription will be canceled at the end of the current billing period.');
        setShowCancelConfirm(false);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'reactivate-subscription',
          subscriptionId: subscription?.stripeSubscriptionId
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.subscription) {
        setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: false } : null);
        setSuccess('Your subscription has been reactivated!');
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePlan = async (newPlanId: 'basic' | 'premier') => {
    if (newPlanId === subscription?.planId) {
      setShowChangePlan(false);
      return;
    }

    setActionLoading('change');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'change-plan',
          subscriptionId: subscription?.stripeSubscriptionId,
          planId: newPlanId
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.subscription) {
        const newPlan = PLANS[newPlanId];
        setSubscription(prev => prev ? {
          ...prev,
          planId: newPlanId,
          planName: newPlan.name,
          price: newPlan.price
        } : null);
        setSuccess(`Your plan has been changed to ${newPlan.name}!`);
        setShowChangePlan(false);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change plan');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#ff6b35] mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription ? PLANS[subscription.planId as keyof typeof PLANS] : null;
  const PlanIcon = currentPlan?.icon || Zap;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1a365d] hover:text-[#ff6b35] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-[#1a365d] mb-8">Subscription Management</h1>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5 text-red-400 hover:text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 font-medium">Success</p>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X className="w-5 h-5 text-green-400 hover:text-green-600" />
            </button>
          </div>
        )}

        {!subscription ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1a365d] mb-2">No Active Subscription</h2>
            <p className="text-gray-600 mb-6">
              You don't have an active subscription. Choose a plan to get started.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#ff6b35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-colors"
            >
              View Plans
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`p-6 ${subscription.planId === 'premier' ? 'bg-[#1a365d]' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${subscription.planId === 'premier' ? 'bg-[#ff6b35]/20' : 'bg-[#1a365d]/10'}`}>
                      <PlanIcon className={`w-6 h-6 ${subscription.planId === 'premier' ? 'text-[#ff6b35]' : 'text-[#1a365d]'}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${subscription.planId === 'premier' ? 'text-white' : 'text-[#1a365d]'}`}>
                        {subscription.planName}
                      </h2>
                      <p className={subscription.planId === 'premier' ? 'text-gray-300' : 'text-gray-500'}>
                        ${subscription.price}/month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscription.cancelAtPeriodEnd ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Canceling
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {subscription.cancelAtPeriodEnd && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium">Subscription Ending</p>
                        <p className="text-yellow-700 text-sm">
                          Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                          You'll lose access to premium features after this date.
                        </p>
                        <button
                          onClick={handleReactivateSubscription}
                          disabled={actionLoading === 'reactivate'}
                          className="mt-2 text-sm text-[#ff6b35] font-medium hover:underline flex items-center gap-1"
                        >
                          {actionLoading === 'reactivate' ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Reactivating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              Reactivate Subscription
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Next billing date</p>
                      <p className="font-medium text-[#1a365d]">
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Payment method</p>
                      <p className="font-medium text-[#1a365d]">•••• •••• •••• 4242</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#1a365d] mb-4">Manage Subscription</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowChangePlan(true)}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#ff6b35] hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-[#1a365d]" />
                    <div className="text-left">
                      <p className="font-medium text-[#1a365d]">Change Plan</p>
                      <p className="text-sm text-gray-500">Upgrade or downgrade your subscription</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'billing'}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#ff6b35] hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#1a365d]" />
                    <div className="text-left">
                      <p className="font-medium text-[#1a365d]">Update Payment Method</p>
                      <p className="text-sm text-gray-500">Change your card or billing details</p>
                    </div>
                  </div>
                  {actionLoading === 'billing' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#ff6b35]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {!subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <X className="w-5 h-5 text-red-500" />
                      <div className="text-left">
                        <p className="font-medium text-red-600">Cancel Subscription</p>
                        <p className="text-sm text-gray-500">End your subscription at period end</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#1a365d] mb-4">Billing History</h3>
              
              {invoices.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No invoices yet</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-[#1a365d]">
                            ${(invoice.amount_paid / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTimestamp(invoice.created)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status}
                        </span>
                        <a
                          href={invoice.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff6b35] hover:text-[#e55a2b]"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#1a365d] mb-2">Cancel Subscription?</h3>
                <p className="text-gray-600">
                  Are you sure you want to cancel? You'll lose access to premium features at the end of your billing period.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Your subscription will remain active until:</strong>
                </p>
                <p className="text-lg font-semibold text-[#1a365d]">
                  {subscription && formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading === 'cancel'}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'cancel' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Plan Modal */}
        {showChangePlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-[#1a365d] mb-6">Change Your Plan</h3>

              <div className="space-y-4 mb-6">
                {Object.entries(PLANS).map(([id, plan]) => {
                  const Icon = plan.icon;
                  const isCurrentPlan = id === subscription?.planId;
                  
                  return (
                    <button
                      key={id}
                      onClick={() => !isCurrentPlan && handleChangePlan(id as 'basic' | 'premier')}
                      disabled={isCurrentPlan || actionLoading === 'change'}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isCurrentPlan
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-[#ff6b35]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${id === 'premier' ? 'bg-[#ff6b35]/10' : 'bg-[#1a365d]/10'}`}>
                            <Icon className={`w-5 h-5 ${id === 'premier' ? 'text-[#ff6b35]' : 'text-[#1a365d]'}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-[#1a365d]">{plan.name}</p>
                            <p className="text-sm text-gray-500">${plan.price}/month</p>
                          </div>
                        </div>
                        {isCurrentPlan && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Current
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {actionLoading === 'change' && (
                <div className="flex items-center justify-center gap-2 text-[#ff6b35] mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating your plan...</span>
                </div>
              )}

              <button
                onClick={() => setShowChangePlan(false)}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
