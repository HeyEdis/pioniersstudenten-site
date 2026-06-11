import ServiceError from "@/core/serviceError";

type DatabaseErrorLike = Error & {
  cause?: unknown;
  code?: unknown;
  constraint?: unknown;
  errno?: unknown;
};

const getDatabaseErrorDetails = (error: DatabaseErrorLike) => {
  const cause = error.cause;
  const databaseError =
    cause instanceof Error && ("code" in cause || "errno" in cause || "constraint" in cause)
      ? (cause as DatabaseErrorLike)
      : error;

  let code = "";
  if (typeof databaseError.errno === "number") {
    code = databaseError.errno.toString();
  } else if (typeof databaseError.errno === "string") {
    code = databaseError.errno;
  } else if (typeof databaseError.code === "string") {
    code = databaseError.code;
  }
  const messageParts = [
    error.message,
    databaseError.message,
    typeof databaseError.constraint === "string" ? databaseError.constraint : "",
  ];

  return {
    code,
    message: messageParts.join(" "),
  };
};

const handleDBError = (error : unknown) => {
  if (
    !(error instanceof Error) ||
    (!("code" in error) && !("cause" in error))
  ) {
    throw error;
  }

  const { code, message } = getDatabaseErrorDetails(error);

  /**
   * Unique constraint violation
   */
  if (code === "23505") {
    switch (true) {
      case message.includes('registrations_event_email_unique'):
        throw ServiceError.conflict(
          'Dit e-mailadres is al ingeschreven voor dit evenement.',
        );
      case message.includes('registrations_event_phonenumber_unique'):
        throw ServiceError.conflict(
          'Dit telefoonnummer is al ingeschreven voor dit evenement.',
        );
      case message.includes('email'):
        throw ServiceError.badRequest(
          'Dit e-mail adres is al in gebruik.',
        );
      case message.includes('events_title_unique'):
        throw ServiceError.badRequest(
          'Een event bestaat al met deze titel.',
        );
      case message.includes('phonenumber'):
        throw ServiceError.badRequest(
          'Dit telefoonnummer is al geregistreerd.',
        );
      default:
        throw ServiceError.badRequest("Dit item bestaat al.");
    }
  }

  /**
   * Case not found violation
   */
  if (code === "20000") {
    switch (true) {
      case message.includes('events'):
        throw ServiceError.notFound('Dit event bestaat niet.');
      case message.includes('registrations'):
        throw ServiceError.notFound('Deze inschrijving bestaat niet.');
      case message.includes('members'):
        throw ServiceError.notFound('Dit lid bestaat niet.');
      default:
        throw ServiceError.notFound('Het opgevraagde item bestaat niet.');
    }
  }

  /**
   * Foreign key constraint
   */
  if (code === "23503") {
    switch (true) {
      case message.includes('events'):
        throw ServiceError.conflict(
          'Dit event bestaat niet of is niet gelinkt met een registratie.',
        );
      case message.includes('registrations'):
        throw ServiceError.conflict(
          'Deze registratie bestaat niet of is niet gelinkt met een event.',
        );
      default:
        throw ServiceError.conflict(
          'Er is een probleem met een gelinkte item.',
        );
    }
  }

  throw error;
};

export default handleDBError;
