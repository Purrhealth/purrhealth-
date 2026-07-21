/**
 * Weight Tracking Service
 * Business logic for weight tracking
 */

import * as weightRepo from '../repositories/weightRepository.js';
import * as catRepo from '../repositories/catRepository.js';

/**
 * Record weight entry
 */
export const recordWeightEntry = async (userId, catId, weightData) => {
  // Verify cat belongs to user
  const cat = await catRepo.getCatById(catId, userId);
  if (!cat) {
    const error = new Error('Cat not found');
    error.status = 404;
    throw error;
  }

  const weight = await weightRepo.recordWeight({
    catId,
    ...weightData,
  });

  return weight;
};

/**
 * Get weight history for cat
 */
export const getWeightHistory = async (catId, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  const weights = await weightRepo.getWeightHistory(catId, limit, offset);

  return {
    data: weights,
    pagination: {
      page,
      limit,
    },
  };
};

/**
 * Get weight analysis
 */
export const getWeightAnalysis = async (catId) => {
  const stats = await weightRepo.getWeightStats(catId);
  const trend = await weightRepo.getWeightTrend(catId, 30);
  const alerts = await weightRepo.getWeightAlerts(catId, 10);

  return {
    stats,
    trend,
    alerts,
  };
};

/**
 * Get latest weight
 */
export const getLatestWeight = async (catId) => {
  return weightRepo.getLatestWeight(catId);
};

/**
 * Update weight entry
 */
export const updateWeightEntry = async (weightId, updateData) => {
  const weight = await weightRepo.getWeightById(weightId);

  if (!weight) {
    const error = new Error('Weight entry not found');
    error.status = 404;
    throw error;
  }

  const updated = await weightRepo.updateWeight(weightId, updateData);

  return updated;
};

/**
 * Delete weight entry
 */
export const deleteWeightEntry = async (weightId) => {
  const weight = await weightRepo.getWeightById(weightId);

  if (!weight) {
    const error = new Error('Weight entry not found');
    error.status = 404;
    throw error;
  }

  await weightRepo.deleteWeight(weightId);

  return { success: true };
};

export default {
  recordWeightEntry,
  getWeightHistory,
  getWeightAnalysis,
  getLatestWeight,
  updateWeightEntry,
  deleteWeightEntry,
};
