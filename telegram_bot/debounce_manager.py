"""
Xabarlarni birlashtiruvchi (Debounce Manager) moduli.
Agar foydalanuvchi ketma-ket bir necha xabar yozsa (3-4 soniya oralig'ida),
ularni bitta kontekstga birlashtirib, Gemini ga bitta so'rov yuboradi.
"""

import asyncio
import logging
from typing import Dict, List, Callable, Any, Optional

logger = logging.getLogger(__name__)


class DebounceManager:
    def __init__(self, delay_seconds: float = 3.5):
        self.delay_seconds = delay_seconds
        # chat_id -> asyncio.Task
        self._tasks: Dict[int, asyncio.Task] = {}
        # chat_id -> List of message dicts: [{"text": str, "image_bytes": bytes, "message_obj": Any}]
        self._buffers: Dict[int, List[Dict[str, Any]]] = {}

    async def add_message(
        self,
        chat_id: int,
        message_data: Dict[str, Any],
        callback: Callable[[int, List[Dict[str, Any]]], Any]
    ):
        """
        Yangi xabarni buferga qo'shish va taymerni qayta ishga tushirish.
        """
        if chat_id not in self._buffers:
            self._buffers[chat_id] = []

        self._buffers[chat_id].append(message_data)

        # Agar avvalgi taymer ishlab turgan bo'lsa, uni bekor qilamiz
        if chat_id in self._tasks and not self._tasks[chat_id].done():
            self._tasks[chat_id].cancel()

        # Yangi taymer vazifasini yaratamiz
        self._tasks[chat_id] = asyncio.create_task(
            self._wait_and_trigger(chat_id, callback)
        )

    async def _wait_and_trigger(self, chat_id: int, callback: Callable):
        try:
            await asyncio.sleep(self.delay_seconds)
            # Belgilangan vaqt ichida boshqa xabar kelmadi, qayta ishlaymiz
            messages = self._buffers.pop(chat_id, [])
            self._tasks.pop(chat_id, None)

            if messages:
                await callback(chat_id, messages)
        except asyncio.CancelledError:
            # Yangi xabar kelgani uchun taymer bekor qilindi, bu oddiy holat
            pass
        except Exception as e:
            logger.error(f"Debounce ishida xatolik: {e}", exc_info=True)
            self._buffers.pop(chat_id, None)
            self._tasks.pop(chat_id, None)
