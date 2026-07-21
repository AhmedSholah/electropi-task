ALTER TABLE tasks ADD COLUMN assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX tasks_assignee_id_idx ON tasks(assignee_id);

CREATE INDEX tasks_assignee_status_idx ON tasks(assignee_id, status);
