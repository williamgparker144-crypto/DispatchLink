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
  userType: 'dispatcher' | 'carrier' | 'broker' | 'advertiser';
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  authId?: string;
  authProvider?: string;
  profileImageUrl?: string;
}) {
  const insertData: Record<string, unknown> = {
    email: userData.email,
    user_type: userData.userType,
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone: userData.phone,
    company_name: userData.companyName,
  };

  if (userData.authId) insertData.auth_id = userData.authId;
  if (userData.authProvider) insertData.auth_provider = userData.authProvider;
  if (userData.profileImageUrl) insertData.profile_image_url = userData.profileImageUrl;

  const { data, error } = await supabase
    .from('users')
    .insert(insertData)
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
}) {
  const { data, error } = await supabase
    .from('dispatcher_profiles')
    .insert({
      user_id: userId,
      years_experience: profileData.yearsExperience ?? 0,
      specialties: profileData.specialties ?? [],
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

// Get active MC permissions for a dispatcher (permissions granted TO this dispatcher)
export async function getDispatcherMCPermissions(dispatcherId: string) {
  const { data, error } = await supabase
    .from('mc_permissions')
    .select(`
      *,
      carrier:users!mc_permissions_carrier_id_fkey(
        id, first_name, last_name, company_name, profile_image_url,
        carrier_profiles(mc_number, dot_number, equipment_types, operating_regions)
      )
    `)
    .eq('dispatcher_id', dispatcherId)
    .order('granted_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Check if a specific dispatcher-carrier permission is active
export async function getActivePermission(dispatcherId: string, carrierId: string) {
  const { data, error } = await supabase
    .from('mc_permissions')
    .select('*')
    .eq('dispatcher_id', dispatcherId)
    .eq('carrier_id', carrierId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') {
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
export async function getPosts(currentUserId?: string) {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!author_id(first_name, last_name, company_name, user_type, profile_image_url, verified)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p: any) => p.id);

  // Batch-fetch likes, comments, and current user's likes in parallel
  const [likesRes, commentsRes, myLikesRes] = await Promise.all([
    supabase.from('post_likes').select('post_id').in('post_id', postIds),
    supabase.from('post_comments').select('post_id').in('post_id', postIds),
    currentUserId
      ? supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const likeCounts: Record<string, number> = {};
  for (const l of (likesRes.data || [])) {
    likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
  }
  const commentCounts: Record<string, number> = {};
  for (const c of (commentsRes.data || [])) {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
  }
  const likedPostIds = new Set((myLikesRes.data || []).map((l: any) => l.post_id));

  return posts.map((p: any) => {
    const author = p.author;
    return {
      id: p.id,
      author_id: p.author_id,
      author_name: author ? `${author.first_name} ${author.last_name}` : 'Unknown',
      author_company: author?.company_name || '',
      author_type: author?.user_type || 'dispatcher',
      author_image: author?.profile_image_url,
      author_verified: author?.verified || false,
      content: p.content,
      post_type: p.post_type,
      likes_count: likeCounts[p.id] || 0,
      comments_count: commentCounts[p.id] || 0,
      liked_by_current_user: likedPostIds.has(p.id),
      created_at: p.created_at,
      image_url: p.image_url,
      video_url: p.video_url,
      link_url: p.link_url,
      link_title: p.link_title,
      link_description: p.link_description,
      link_image: p.link_image,
      document_url: p.document_url,
      document_name: p.document_name,
    };
  });
}

// Get posts by a specific user
export async function getPostsByUser(authorId: string, currentUserId?: string) {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!author_id(first_name, last_name, company_name, user_type, profile_image_url, verified)
    `)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p: any) => p.id);

  const [likesRes, commentsRes, myLikesRes] = await Promise.all([
    supabase.from('post_likes').select('post_id').in('post_id', postIds),
    supabase.from('post_comments').select('post_id').in('post_id', postIds),
    currentUserId
      ? supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const likeCounts: Record<string, number> = {};
  for (const l of (likesRes.data || [])) {
    likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
  }
  const commentCounts: Record<string, number> = {};
  for (const c of (commentsRes.data || [])) {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
  }
  const likedPostIds = new Set((myLikesRes.data || []).map((l: any) => l.post_id));

  return posts.map((p: any) => {
    const author = p.author;
    return {
      id: p.id,
      author_id: p.author_id,
      author_name: author ? `${author.first_name} ${author.last_name}` : 'Unknown',
      author_company: author?.company_name || '',
      author_type: author?.user_type || 'dispatcher',
      author_image: author?.profile_image_url,
      author_verified: author?.verified || false,
      content: p.content,
      post_type: p.post_type,
      likes_count: likeCounts[p.id] || 0,
      comments_count: commentCounts[p.id] || 0,
      liked_by_current_user: likedPostIds.has(p.id),
      created_at: p.created_at,
      image_url: p.image_url,
      video_url: p.video_url,
      link_url: p.link_url,
      link_title: p.link_title,
      link_description: p.link_description,
      link_image: p.link_image,
      document_url: p.document_url,
      document_name: p.document_name,
    };
  });
}

// Get recent posts by connected users (for notifications)
export async function getConnectionFeedNotifications(userId: string, sinceTimestamp: string) {
  // Step 1: Get accepted connection IDs
  const { data: connections, error: connErr } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (connErr) throw connErr;
  if (!connections || connections.length === 0) return [];

  // Extract connected user IDs (the other side of each connection)
  const connectedIds = connections.map(c =>
    c.requester_id === userId ? c.recipient_id : c.requester_id
  );

  // Step 2: Get posts from connected users since timestamp
  const { data: posts, error: postErr } = await supabase
    .from('posts')
    .select(`
      id, author_id, content, post_type, created_at,
      author:users!author_id(first_name, last_name, company_name, user_type, profile_image_url)
    `)
    .in('author_id', connectedIds)
    .gt('created_at', sinceTimestamp)
    .order('created_at', { ascending: false })
    .limit(20);

  if (postErr) throw postErr;
  return (posts || []).map((p: any) => ({
    id: p.id,
    authorId: p.author_id,
    authorName: p.author ? `${p.author.first_name} ${p.author.last_name}` : 'Unknown',
    authorCompany: p.author?.company_name || '',
    authorType: p.author?.user_type || '',
    authorImage: p.author?.profile_image_url || '',
    content: p.content,
    postType: p.post_type,
    createdAt: p.created_at,
  }));
}

export async function createPost(post: {
  author_id: string;
  content: string;
  post_type: string;
  image_url?: string;
  video_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  link_image?: string;
  document_url?: string;
  document_name?: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
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
    .select(`
      *,
      author:users!author_id(first_name, last_name, company_name, user_type, profile_image_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    post_id: c.post_id,
    author_id: c.author_id,
    author_name: c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Unknown',
    author_company: c.author?.company_name || '',
    author_type: c.author?.user_type || 'dispatcher',
    author_image: c.author?.profile_image_url,
    content: c.content,
    created_at: c.created_at,
  }));
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

export async function uploadPostImage(userId: string, file: Blob): Promise<string> {
  const path = `post-images/${userId}/${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

// Upload a document for a post to Supabase Storage
export async function uploadPostDocument(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'pdf';
  const path = `post-documents/${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
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

export async function getPendingConnectionRequests(userId: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('recipient_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
}

export async function getSentConnectionRequests(userId: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('requester_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
}

// Messages
export async function getOrCreateConversation(userA: string, userB: string) {
  // Order deterministically so the UNIQUE constraint works
  const [participantA, participantB] = userA < userB ? [userA, userB] : [userB, userA];

  // Try to find existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(participant_a.eq.${participantA},participant_b.eq.${participantB}),and(participant_a.eq.${participantB},participant_b.eq.${participantA})`
    )
    .single();

  if (existing) return existing;

  // Create new
  const { data, error } = await supabase
    .from('conversations')
    .insert({ participant_a: participantA, participant_b: participantB })
    .select()
    .single();

  if (error) throw error;
  return data;
}

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

  // Update conversation's last_message
  await supabase
    .from('conversations')
    .update({ last_message: message.content, last_message_at: new Date().toISOString() })
    .eq('id', message.conversation_id);

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

// Get platform user counts by type (lightweight — count only, no data)
export async function getPlatformUserCounts(): Promise<{ dispatchers: number; carriers: number; brokers: number }> {
  const [d, c, b] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_type', 'dispatcher'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_type', 'carrier'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_type', 'broker'),
  ]);
  return {
    dispatchers: d.count ?? 0,
    carriers: c.count ?? 0,
    brokers: b.count ?? 0,
  };
}

// Fetch users of a given type with pagination (for browse network)
// Helper: race a promise against a timeout (prevents infinite hangs on Safari/slow networks)
function withTimeout<T>(promise: Promise<T>, ms: number, label?: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Request timed out after ${ms}ms${label ? ` (${label})` : ''}`)),
      ms
    );
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function getUsersByTypePaginated(
  userType: 'dispatcher' | 'carrier' | 'broker',
  limit: number,
  offset: number
) {
  const { data, error, count } = await withTimeout(
    supabase
      .from('users')
      .select(`
        *,
        dispatcher_profiles(*),
        carrier_profiles(*),
        broker_profiles(*)
      `, { count: 'exact' })
      .eq('user_type', userType)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1),
    12000,
    `getUsersByTypePaginated:${userType}`
  );

  if (error) throw error;
  return { data: data || [], total: count ?? 0 };
}

// Fetch all users of a given type (for directory listings)
export async function getUsersByType(userType: 'dispatcher' | 'carrier' | 'broker' | 'advertiser') {
  const { data, error } = await withTimeout(
    supabase
      .from('users')
      .select(`
        *,
        dispatcher_profiles(*),
        carrier_profiles(*),
        broker_profiles(*),
        advertiser_profiles(*)
      `)
      .eq('user_type', userType)
      .order('created_at', { ascending: false }),
    12000,
    `getUsersByType:${userType}`
  );

  if (error) throw error;
  return data;
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
  dotNumber?: string;
  specialties?: string[];
  operatingRegions?: string[];
}) {
  const { data, error } = await supabase
    .from('broker_profiles')
    .insert({
      user_id: userId,
      mc_number: profileData.mcNumber,
      dot_number: profileData.dotNumber,
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

// ========================
// User Persistence API
// ========================

// Lookup user by email with joined profile tables
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      dispatcher_profiles(*),
      carrier_profiles(*),
      broker_profiles(*),
      advertiser_profiles(*)
    `)
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Lookup user by Supabase Auth ID (auth_id column)
export async function getUserByAuthId(authId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      dispatcher_profiles(*),
      carrier_profiles(*),
      broker_profiles(*),
      advertiser_profiles(*)
    `)
    .eq('auth_id', authId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Lookup user by phone number
export async function getUserByPhone(phone: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      dispatcher_profiles(*),
      carrier_profiles(*),
      broker_profiles(*),
      advertiser_profiles(*)
    `)
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Lookup user by ID with joined profile tables
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      dispatcher_profiles(*),
      carrier_profiles(*),
      broker_profiles(*),
      advertiser_profiles(*)
    `)
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Update core user fields
export async function updateUser(userId: string, updates: Record<string, unknown>) {
  if (Object.keys(updates).length === 0) return null;
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user settings (privacy/notifications)
export async function getUserSettings(userId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('users')
    .select('settings')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return (data?.settings as Record<string, boolean>) || {};
}

// Update user settings
export async function updateUserSettings(userId: string, settings: Record<string, boolean>) {
  const { error } = await supabase
    .from('users')
    .update({ settings })
    .eq('id', userId);

  if (error) throw error;
}

// Update dispatcher-specific fields
export async function updateDispatcherProfile(userId: string, updates: Record<string, unknown>) {
  if (Object.keys(updates).length === 0) return null;
  const { data, error } = await supabase
    .from('dispatcher_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get carrier references for a dispatcher
export async function getCarrierReferences(dispatcherUserId: string) {
  const { data, error } = await supabase
    .from('carrier_references')
    .select('*')
    .eq('dispatcher_user_id', dispatcherUserId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Sync carrier references (delete + re-insert)
export async function syncCarrierReferences(
  dispatcherUserId: string,
  refs: { carrierName: string; mcNumber: string; verified: boolean; agreementFileName?: string; agreementUploadedAt?: string; agreementFileUrl?: string }[]
) {
  // Delete existing
  const { error: delError } = await supabase
    .from('carrier_references')
    .delete()
    .eq('dispatcher_user_id', dispatcherUserId);

  if (delError) throw delError;

  if (refs.length === 0) return [];

  // Insert new
  const rows = refs.map(r => ({
    dispatcher_user_id: dispatcherUserId,
    carrier_name: r.carrierName,
    mc_number: r.mcNumber,
    verified: r.verified,
    agreement_file_url: r.agreementFileUrl || null,
    agreement_file_name: r.agreementFileName || null,
    agreement_uploaded_at: r.agreementUploadedAt || null,
  }));

  const { data, error } = await supabase
    .from('carrier_references')
    .insert(rows)
    .select();

  if (error) throw error;
  return data;
}

// Upload profile image to avatars bucket
export async function uploadProfileImage(userId: string, file: File) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/profile.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Append cache-buster so browsers pick up new uploads
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  // Update user row with new URL
  await updateUser(userId, { profile_image_url: publicUrl });

  return publicUrl;
}

// Upload cover image to avatars bucket
export async function uploadCoverImage(userId: string, file: File) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/cover.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  await updateUser(userId, { cover_image_url: publicUrl });

  return publicUrl;
}

// ========================
// Advertiser & Ad Campaign API
// ========================

// Create advertiser profile
export async function createAdvertiserProfile(userId: string, profileData: {
  businessName: string;
  businessWebsite?: string;
  industry?: string;
  contactPhone?: string;
}) {
  const { data, error } = await supabase
    .from('advertiser_profiles')
    .insert({
      user_id: userId,
      business_name: profileData.businessName,
      business_website: profileData.businessWebsite || null,
      industry: profileData.industry || null,
      contact_phone: profileData.contactPhone || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update advertiser profile
export async function updateAdvertiserProfile(userId: string, updates: Record<string, unknown>) {
  if (Object.keys(updates).length === 0) return null;
  const { data, error } = await supabase
    .from('advertiser_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get ad campaigns for an advertiser
export async function getAdCampaigns(advertiserId: string) {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select(`
      *,
      ad_creatives(*)
    `)
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Create ad campaign
export async function createAdCampaign(campaign: {
  advertiserId: string;
  name: string;
  adFormat: string;
  targetUserTypes?: string[];
  targetRegions?: string[];
  budgetNotes?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .insert({
      advertiser_id: campaign.advertiserId,
      name: campaign.name,
      status: 'pending_review',
      ad_format: campaign.adFormat,
      target_user_types: campaign.targetUserTypes || [],
      target_regions: campaign.targetRegions || [],
      budget_notes: campaign.budgetNotes || null,
      start_date: campaign.startDate || null,
      end_date: campaign.endDate || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update ad campaign
export async function updateAdCampaign(campaignId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create ad creative
export async function createAdCreative(creative: {
  campaignId: string;
  headline: string;
  bodyText: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  const { data, error } = await supabase
    .from('ad_creatives')
    .insert({
      campaign_id: creative.campaignId,
      headline: creative.headline,
      body_text: creative.bodyText,
      image_url: creative.imageUrl || null,
      cta_text: creative.ctaText || 'Learn More',
      cta_url: creative.ctaUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get active ads for feed injection
export async function getActiveAdsForFeed(viewerUserType?: string) {
  let query = supabase
    .from('ad_campaigns')
    .select(`
      *,
      ad_creatives(*),
      advertiser:users!ad_campaigns_advertiser_id_fkey(
        first_name, last_name, company_name, profile_image_url
      )
    `)
    .eq('status', 'active')
    .eq('ad_format', 'feed_post');

  if (viewerUserType) {
    query = query.contains('target_user_types', [viewerUserType]);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Record ad impression or click
export async function recordAdEvent(creativeId: string, campaignId: string, viewerUserId: string | undefined, eventType: 'impression' | 'click') {
  const { error } = await supabase
    .from('ad_impressions')
    .insert({
      creative_id: creativeId,
      campaign_id: campaignId,
      viewer_user_id: viewerUserId || null,
      event_type: eventType,
    });

  if (error) console.warn('Failed to record ad event:', error);
}

// Get campaign analytics
export async function getCampaignAnalytics(campaignId: string) {
  const { data, error } = await supabase
    .from('ad_impressions')
    .select('event_type')
    .eq('campaign_id', campaignId);

  if (error) throw error;

  const impressions = data?.filter(e => e.event_type === 'impression').length || 0;
  const clicks = data?.filter(e => e.event_type === 'click').length || 0;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

  return { impressions, clicks, ctr };
}

// Upload ad creative image
export async function uploadAdCreativeImage(campaignId: string, file: File) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${campaignId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('ad-creatives')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('ad-creatives').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

// Count total unread messages for a user across all conversations
export async function getUnreadMessagesCount(userId: string) {
  const { data: convos } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`);

  if (!convos || convos.length === 0) return 0;

  const convoIds = convos.map(c => c.id);
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', convoIds)
    .neq('sender_id', userId)
    .eq('read', false);

  if (error) return 0;
  return count || 0;
}

// Count unread messages in a specific conversation for a user
export async function getUnreadCountPerConversation(conversationId: string, userId: string) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('read', false);

  if (error) return 0;
  return count || 0;
}

// Search users by name or company (for finding people to connect with)
export async function searchUsers(query: string, excludeUserId?: string) {
  const q = query.trim();
  if (q.length < 2) return [];

  // Use ilike to search first_name, last_name, or company_name
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, company_name, user_type, profile_image_url, verified')
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,company_name.ilike.%${q}%`)
    .limit(20);

  if (error) throw error;

  // Filter out the current user client-side
  if (excludeUserId) {
    return (data || []).filter((u: any) => u.id !== excludeUserId);
  }
  return data || [];
}

/** Get all users on the platform (for "Find People" default listing) */
export async function getAllUsers(excludeUserId?: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, company_name, user_type, profile_image_url, verified')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  if (excludeUserId) {
    return (data || []).filter((u: any) => u.id !== excludeUserId);
  }
  return data || [];
}

// Delete user account and all associated data
export async function deleteUserAccount(userId: string) {
  // Delete profile tables first (foreign key constraints)
  await supabase.from('dispatcher_profiles').delete().eq('user_id', userId);
  await supabase.from('carrier_profiles').delete().eq('user_id', userId);
  await supabase.from('broker_profiles').delete().eq('user_id', userId);
  await supabase.from('advertiser_profiles').delete().eq('user_id', userId);
  await supabase.from('carrier_references').delete().eq('dispatcher_user_id', userId);
  await supabase.from('connections').delete().or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);
  await supabase.from('messages').delete().eq('sender_id', userId);
  await supabase.from('conversations').delete().or(`participant_a.eq.${userId},participant_b.eq.${userId}`);
  // Also clean up posts and related social data
  await supabase.from('post_comments').delete().eq('author_id', userId);
  await supabase.from('post_likes').delete().eq('user_id', userId);
  await supabase.from('posts').delete().eq('author_id', userId);

  // Delete the user row
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;

  // Sign out of Supabase Auth to destroy the session token
  await supabase.auth.signOut();
}

// ── Profile Views ─────────────────────────────────────────────

// Record a profile view (one per viewer per viewed user per day via unique index)
export async function recordProfileView(viewedUserId: string, viewerId?: string) {
  if (!viewedUserId || viewedUserId === viewerId) return; // don't count self-views
  await supabase
    .from('profile_views')
    .insert({
      viewed_user_id: viewedUserId,
      viewer_id: viewerId || null,
    });
  // Duplicate key errors (same viewer+user+day) are silently ignored by Supabase
}

// Get total profile view count for a user
export async function getProfileViewCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('profile_views')
    .select('*', { count: 'exact', head: true })
    .eq('viewed_user_id', userId);
  if (error) return 0;
  return count || 0;
}

// ── Gallery Images ────────────────────────────────────────────

// Save gallery image URLs to user record
export async function saveGalleryImages(userId: string, urls: string[]) {
  const { error } = await supabase
    .from('users')
    .update({ gallery_images: urls })
    .eq('id', userId);
  if (error) console.warn('Failed to save gallery images:', error);
}

// Get gallery image URLs for a user
export async function getGalleryImages(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('users')
    .select('gallery_images')
    .eq('id', userId)
    .single();
  if (error || !data) return [];
  return data.gallery_images || [];
}

// Upload agreement file to agreements bucket
export async function uploadAgreementFile(userId: string, carrierMC: string, file: File) {
  const ext = file.name.split('.').pop() || 'pdf';
  const safeMC = carrierMC.replace(/[^a-zA-Z0-9]/g, '');
  const path = `${userId}/${safeMC}/agreement.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('agreements')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  return path;
}
