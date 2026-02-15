import React, { useState } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Permission {
  id: string;
  dispatcherName: string;
  dispatcherCompany: string;
  grantedAt: string;
  status: 'active' | 'revoked' | 'expired';
  lastActivity?: string;
}

interface PermissionsListProps {
  permissions: Permission[];
  onRevoke: (id: string) => void;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ permissions, onRevoke }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'revoked':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <X className="w-3 h-3" />
            Revoked
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const handleRevoke = (id: string) => {
    if (confirmRevoke === id) {
      onRevoke(id);
      setConfirmRevoke(null);
    } else {
      setConfirmRevoke(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1a365d]" />
          <h3 className="font-semibold text-[#1a365d]">MC# Permissions</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">Manage dispatcher access to your authority</p>
      </div>

      {permissions.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No active permissions</p>
          <p className="text-sm text-gray-400">Dispatchers you grant access to will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {permissions.map((permission) => (
            <div key={permission.id} className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === permission.id ? null : permission.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a365d]/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-[#1a365d]">
                      {permission.dispatcherName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1a365d]">{permission.dispatcherName}</h4>
                    <p className="text-sm text-gray-500">{permission.dispatcherCompany}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(permission.status)}
                  {expandedId === permission.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === permission.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Granted On</p>
                      <p className="text-sm font-medium text-[#1a365d]">{permission.grantedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Activity</p>
                      <p className="text-sm font-medium text-[#1a365d]">{permission.lastActivity || 'No activity yet'}</p>
                    </div>
                  </div>

                  {permission.status === 'active' && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        View Activity Log
                      </button>
                      {confirmRevoke === permission.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevoke(permission.id);
                            }}
                            className="py-2 px-4 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            Confirm Revoke
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmRevoke(null);
                            }}
                            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevoke(permission.id);
                          }}
                          className="py-2 px-4 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warning Notice */}
      <div className="p-4 bg-yellow-50 border-t border-yellow-100">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <p className="text-xs text-yellow-700">
            Revoking access will immediately prevent the dispatcher from booking loads using your MC#. 
            Any pending loads will not be affected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionsList;
