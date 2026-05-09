-- Sprint 1 operational schema: add prospect conversion FK after clients exists
-- Additive only; no projects.customer_id change.

ALTER TABLE prospects
  ADD CONSTRAINT prospects_converted_to_client_id_fkey
  FOREIGN KEY (converted_to_client_id)
  REFERENCES clients(id)
  ON DELETE SET NULL;
