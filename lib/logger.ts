type LogMetadataValue = string | number | boolean | null | undefined;
type LogMetadata = Record<string, LogMetadataValue>;
type LogLevel = "info" | "warn" | "error";

function cleanMetadata(metadata: LogMetadata = {}) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined)
  );
}

export function createRequestId() {
  return crypto.randomUUID();
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unknown error";
}

export function logServerEvent(
  level: LogLevel,
  event: string,
  metadata: LogMetadata = {}
) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...cleanMetadata(metadata),
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logServerError(
  event: string,
  error: unknown,
  metadata: LogMetadata = {}
) {
  logServerEvent("error", event, {
    ...metadata,
    error: getErrorMessage(error),
  });
}

export function createRequestLogger(scope: string, requestId = createRequestId()) {
  const base = { scope, requestId };

  return {
    requestId,
    info(event: string, metadata: LogMetadata = {}) {
      logServerEvent("info", event, { ...base, ...metadata });
    },
    warn(event: string, metadata: LogMetadata = {}) {
      logServerEvent("warn", event, { ...base, ...metadata });
    },
    error(event: string, error: unknown, metadata: LogMetadata = {}) {
      logServerError(event, error, { ...base, ...metadata });
    },
  };
}
