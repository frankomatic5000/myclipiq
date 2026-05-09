-- Sprint 1 operational RLS policies
-- Authenticated internal team access; anonymous users get no policies.
-- Admin override is present on every new operational table.

-- prospects
CREATE POLICY "Team can view prospects"
  ON prospects FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Team can create prospects"
  ON prospects FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update prospects"
  ON prospects FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage prospects"
  ON prospects FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- clients
CREATE POLICY "Team can view clients"
  ON clients FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Team can create clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update clients"
  ON clients FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage clients"
  ON clients FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- posts
CREATE POLICY "Team can view posts"
  ON posts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Team can create posts"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team can update posts"
  ON posts FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage posts"
  ON posts FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- prospect_timeline_events
CREATE POLICY "Team can view prospect events"
  ON prospect_timeline_events FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_timeline_events.prospect_id)
  );

CREATE POLICY "Team can create prospect events"
  ON prospect_timeline_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_timeline_events.prospect_id)
  );

CREATE POLICY "Team can update prospect events"
  ON prospect_timeline_events FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_timeline_events.prospect_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_timeline_events.prospect_id)
  );

CREATE POLICY "Admins can manage prospect events"
  ON prospect_timeline_events FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- prospect_call_records
CREATE POLICY "Team can view prospect calls"
  ON prospect_call_records FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_call_records.prospect_id)
  );

CREATE POLICY "Team can create prospect calls"
  ON prospect_call_records FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_call_records.prospect_id)
  );

CREATE POLICY "Team can update prospect calls"
  ON prospect_call_records FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_call_records.prospect_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_call_records.prospect_id)
  );

CREATE POLICY "Admins can manage prospect calls"
  ON prospect_call_records FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- prospect_alerts
CREATE POLICY "Team can view prospect alerts"
  ON prospect_alerts FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_alerts.prospect_id)
  );

CREATE POLICY "Team can create prospect alerts"
  ON prospect_alerts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_alerts.prospect_id)
  );

CREATE POLICY "Team can resolve prospect alerts"
  ON prospect_alerts FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage prospect alerts"
  ON prospect_alerts FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- client_alerts
CREATE POLICY "Team can view client alerts"
  ON client_alerts FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_alerts.client_id)
  );

CREATE POLICY "Team can create client alerts"
  ON client_alerts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_alerts.client_id)
  );

CREATE POLICY "Team can resolve client alerts"
  ON client_alerts FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage client alerts"
  ON client_alerts FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- import_logs
CREATE POLICY "Team can view import logs"
  ON import_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Team can create import logs"
  ON import_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can manage import logs"
  ON import_logs FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
