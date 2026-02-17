import React, { useState, useEffect } from 'react';
import { UserPlus, Clock, UserCheck, Check, X, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { getConnectionStatus, sendConnectionRequest, acceptConnection, rejectConnection } from '@/lib/api';

type ConnectionState = 'none' | 'pending_sent' | 'pending_received' | 'connected';

interface ConnectionButtonProps {
  /** Smart mode: provide targetUserId and the button manages its own state */
  targetUserId?: string;
  /** Presentational mode: explicit status + handlers */
  status?: ConnectionState;
  onConnect?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  size?: 'sm' | 'md';
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  targetUserId,
  status,
  onConnect,
  onAccept,
  onReject,
  size = 'md',
}) => {
  const { currentUser } = useAppContext();
  const currentUserId = currentUser?.id || '';

  // Smart mode: internally managed state
  const [smartStatus, setSmartStatus] = useState<ConnectionState>('none');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!targetUserId);

  // Determine which mode we're in
  const isSmartMode = !!targetUserId;
  const effectiveStatus = isSmartMode ? smartStatus : (status || 'none');

  // Smart mode: fetch connection status on mount
  useEffect(() => {
    if (!isSmartMode || !currentUserId || !targetUserId) {
      setFetching(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const conn = await getConnectionStatus(currentUserId, targetUserId);
        if (cancelled) return;

        if (!conn) {
          setSmartStatus('none');
          setConnectionId(null);
        } else if (conn.status === 'accepted') {
          setSmartStatus('connected');
          setConnectionId(conn.id);
        } else if (conn.status === 'pending') {
          setConnectionId(conn.id);
          if (conn.requester_id === currentUserId) {
            setSmartStatus('pending_sent');
          } else {
            setSmartStatus('pending_received');
          }
        } else {
          // rejected or other
          setSmartStatus('none');
          setConnectionId(null);
        }
      } catch {
        // Could not fetch, default to 'none'
        if (!cancelled) setSmartStatus('none');
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isSmartMode, currentUserId, targetUserId]);

  // Sync presentational mode prop changes
  useEffect(() => {
    if (!isSmartMode && status !== undefined) {
      // no-op: effectiveStatus reads status directly
    }
  }, [status, isSmartMode]);

  const handleConnect = async () => {
    if (isSmartMode && currentUserId && targetUserId) {
      setLoading(true);
      try {
        await sendConnectionRequest(currentUserId, targetUserId);
        setSmartStatus('pending_sent');
      } catch {
        // Ignore errors silently
      } finally {
        setLoading(false);
      }
    } else {
      onConnect?.();
    }
  };

  const handleAccept = async () => {
    if (isSmartMode && connectionId) {
      setLoading(true);
      try {
        await acceptConnection(connectionId);
        setSmartStatus('connected');
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    } else {
      onAccept?.();
    }
  };

  const handleReject = async () => {
    if (isSmartMode && connectionId) {
      setLoading(true);
      try {
        await rejectConnection(connectionId);
        setSmartStatus('none');
        setConnectionId(null);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    } else {
      onReject?.();
    }
  };

  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  // Still loading connection status
  if (fetching) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-gray-50 text-gray-400 rounded-lg font-medium border border-gray-200`}>
        <Loader2 className={`${iconSize} animate-spin`} />
      </span>
    );
  }

  if (effectiveStatus === 'connected') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-green-50 text-green-700 rounded-lg font-medium border border-green-200`}>
        <UserCheck className={iconSize} />
        Connected
      </span>
    );
  }

  if (effectiveStatus === 'pending_sent') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-amber-50 text-amber-600 rounded-lg font-medium border border-amber-200`}>
        <Clock className={iconSize} />
        Pending
      </span>
    );
  }

  if (effectiveStatus === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50`}
        >
          <Check className={iconSize} />
          Accept
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50`}
        >
          <X className={iconSize} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#1E3A5F]/80 transition-colors disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : (
        <UserPlus className={iconSize} />
      )}
      Connect
    </button>
  );
};

export default ConnectionButton;
