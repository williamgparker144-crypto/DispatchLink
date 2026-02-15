import { supabase } from './supabase';

// DOT/MC Verification
export async function verifyDotMc(dotNumber?: string, mcNumber?: string) {
  const { data, error } = await supabase.functions.invoke('verify-dot-mc', {
    body: { dotNumber, mcNumber },
  });

  if (error) {
    throw new Error('Verification failed');
  }

  return data;
}

// Dispatcher Profiles
export async function getDispatchers(filters?: {
  specialties?: string[];
  search?: string;
}) {
  let query = supabase
    .from('dispatcher_profiles')
    .select(`
      *,
      user:users(*)
    `)
    .eq('verified', true);

  if (filters?.specialties && filters.specialties.length > 0) {
    query = query.overlaps('specialties', filters.specialties);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

// Carrier Profiles
export async function getCarriers(filters?: {
  equipmentTypes?: string[];
  regions?: string[];
  search?: string;
}) {
  let query = supabase
    .from('carrier_profiles')
    .select(`
      *,
      user:users(*)
    `)
    .eq('verified', true)
    .eq('available_for_dispatch', true);

  if (filters?.equipmentTypes && filters.equipmentTypes.length > 0) {
    query = query.overlaps('equipment_types', filters.equipmentTypes);
  }

  if (filters?.regions && filters.regions.length > 0) {
    query = query.overlaps('operating_regions', filters.regions);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

// Create User
export async function createUser(userData: {
  email: string;
  userType: 'dispatcher' | 'carrier' | 'broker';
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      user_type: userData.userType,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      company_name: userData.companyName,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Create Dispatcher Profile
export async function createDispatcherProfile(userId: string, profileData: {
  yearsExperience?: number;
  specialties?: string[];
  bio?: string;
}) {
  const { data, error } = await supabase
    .from('dispatcher_profiles')
    .insert({
      user_id: userId,
      years_experience: profileData.yearsExperience,
      specialties: profileData.specialties,
      bio: profileData.bio,
      subscription_tier: 'basic',
      subscription_status: 'inactive',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Create Carrier Profile
export async function createCarrierProfile(userId: string, profileData: {
  dotNumber: string;
  mcNumber: string;
  fleetSize?: number;
  equipmentTypes?: string[];
  operatingRegions?: string[];
}) {
  const { data, error } = await supabase
    .from('carrier_profiles')
    .insert({
      user_id: userId,
      dot_number: profileData.dotNumber,
      mc_number: profileData.mcNumber,
      fleet_size: profileData.fleetSize,
      equipment_types: profileData.equipmentTypes,
      operating_regions: profileData.operatingRegions,
      authority_status: 'Pending Verification',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Grant MC Permission
export async function grantMCPermission(carrierId: string, dispatcherId: string, consentSignature: string) {
  const { data, error } = await supabase
    .from('mc_permissions')
    .insert({
      carrier_id: carrierId,
      dispatcher_id: dispatcherId,
      permission_type: 'loadboard_access',
      consent_signature: consentSignature,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Revoke MC Permission
export async function revokeMCPermission(permissionId: string) {
  const { data, error } = await supabase
    .from('mc_permissions')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', permissionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Get MC Permissions for Carrier
export async function getCarrierPermissions(carrierId: string) {
  const { data, error } = await supabase
    .from('mc_permissions')
    .select(`
      *,
      dispatcher:dispatcher_profiles(
        *,
        user:users(*)
      )
    `)
    .eq('carrier_id', carrierId)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  return data;
}

// Record Legal Agreement
export async function recordLegalAgreement(userId: string, agreementType: string, version: string) {
  const { data, error } = await supabase
    .from('legal_agreements')
    .insert({
      user_id: userId,
      agreement_type: agreementType,
      agreement_version: version,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Create Subscription
export async function createSubscription(dispatcherId: string, plan: 'basic' | 'premier') {
  const price = plan === 'basic' ? 19.99 : 49.99;
  const startDate = new Date();
  const nextBillingDate = new Date(startDate);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      dispatcher_id: dispatcherId,
      plan,
      price,
      billing_cycle: 'monthly',
      start_date: startDate.toISOString().split('T')[0],
      next_billing_date: nextBillingDate.toISOString().split('T')[0],
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Update dispatcher profile subscription status
  await supabase
    .from('dispatcher_profiles')
    .update({
      subscription_tier: plan,
      subscription_status: 'active',
    })
    .eq('id', dispatcherId);

  return data;
}

// Get Intent Leads
export async function getIntentLeads(dispatcherId: string, status?: string) {
  let query = supabase
    .from('intent_leads')
    .select('*')
    .eq('assigned_to', dispatcherId);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Update Carrier Packet
export async function updateCarrierPacket(carrierId: string, updates: {
  w9Uploaded?: boolean;
  insuranceCertUploaded?: boolean;
  authorityDocUploaded?: boolean;
  signedAgreement?: boolean;
}) {
  const updateData: any = {};

  if (updates.w9Uploaded !== undefined) updateData.w9_uploaded = updates.w9Uploaded;
  if (updates.insuranceCertUploaded !== undefined) updateData.insurance_cert_uploaded = updates.insuranceCertUploaded;
  if (updates.authorityDocUploaded !== undefined) updateData.authority_doc_uploaded = updates.authorityDocUploaded;
  if (updates.signedAgreement !== undefined) {
    updateData.signed_agreement = updates.signedAgreement;
    if (updates.signedAgreement) {
      updateData.agreement_signed_at = new Date().toISOString();
    }
  }

  // Check if all documents are complete
  const allComplete = updates.w9Uploaded && updates.insuranceCertUploaded &&
                      updates.authorityDocUploaded && updates.signedAgreement;
  if (allComplete) {
    updateData.status = 'complete';
  }

  const { data, error } = await supabase
    .from('carrier_packets')
    .update(updateData)
    .eq('carrier_id', carrierId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ========================
// Social Features API
// ========================

// Posts
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPost(post: {
  content: string;
  post_type: string;
  author_id: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function likePost(postId: string, userId: string) {
  const { data, error } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unlikePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getPostComments(postId: string) {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addComment(comment: {
  post_id: string;
  author_id: string;
  content: string;
}) {
  const { data, error } = await supabase
    .from('post_comments')
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Connections
export async function sendConnectionRequest(requesterId: string, recipientId: string) {
  const { data, error } = await supabase
    .from('connections')
    .insert({
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acceptConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'rejected' })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConnections(userId: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) throw error;
  return data;
}

export async function getConnectionStatus(userId: string, otherId: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`and(requester_id.eq.${userId},recipient_id.eq.${otherId}),and(requester_id.eq.${otherId},recipient_id.eq.${userId})`)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Messages
export async function sendMessage(message: {
  conversation_id: string;
  sender_id: string;
  content: string;
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function markMessagesRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId);

  if (error) throw error;
}

// Brokers
export async function getBrokers(filters?: {
  specialties?: string[];
  regions?: string[];
  search?: string;
}) {
  let query = supabase
    .from('broker_profiles')
    .select(`
      *,
      user:users(*)
    `)
    .eq('verified', true);

  if (filters?.specialties && filters.specialties.length > 0) {
    query = query.overlaps('specialties', filters.specialties);
  }

  if (filters?.regions && filters.regions.length > 0) {
    query = query.overlaps('operating_regions', filters.regions);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function createBrokerProfile(userId: string, profileData: {
  mcNumber: string;
  specialties?: string[];
  operatingRegions?: string[];
}) {
  const { data, error } = await supabase
    .from('broker_profiles')
    .insert({
      user_id: userId,
      mc_number: profileData.mcNumber,
      specialties: profileData.specialties,
      operating_regions: profileData.operatingRegions,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// CarrierScout Invitations
export async function sendCarrierScoutInvite(data: {
  dispatcherId: string;
  carrierName: string;
  mcNumber: string;
  email: string;
  phone?: string;
  sendSms?: boolean;
  personalMessage?: string;
}) {
  const { data: result, error } = await supabase.functions.invoke('send-carrierscout-invite', {
    body: data,
  });

  if (error) throw new Error('Failed to send invitation');
  return result;
}

export async function getDispatcherInvites(dispatcherId: string) {
  const { data, error } = await supabase
    .from('carrierscout_invites')
    .select('*')
    .eq('dispatcher_id', dispatcherId)
    .order('invited_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function resendCarrierScoutInvite(inviteId: string) {
  const { data, error } = await supabase.functions.invoke('send-carrierscout-invite', {
    body: { action: 'resend', inviteId },
  });

  if (error) throw new Error('Failed to resend invitation');
  return data;
}

// CarrierScout Waitlist
export async function joinCarrierScoutWaitlist(email: string, feature: string) {
  const { data, error } = await supabase
    .from('carrierscout_waitlist')
    .upsert(
      { email, feature, signed_up_at: new Date().toISOString() },
      { onConflict: 'email,feature' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
