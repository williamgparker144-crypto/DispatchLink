import React, { useState, useEffect } from 'react';
import {
  Shield, Eye, EyeOff, Bell, BellOff, Lock, Globe, Users, MessageSquare,
  Mail, Phone, MapPin, Briefcase, FileText, Clock, Truck, Loader2, Check,
  ChevronRight, ArrowLeft, User,
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { getUserSettings, updateUserSettings } from '@/lib/api';

interface SettingsPageProps {
  onNavigate: (view: string) => void;
}

interface SettingsState {
  // Privacy — what others can see on your profile
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  show_bio: boolean;
  show_website: boolean;
  show_experience: boolean;
  show_specialties: boolean;
  show_carriers: boolean;
  // Profile visibility
  profile_public: boolean;
  allow_connection_requests: boolean;
  allow_messages_from_anyone: boolean;
  // Notifications
  notify_connection_requests: boolean;
  notify_feed_posts: boolean;
  notify_messages: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  show_email: false,
  show_phone: false,
  show_location: true,
  show_bio: true,
  show_website: true,
  show_experience: true,
  show_specialties: true,
  show_carriers: true,
  profile_public: true,
  allow_connection_requests: true,
  allow_messages_from_anyone: true,
  notify_connection_requests: true,
  notify_feed_posts: true,
  notify_messages: true,
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAppContext();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'privacy' | 'profile' | 'notifications'>('privacy');

  const isDispatcher = currentUser?.userType === 'dispatcher';

  // Load settings from Supabase
  useEffect(() => {
    if (!currentUser?.id) return;
    const isSupabaseId = !currentUser.id.startsWith('user-') && !currentUser.id.startsWith('seed-');
    if (!isSupabaseId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await getUserSettings(currentUser.id);
        setSettings(prev => ({ ...prev, ...data }));
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser?.id]);

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      await updateUserSettings(currentUser.id, settings as unknown as Record<string, boolean>);
      // Also persist to localStorage for fast access
      localStorage.setItem('dispatchlink_user_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <section className="page-bg min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">Sign in to access settings</h2>
            <p className="text-gray-500 mb-6">You need an account to manage your privacy and notification preferences.</p>
          </div>
        </div>
      </section>
    );
  }

  const Toggle = ({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 ${
        enabled ? 'bg-[#3B82F6]' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingRow = ({
    icon,
    label,
    description,
    settingKey,
    disabled,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    settingKey: keyof SettingsState;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <Toggle enabled={settings[settingKey]} onToggle={() => handleToggle(settingKey)} disabled={disabled} />
    </div>
  );

  const sections = [
    { id: 'privacy' as const, label: 'Privacy', icon: <Eye className="w-4 h-4" />, description: 'Control what others see' },
    { id: 'profile' as const, label: 'Profile & Access', icon: <Shield className="w-4 h-4" />, description: 'Visibility & permissions' },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" />, description: 'Manage alerts' },
  ];

  return (
    <section className="page-bg min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => onNavigate('profile')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Settings</h1>
            <p className="text-sm text-gray-500">Manage your privacy, profile visibility, and notifications</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Section Nav */}
            <div className="lg:w-56 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:sticky lg:top-24">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0 ${
                      activeSection === section.id
                        ? 'bg-[#1E3A5F]/5 text-[#1E3A5F]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeSection === section.id ? 'bg-[#1E3A5F]/10' : 'bg-gray-100'
                    }`}>
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{section.label}</p>
                      <p className="text-[10px] text-gray-400">{section.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${activeSection === section.id ? 'text-[#1E3A5F]' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              {/* Privacy Settings */}
              {activeSection === 'privacy' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-[#1E3A5F] flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Privacy Settings
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Choose what information is visible to other users on your public profile</p>
                  </div>
                  <div className="px-6">
                    <SettingRow
                      icon={<Mail className="w-4 h-4 text-gray-500" />}
                      label="Show Email Address"
                      description="Display your email on your public profile. Off by default for privacy."
                      settingKey="show_email"
                    />
                    <SettingRow
                      icon={<Phone className="w-4 h-4 text-gray-500" />}
                      label="Show Phone Number"
                      description="Display your phone number on your public profile. Off by default."
                      settingKey="show_phone"
                    />
                    <SettingRow
                      icon={<MapPin className="w-4 h-4 text-gray-500" />}
                      label="Show Location"
                      description="Display your city/state on your profile and directory cards."
                      settingKey="show_location"
                    />
                    <SettingRow
                      icon={<FileText className="w-4 h-4 text-gray-500" />}
                      label="Show Bio"
                      description="Display your bio/about section on your public profile."
                      settingKey="show_bio"
                    />
                    <SettingRow
                      icon={<Globe className="w-4 h-4 text-gray-500" />}
                      label="Show Website"
                      description="Display your website link on your public profile."
                      settingKey="show_website"
                    />
                    {isDispatcher && (
                      <>
                        <SettingRow
                          icon={<Clock className="w-4 h-4 text-gray-500" />}
                          label="Show Years of Experience"
                          description="Display how long you've been dispatching on your profile."
                          settingKey="show_experience"
                        />
                        <SettingRow
                          icon={<Briefcase className="w-4 h-4 text-gray-500" />}
                          label="Show Specialties"
                          description="Display your equipment type specialties (Flatbed, Reefer, etc.)."
                          settingKey="show_specialties"
                        />
                        <SettingRow
                          icon={<Truck className="w-4 h-4 text-gray-500" />}
                          label="Show Carriers Worked With"
                          description="Display your carrier references and MC# history."
                          settingKey="show_carriers"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Profile & Access Settings */}
              {activeSection === 'profile' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-[#1E3A5F] flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Profile & Access
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Control who can find you, connect with you, and send you messages</p>
                  </div>
                  <div className="px-6">
                    <SettingRow
                      icon={<Globe className="w-4 h-4 text-gray-500" />}
                      label="Public Profile"
                      description="When on, anyone can view your profile. When off, only your connections can see it."
                      settingKey="profile_public"
                    />
                    <SettingRow
                      icon={<Users className="w-4 h-4 text-gray-500" />}
                      label="Allow Connection Requests"
                      description="When off, no one can send you new connection requests."
                      settingKey="allow_connection_requests"
                    />
                    <SettingRow
                      icon={<MessageSquare className="w-4 h-4 text-gray-500" />}
                      label="Allow Messages from Anyone"
                      description="When off, only your connections can send you messages."
                      settingKey="allow_messages_from_anyone"
                    />
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-[#1E3A5F] flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Choose which notifications appear in your notification bell</p>
                  </div>
                  <div className="px-6">
                    <SettingRow
                      icon={<Users className="w-4 h-4 text-gray-500" />}
                      label="Connection Requests"
                      description="Get notified when someone sends you a connection request."
                      settingKey="notify_connection_requests"
                    />
                    <SettingRow
                      icon={<FileText className="w-4 h-4 text-gray-500" />}
                      label="Feed Activity"
                      description="Get notified when your connections post updates to the feed."
                      settingKey="notify_feed_posts"
                    />
                    <SettingRow
                      icon={<MessageSquare className="w-4 h-4 text-gray-500" />}
                      label="New Messages"
                      description="Get notified when you receive new messages."
                      settingKey="notify_messages"
                    />
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium animate-fade-in">
                      <Check className="w-4 h-4" />
                      Settings saved
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#1E3A5F] text-white rounded-xl font-medium text-sm hover:bg-[#1E3A5F]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

              {/* Account Info */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-800">{currentUser.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-800">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Account Type</span>
                    <span className="font-medium text-gray-800 capitalize">{currentUser.userType}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="px-4 py-2 text-sm font-medium text-[#1E3A5F] bg-[#1E3A5F]/5 rounded-lg hover:bg-[#1E3A5F]/10 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SettingsPage;
