-- Persist opt-in subscribers for Crownstroke Studio Notes.
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
