import { pool } from './db/pool.js';

export async function logActivity(userId, eventType, metadata = {}, req = null) {
  try {
    await pool.query(
      `INSERT INTO user_activity (user_id, event_type, metadata, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        userId,
        eventType,
        JSON.stringify(metadata),
        req?.ip || req?.headers?.['x-forwarded-for'] || null,
        req?.headers?.['user-agent']?.substring(0, 512) || null,
      ]
    );
  } catch (e) {
    console.error('activity log failed:', e.code || 'unknown');
  }
}
