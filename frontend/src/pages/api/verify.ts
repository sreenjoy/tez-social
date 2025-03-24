import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  status: string;
  timestamp: string;
  environment: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
} 