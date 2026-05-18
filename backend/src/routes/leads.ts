import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadsController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

const leadBodyValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('source')
    .notEmpty()
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Invalid source'),
];

const idValidation = [param('id').isMongoId().withMessage('Invalid lead ID')];

router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.get('/export', exportLeadsCSV);
router.get('/:id', idValidation, validate, getLeadById);
router.post('/', leadBodyValidation, validate, createLead);
router.put('/:id', [...idValidation, ...leadBodyValidation], validate, updateLead);
router.delete('/:id', authorize('admin'), idValidation, validate, deleteLead);

export default router;
