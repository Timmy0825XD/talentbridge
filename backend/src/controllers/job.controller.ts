import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as jobService from '../services/job.service';
import { JobStatus, JobType, WorkMode } from '@prisma/client';

export async function createJob(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const job = await jobService.createJob(userId, req.body);
    res.status(201).json(job);
  } catch (err: any) {
    if (err.message === 'COMPANY_PROFILE_NOT_FOUND')
      return res.status(404).json({ error: 'Debes completar tu perfil de empresa primero.' });
    if (err.message === 'INVALID_WEIGHTS')
      return res.status(400).json({ error: 'Los pesos del ranking deben sumar exactamente 1.0' });
    console.error('createJob error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function listJobs(req: AuthRequest, res: Response) {
  try {
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
  } catch (err) {
    console.error('listJobs error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function getJobById(req: AuthRequest, res: Response) {
  try {
    const job = await jobService.getJobById(req.params['id'] as string);
    res.json(job);
  } catch (err: any) {
    if (err.message === 'JOB_NOT_FOUND')
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    console.error('getJobById error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function updateJob(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const jobId = req.params['id'] as string;
    const job = await jobService.updateJob(userId, jobId, req.body);
    res.json(job);
  } catch (err: any) {
    if (err.message === 'JOB_NOT_FOUND')
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    if (err.message === 'UNAUTHORIZED')
      return res.status(403).json({ error: 'No tienes permiso para editar esta vacante.' });
    console.error('updateJob error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function updateJobStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const jobId = req.params['id'] as string;
    const { status } = req.body;

    if (!Object.values(JobStatus).includes(status))
      return res.status(400).json({ error: 'Estado inválido.' });

    const job = await jobService.updateJobStatus(userId, jobId, status as JobStatus);
    res.json(job);
  } catch (err: any) {
    if (err.message === 'JOB_NOT_FOUND')
      return res.status(404).json({ error: 'Vacante no encontrada.' });
    if (err.message === 'UNAUTHORIZED')
      return res.status(403).json({ error: 'No tienes permiso para modificar esta vacante.' });
    console.error('updateJobStatus error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function getMyJobs(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const jobs = await jobService.getMyJobs(userId);
    res.json(jobs);
  } catch (err: any) {
    if (err.message === 'COMPANY_PROFILE_NOT_FOUND')
      return res.status(404).json({ error: 'Debes completar tu perfil de empresa primero.' });
    console.error('getMyJobs error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}