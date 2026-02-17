-- 005: connections, conversations, messages tables

-- ========================
-- Connections
-- ========================
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, recipient_id)
);

CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own connections"
  ON connections FOR SELECT
  USING (auth.uid()::text = requester_id::text OR auth.uid()::text = recipient_id::text);

CREATE POLICY "Users can insert connections as requester"
  ON connections FOR INSERT
  WITH CHECK (auth.uid()::text = requester_id::text);

CREATE POLICY "Recipients can update connection status"
  ON connections FOR UPDATE
  USING (auth.uid()::text = recipient_id::text);

-- ========================
-- Conversations
-- ========================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (participant_a, participant_b)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read their conversations"
  ON conversations FOR SELECT
  USING (auth.uid()::text = participant_a::text OR auth.uid()::text = participant_b::text);

CREATE POLICY "Participants can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid()::text = participant_a::text OR auth.uid()::text = participant_b::text);

CREATE POLICY "Participants can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid()::text = participant_a::text OR auth.uid()::text = participant_b::text);

-- ========================
-- Messages
-- ========================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid()::text = c.participant_a::text OR auth.uid()::text = c.participant_b::text)
    )
  );

CREATE POLICY "Conversation participants can insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid()::text = sender_id::text
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid()::text = c.participant_a::text OR auth.uid()::text = c.participant_b::text)
    )
  );
