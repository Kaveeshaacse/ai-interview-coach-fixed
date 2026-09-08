/**
 * Calculates weighted placement readiness score based on available metrics
 * @param {Object} metrics
 * @param {number} metrics.resumeScore
 * @param {number} metrics.atsScore
 * @param {number} metrics.interviewScore
 * @param {number} metrics.communicationScore
 * @param {number} metrics.codingScore
 * @param {number} metrics.aptitudeScore
 * @returns {number} Weighted overall score (0 - 100)
 */
export const calculateReadinessScore = ({
  resumeScore = 70,
  atsScore = 65,
  interviewScore = 70,
  communicationScore = 70,
  codingScore = 65,
  aptitudeScore = 75,
}) => {
  const weights = {
    interview: 0.25,
    coding: 0.20,
    resume: 0.15,
    ats: 0.15,
    aptitude: 0.15,
    communication: 0.10,
  };

  const score =
    interviewScore * weights.interview +
    codingScore * weights.coding +
    resumeScore * weights.resume +
    atsScore * weights.ats +
    aptitudeScore * weights.aptitude +
    communicationScore * weights.communication;

  return Math.min(100, Math.max(0, Math.round(score)));
};

export default {
  calculateReadinessScore,
};
