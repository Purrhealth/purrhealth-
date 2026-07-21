/**
 * Weight Tracking Routes
 * Endpoints for recording and analyzing weight
 */

import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as weightService from '../services/weightService.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/weight
 * Record a new weight entry
 */
router.post(
  '/',
  [
    body('catId')
      .isUUID()
      .withMessage('Valid cat ID required'),
    body('weight')
      .isFloat({ min: 0.5, max: 10 })
      .withMessage('Weight must be between 0.5 and 10 kg'),
    body('recordedAt')
      .isISO8601()
      .withMessage('Valid date required (ISO 8601)'),
    body('notes')
      .optional()
      .trim(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const weight = await weightService.recordWeightEntry(
        req.user.userId,
        req.body.catId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Weight recorded successfully',
        data: weight,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/cats/:catId/weight
 * Get weight history for a cat
 * Query: ?page=1&limit=50
 */
router.get(
  '/cat/:catId',
  [
    param('catId')
      .isUUID()
      .withMessage('Invalid cat ID'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await weightService.getWeightHistory(
        req.params.catId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: 'Weight history retrieved',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/cats/:catId/weight/latest
 * Get latest weight entry
 */
router.get(
  '/cat/:catId/latest',
  [
    param('catId')
      .isUUID()
      .withMessage('Invalid cat ID'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const weight = await weightService.getLatestWeight(req.params.catId);

      res.status(200).json({
        success: true,
        message: 'Latest weight retrieved',
        data: weight,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/cats/:catId/weight/analysis
 * Get weight analysis and trends
 */
router.get(
  '/cat/:catId/analysis',
  [
    param('catId')
      .isUUID()
      .withMessage('Invalid cat ID'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const analysis = await weightService.getWeightAnalysis(req.params.catId);

      res.status(200).json({
        success: true,
        message: 'Weight analysis retrieved',
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/weight/:id
 * Update weight entry
 */
router.put(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid weight entry ID'),
    body('weight')
      .optional()
      .isFloat({ min: 0.5, max: 10 }),
    body('recordedAt')
      .optional()
      .isISO8601(),
    body('notes')
      .optional()
      .trim(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const updated = await weightService.updateWeightEntry(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Weight entry updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/weight/:id
 * Delete weight entry
 */
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid weight entry ID'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await weightService.deleteWeightEntry(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Weight entry deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
