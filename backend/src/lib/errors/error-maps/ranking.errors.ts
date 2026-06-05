import { ErrorMap } from '../error-map';

export const rankingErrorMap: ErrorMap = {
  CANDIDATE_NOT_FOUND: { status: 404, body: { error: 'No tienes un perfil de candidato.' } },
};

export const rankingCandidateErrorMap: ErrorMap = {
  CANDIDATE_NOT_FOUND: { status: 404, body: { error: 'Candidato no encontrado.' } },
};
