-- Sprint 1 operational RLS policies
-- Authenticated users are scoped to owned or assigned operational rows.
-- Admin override is present on every new operational table.

-- prospects
CREATE POLICY "Team can view assigned prospects"
  ON prospects FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Team can create assigned prospects"
  ON prospects FOR INSERT TO authenticated
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Team can update assigned prospects"
  ON prospects FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Admins can manage prospects"
  ON prospects FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- clients
CREATE POLICY "Team can view owned clients"
  ON clients FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Team can create owned clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team can update owned clients"
  ON clients FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can manage clients"
  ON clients FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- posts
CREATE POLICY "Team can view owned client posts"
  ON posts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = posts.client_id
        AND clients.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team can create owned client posts"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = posts.client_id
        AND clients.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team can update owned client posts"
  ON posts FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = posts.client_id
        AND clients.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = posts.client_id
        AND clients.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage posts"
  ON posts FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- prospect_timeline_events
CREATE POLICY "Team can view assigned prospect events"
  ON prospect_timeline_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_timeline_events.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Team can create assigned prospect events"
  ON prospect_timeline_events FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_timeline_events.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Team can update assigned prospect events"
  ON prospect_timeline_events FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_timeline_events.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_timeline_events.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
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
CREATE POLICY "Team can view assigned prospect calls"
  ON prospect_call_records FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_call_records.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Team can create assigned prospect calls"
  ON prospect_call_records FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_call_records.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Team can update assigned prospect calls"
  ON prospect_call_records FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_call_records.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_call_records.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
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
CREATE POLICY "Team can view assigned prospect alerts"
  ON prospect_alerts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_alerts.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Team can create assigned prospect alerts"
  ON prospect_alerts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_alerts.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Team can resolve assigned prospect alerts"
  ON prospect_alerts FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_alerts.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM prospects
      WHERE prospects.id = prospect_alerts.prospect_id
        AND prospects.assigned_to = auth.uid()
    )
  );

CREATE POLICY "Admins can manage prospect alerts"
  ON prospect_alerts FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- client_alerts
CREATE POLICY "Team can view owned client alerts"
  ON client_alerts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = client_alerts.client_id
        AND clients.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team can create owned client alerts"
  ON client_alerts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = client_alerts.client_id
        AND clients.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team can resolve owned client alerts"
  ON client_alerts FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = client_alerts.client_id
        AND clients.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM clients
      WHERE clients.id = client_alerts.client_id
        AND clients.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage client alerts"
  ON client_alerts FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- import_logs
CREATE POLICY "Team can view own import logs"
  ON import_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team can create own import logs"
  ON import_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage import logs"
  ON import_logs FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
