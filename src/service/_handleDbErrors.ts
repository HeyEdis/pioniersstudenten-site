import ServiceError from "@/core/serviceError";

const handleDBError = (error : any) => {
  const { code = '', message } = error;

  /**
   * Unique constraint violation
   */
  if (code === "23505") {
    switch (true) {
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
