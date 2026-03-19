//Handles loading and managing chat history.
import {
  fetchChatHistory,
  fetchChatSessions,
  type ChatSessionSummary,
} from "../api/chatApi";
import { logger as structuredLogger } from "../logger";

export type HistoryMessage = {
  content: string;
  role: "user" | "assistant";
  createdAt?: string | number;
};

export type LoadHistoryOptions = {
  logger: {
    info(message: string): void;
    error(message: string): void;
  };
  onMessage: (msg: HistoryMessage) => void;
  onSessionMismatch?: () => void;
};

export type LoadSessionsOptions = {
  logger?: {
    info(message: string): void;
    error(message: string): void;
  };
  limit?: number;
};

export type SessionSummary = ChatSessionSummary;

export async function loadChatHistory(
  sessionId: string,
  username: string,
  options: LoadHistoryOptions,
): Promise<boolean> {
  const { logger, onMessage, onSessionMismatch } = options;

  // ES LOG: Loading chat history started
  structuredLogger.chat.info("chat_history_load_started", {
    user: { id: username, username: username },
    session_id: sessionId,
  });

  try {
    logger.info(`Loading history for user: ${username} session: ${sessionId}`);

    const history = await fetchChatHistory(sessionId, username);

    if (history.messages && history.messages.length > 0) {
      logger.info(`Found ${history.messages.length} messages. Rendering...`);

      // ES LOG: History messages found
      structuredLogger.chat.info("chat_history_messages_found", {
        user: { id: username, username: username },
        session_id: sessionId,
        details: {
          message_count: history.messages.length,
        },
      });

      history.messages.forEach((msg) => {
        onMessage(msg);
      });

      logger.info("History loaded successfully");

      // ES LOG: History loaded successfully
      structuredLogger.chat.info("chat_history_loaded", {
        user: { id: username, username: username },
        session_id: sessionId,
        details: {
          message_count: history.messages.length,
        },
      });

      return true;
    } else {
      logger.info("History loaded but session is empty");

      // ES LOG: Empty session
      structuredLogger.chat.info("chat_history_empty", {
        user: { id: username, username: username },
        session_id: sessionId,
      });

      return true;
    }
  } catch (error: any) {
    if (error.status === 403) {
      logger.info(
        "Session ownership mismatch detected (403). Resetting session.",
      );

      // ES LOG: Session ownership mismatch
      structuredLogger.chat.warning("chat_history_ownership_mismatch", {
        user: { id: username, username: username },
        session_id: sessionId,
        details: {
          reason: "403 Forbidden - User does not own this session",
        },
      });

      if (onSessionMismatch) {
        onSessionMismatch();
      }
      return false;
    }

    logger.error("loadHistory failed: " + (error?.message || String(error)));

    // ES LOG: History load failed
    structuredLogger.chat.error("chat_history_load_failed", {
      user: { id: username, username: username },
      session_id: sessionId,
      error: {
        message: error?.message || String(error),
        code: error?.code || error?.status,
        stack: error?.stack,
      },
    });

    return false;
  }
}

export async function loadSessions(
  username: string,
  options: LoadSessionsOptions = {},
): Promise<SessionSummary[]> {
  const { logger, limit } = options;

  if (logger) {
    logger.info(`Loading sessions for user: ${username}`);
  }

  // ES LOG: Loading sessions started
  structuredLogger.chat.info("sessions_load_started", {
    user: { id: username, username: username },
    details: {
      limit: limit,
    },
  });

  try {
    const response = await fetchChatSessions(username, limit);
    const sessions = response.sessions ?? [];

    // ES LOG: Sessions loaded successfully
    structuredLogger.chat.info("sessions_loaded", {
      user: { id: username, username: username },
      details: {
        session_count: sessions.length,
        limit: limit,
      },
    });

    return sessions;
  } catch (error: any) {
    // ES LOG: Sessions load failed
    structuredLogger.chat.error("sessions_load_failed", {
      user: { id: username, username: username },
      error: {
        message: error?.message || String(error),
        code: error?.code || error?.status,
        stack: error?.stack,
      },
      details: {
        limit: limit,
      },
    });

    // Re-throw to maintain existing error handling
    throw error;
  }
}

export function createHistoryLoader(options: LoadHistoryOptions) {
  let loadedSessionId: string | undefined;

  return {
    async loadIfNeeded(sessionId: string, username: string): Promise<boolean> {
      if (loadedSessionId === sessionId) {
        options.logger.info(
          `History already loaded for session ${sessionId}, skipping`,
        );

        // ES LOG: History already loaded (cache hit)
        structuredLogger.chat.debug("chat_history_cache_hit", {
          user: { id: username, username: username },
          session_id: sessionId,
        });

        return true;
      }

      // ES LOG: Loading new session (cache miss)
      structuredLogger.chat.debug("chat_history_cache_miss", {
        user: { id: username, username: username },
        session_id: sessionId,
        details: {
          previous_session: loadedSessionId,
        },
      });

      const success = await loadChatHistory(sessionId, username, options);

      if (success) {
        loadedSessionId = sessionId;

        // ES LOG: Session cached
        structuredLogger.chat.debug("chat_history_session_cached", {
          user: { id: username, username: username },
          session_id: sessionId,
        });
      }

      return success;
    },

    reset(sessionId?: string) {
      const previousSession = loadedSessionId;

      if (!sessionId || loadedSessionId === sessionId) {
        loadedSessionId = undefined;

        // ES LOG: History loader reset
        structuredLogger.chat.debug("chat_history_loader_reset", {
          details: {
            reset_session: sessionId,
            previous_session: previousSession,
          },
        });
      }
    },

    isLoaded(sessionId?: string): boolean {
      if (sessionId) {
        return loadedSessionId === sessionId;
      }
      return typeof loadedSessionId !== "undefined";
    },
  };
}
