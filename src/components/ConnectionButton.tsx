import React, { useState } from 'react';
import { UserPlus, Clock, UserCheck, Check, X } from 'lucide-react';

interface ConnectionButtonProps {
  status: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  onConnect: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  size?: 'sm' | 'md';
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  status,
  onConnect,
  onAccept,
  onReject,
  size = 'md',
}) => {
  const [localStatus, setLocalStatus] = useState(status);

  const handleConnect = () => {
    setLocalStatus('pending_sent');
    onConnect();
  };

  const handleAccept = () => {
    setLocalStatus('connected');
    onAccept?.();
  };

  const handleReject = () => {
    setLocalStatus('none');
    onReject?.();
  };

  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  if (localStatus === 'connected') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-green-50 text-green-700 rounded-lg font-medium border border-green-200`}>
        <UserCheck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        Connected
      </span>
    );
  }

  if (localStatus === 'pending_sent') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-gray-50 text-gray-500 rounded-lg font-medium border border-gray-200`}>
        <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        Pending
      </span>
    );
  }

  if (localStatus === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors`}
        >
          <Check className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          Accept
        </button>
        <button
          onClick={handleReject}
          className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors`}
        >
          <X className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#1E3A5F]/80 transition-colors`}
    >
      <UserPlus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      Connect
    </button>
  );
};

export default ConnectionButton;
