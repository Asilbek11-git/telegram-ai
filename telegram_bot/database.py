"""
Ma'lumotlar bazasi moduli (aiosqlite asosida).
Suhbatlar tarixi (oxirgi 30 ta xabar), chat eslatmalari (xotira), 30 daqiqalik pauzalar,
bot holati va statistikani boshqaradi.
"""

import time
import aiosqlite
from typing import List, Dict, Optional, Tuple


class Database:
    def __init__(self, db_path: str = "business_bot.db"):
        self.db_path = db_path

    async def init(self):
        """Jadvallarni yaratish va dastlabki sozlash."""
        async with aiosqlite.connect(self.db_path) as db:
            # Xabarlar tarixi jadvali (oxirgi 30 ta xabar uchun)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_id INTEGER NOT NULL,
                    sender_id INTEGER NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp REAL NOT NULL
                )
            """)
            await db.execute("CREATE INDEX IF NOT EXISTS idx_chat_time ON messages(chat_id, timestamp DESC)")

            # Chatlar xotirasi (suhbatdosh ismi va muhokama qilingan mavzular xulosasi)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS chat_notes (
                    chat_id INTEGER PRIMARY KEY,
                    user_name TEXT,
                    topics_summary TEXT,
                    updated_at REAL NOT NULL
                )
            """)

            # Chatlar pauzasi jadvali (Egasi yozganda 30 daqiqa yoki manual)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS chat_pauses (
                    chat_id INTEGER PRIMARY KEY,
                    paused_until REAL NOT NULL,
                    reason TEXT DEFAULT 'owner_takeover'
                )
            """)

            # Bot umumiy holati (on/off)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS bot_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            """)
            await db.execute("""
                INSERT OR IGNORE INTO bot_settings (key, value)
                VALUES ('is_active', '1')
            """)

            # Business ulanishlar
            await db.execute("""
                CREATE TABLE IF NOT EXISTS business_connections (
                    connection_id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    can_reply INTEGER NOT NULL,
                    is_enabled INTEGER NOT NULL,
                    updated_at REAL NOT NULL
                )
            """)
            await db.commit()

    async def is_bot_active(self) -> bool:
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT value FROM bot_settings WHERE key = 'is_active'") as cursor:
                row = await cursor.fetchone()
                return row is not None and row[0] == '1'

    async def set_bot_active(self, active: bool):
        val = '1' if active else '0'
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO bot_settings (key, value) VALUES ('is_active', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
                (val, val)
            )
            await db.commit()

    async def save_message(self, chat_id: int, sender_id: int, role: str, content: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO messages (chat_id, sender_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
                (chat_id, sender_id, role, content, time.time())
            )
            await db.commit()

    async def get_recent_history(self, chat_id: int, limit: int = 30) -> List[Dict[str, str]]:
        """Chat uchun oxirgi 30 ta xabarlar tarixini olish."""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("""
                SELECT role, content FROM (
                    SELECT role, content, timestamp FROM messages
                    WHERE chat_id = ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                ) ORDER BY timestamp ASC
            """, (chat_id, limit)) as cursor:
                rows = await cursor.fetchall()
                return [{"role": r[0], "content": r[1]} for r in rows]

    async def get_chat_notes(self, chat_id: int) -> Optional[Dict[str, str]]:
        """Suhbatdosh ismi va avvalgi mavzular eslatmasini olish."""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT user_name, topics_summary FROM chat_notes WHERE chat_id = ?",
                (chat_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return {"user_name": row[0] or "", "topics_summary": row[1] or ""}
                return None

    async def update_chat_notes(self, chat_id: int, user_name: str, topics_summary: str):
        """Chat xotirasini yangilash."""
        now = time.time()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO chat_notes (chat_id, user_name, topics_summary, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(chat_id) DO UPDATE SET
                    user_name = COALESCE(?, user_name),
                    topics_summary = ?,
                    updated_at = ?
            """, (chat_id, user_name, topics_summary, now, user_name, topics_summary, now))
            await db.commit()

    async def set_chat_pause(self, chat_id: int, duration_minutes: int = 30, reason: str = "owner_takeover"):
        paused_until = time.time() + (duration_minutes * 60)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO chat_pauses (chat_id, paused_until, reason)
                VALUES (?, ?, ?)
                ON CONFLICT(chat_id) DO UPDATE SET paused_until = ?, reason = ?
            """, (chat_id, paused_until, reason, paused_until, reason))
            await db.commit()

    async def resume_chat(self, chat_id: int):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM chat_pauses WHERE chat_id = ?", (chat_id,))
            await db.commit()

    async def is_chat_paused(self, chat_id: int) -> Tuple[bool, Optional[int]]:
        now = time.time()
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT paused_until FROM chat_pauses WHERE chat_id = ?", (chat_id,)) as cursor:
                row = await cursor.fetchone()
                if not row:
                    return False, None
                paused_until = row[0]
                if paused_until > now:
                    remaining_mins = int((paused_until - now) / 60) + 1
                    return True, remaining_mins
                else:
                    await db.execute("DELETE FROM chat_pauses WHERE chat_id = ?", (chat_id,))
                    await db.commit()
                    return False, None

    async def save_business_connection(self, connection_id: str, user_id: int, can_reply: bool, is_enabled: bool):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO business_connections (connection_id, user_id, can_reply, is_enabled, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(connection_id) DO UPDATE SET
                    can_reply = ?, is_enabled = ?, updated_at = ?
            """, (
                connection_id, user_id, 1 if can_reply else 0, 1 if is_enabled else 0, time.time(),
                1 if can_reply else 0, 1 if is_enabled else 0, time.time()
            ))
            await db.commit()

    async def get_stats(self) -> Dict[str, int]:
        now = time.time()
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT COUNT(*) FROM messages") as c:
                total_messages = (await c.fetchone())[0]

            async with db.execute("SELECT COUNT(DISTINCT chat_id) FROM messages") as c:
                unique_chats = (await c.fetchone())[0]

            async with db.execute("SELECT COUNT(*) FROM chat_pauses WHERE paused_until > ?", (now,)) as c:
                active_pauses = (await c.fetchone())[0]

            async with db.execute("SELECT COUNT(*) FROM business_connections WHERE is_enabled = 1") as c:
                active_connections = (await c.fetchone())[0]

            return {
                "total_messages": total_messages,
                "unique_chats": unique_chats,
                "active_pauses": active_pauses,
                "active_connections": active_connections
            }
