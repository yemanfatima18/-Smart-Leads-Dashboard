import { Response, NextFunction } from 'express';
import { Parser } from 'json2csv';
import { Lead } from '../models/Lead';
import { AuthRequest, LeadFilters, LeadStatus, LeadSource } from '../types';
import { createError } from '../middleware/errorHandler';

export const getLeads = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = 1,
      limit = 10,
    } = req.query as unknown as LeadFilters;

    const filter: Record<string, unknown> = {};

    // Role-based: sales users only see their own leads
    if (req.user?.role === 'sales') {
      filter.createdBy = req.user.id;
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: leads,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email');
    if (!lead) return next(createError('Lead not found', 404));

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      return next(createError('Access denied', 403));
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, status, source } = req.body;
    const lead = await Lead.create({ name, email, status, source, createdBy: req.user?.id });
    res.status(201).json({ success: true, message: 'Lead created successfully', data: lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(createError('Lead not found', 404));

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      return next(createError('Access denied', 403));
    }

    const { name, email, status, source } = req.body;
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, status, source },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Lead updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(createError('Lead not found', 404));

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      return next(createError('Access denied', 403));
    }

    await lead.deleteOne();
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.role === 'sales') filter.createdBy = req.user.id;

    const leads = await Lead.find(filter).populate('createdBy', 'name').lean();

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Status', value: 'status' },
      { label: 'Source', value: 'source' },
      { label: 'Created At', value: (row: Record<string, unknown>) => new Date(row.createdAt as string).toLocaleDateString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const matchStage: Record<string, unknown> = {};
    if (req.user?.role === 'sales') {
      const mongoose = await import('mongoose');
      matchStage.createdBy = new mongoose.Types.ObjectId(req.user.id);
    }

    const [statusStats, sourceStats, total] = await Promise.all([
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.countDocuments(matchStage),
    ]);

    res.status(200).json({
      success: true,
      data: { total, byStatus: statusStats, bySource: sourceStats },
    });
  } catch (error) {
    next(error);
  }
};
