import { Response } from 'express';
import { JobStatus } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import { jobErrorMap, jobStatusErrorMap } from '../lib/errors/error-maps/job.errors';
import * as jobService from '../services/job.service';

export const createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const job = await jobService.createJob(req.user!.userId, req.body);
  res.status(201).json(job);
}, jobErrorMap, 'createJob');

export const listJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    area, workMode, type, budgetMin, budgetMax,
    skills, search, page, limit,
  } = req.query;

  const result = await jobService.listJobs({
    area: area as string,
    workMode: workMode as string,
    type: type as string,
    budgetMin: budgetMin ? Number(budgetMin) : undefined,
    budgetMax: budgetMax ? Number(budgetMax) : undefined,
    skills: skills ? (skills as string).split(',') : undefined,
    search: search as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });

  res.json(result);
}, undefined, 'listJobs');

export const getJobById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const job = await jobService.getJobById(req.params['id'] as string);
  res.json(job);
}, jobErrorMap, 'getJobById');

export const updateJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const job = await jobService.updateJob(
    req.user!.userId,
    req.params['id'] as string,
    req.body
  );
  res.json(job);
}, jobErrorMap, 'updateJob');

export const updateJobStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  if (!Object.values(JobStatus).includes(status)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  const job = await jobService.updateJobStatus(
    req.user!.userId,
    req.params['id'] as string,
    status as JobStatus
  );
  res.json(job);
}, jobStatusErrorMap, 'updateJobStatus');

export const getMyJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const jobs = await jobService.getMyJobs(req.user!.userId);
  res.json(jobs);
}, jobErrorMap, 'getMyJobs');
