import { Request, Response } from 'express';
import { AdminMonitorService } from '../services/adminMonitor.service.js';

export const getBidMonitoring = async (
  _req: Request,
  res: Response
) => {
  const data =
    await AdminMonitorService.getAllBidMonitoringData();

  return res.status(200).json({
    data,
  });
};
