import React, { useState } from 'react';
import { Rocket, Clock, CheckCircle2, Send, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
// Demo mode: supabase edge function replaced with simulated resend

interface InviteItem {
  id: string;
  carrierName: string;
  mcNumber: string;
  email: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired';
  invitedAt: string;
}

const PendingInvitesCard: React.FC = () => {
  // Sample data following the same pattern as rest of app
  const [invites] = useState<InviteItem[]>([
    {
      id: '1',
      carrierName: 'Thompson Trucking LLC',
      mcNumber: 'MC-987654',
      email: 'robert@thompsontrucking.com',
      status: 'sent',
      invitedAt: '2026-02-10T14:30:00Z',
    },
    {
      id: '2',
      carrierName: 'Garcia Freight Services',
      mcNumber: 'MC-876543',
      email: 'maria@garciafreight.com',
      status: 'pending',
      invitedAt: '2026-02-12T09:15:00Z',
    },
    {
      id: '3',
      carrierName: 'Wilson Heavy Hauling',
      mcNumber: 'MC-543210',
      email: 'mike@wilsonhh.com',
      status: 'accepted',
      invitedAt: '2026-01-28T11:00:00Z',
    },
  ]);

  const [resending, setResending] = useState<string | null>(null);

  const handleResend = async (inviteId: string) => {
    setResending(inviteId);
    // Demo mode: simulate resending invitation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResending(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
            <Send className="w-3 h-3" /> Sent
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Expired
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = invites.filter(i => i.status === 'pending' || i.status === 'sent').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3B82F6]/10 rounded-xl">
            <Rocket className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1E3A5F]">CarrierScout Invites</h3>
            <p className="text-xs text-gray-500">{pendingCount} pending invite{pendingCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-800 text-sm truncate">{invite.carrierName}</p>
                {getStatusBadge(invite.status)}
              </div>
              <p className="text-xs text-gray-500">
                {invite.mcNumber} &middot; {new Date(invite.invitedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-3 flex-shrink-0">
              {invite.status === 'expired' && (
                <button
                  onClick={() => handleResend(invite.id)}
                  disabled={resending === invite.id}
                  className="p-2 text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-colors"
                  title="Resend invitation"
                >
                  <RefreshCw className={`w-4 h-4 ${resending === invite.id ? 'animate-spin' : ''}`} />
                </button>
              )}
              {invite.status === 'accepted' && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {invites.length === 0 && (
        <div className="text-center py-6">
          <Rocket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No invitations sent yet</p>
          <p className="text-xs text-gray-400 mt-1">Invite carriers to join CarrierScout from their profile</p>
        </div>
      )}
    </div>
  );
};

export default PendingInvitesCard;
