import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../lib/errors/async-handler';
import * as keywordService from '../services/keyword.service';

export const getKeywords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type } = req.query;
  const keywords = await keywordService.getKeywords(type as string | undefined);
  res.json(keywords);
}, undefined, 'getKeywords');
