ALTER TABLE attachments ADD COLUMN timeline_id TEXT;

CREATE INDEX IF NOT EXISTS idx_attachments_timeline_id ON attachments(timeline_id);
CREATE INDEX IF NOT EXISTS idx_timelines_follow_up_date ON timelines(follow_up_date);
