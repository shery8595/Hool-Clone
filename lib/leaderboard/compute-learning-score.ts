export function computeLearningScore(
  memoriesCount: number,
  cloneAgreementCount: number,
): number {
  return memoriesCount + cloneAgreementCount;
}

export function computeCloneMatchPercent(
  cloneAgreementCount: number,
  comparablePredictions: number,
): number {
  if (comparablePredictions <= 0) return 0;
  return Math.round((cloneAgreementCount / comparablePredictions) * 100);
}
