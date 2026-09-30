export const schemaSql = `
CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY,
  room_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
)
`;
