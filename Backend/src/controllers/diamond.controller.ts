import { Request, Response } from 'express';
import { DiamondService } from '../services/diamond.service.js';

export const createDiamond = async (req: Request, res: Response) => {
  try {
    const { name, image_url, base_price } = req.body;

    if (!name || !base_price) {
      return res.status(400).json({
        message: 'Name and base_price are required',
      });
    }

    const diamond = await DiamondService.createDiamond({
      name,
      image_url,
      base_price,
    });

    return res.status(201).json({
      message: 'Diamond created successfully',
      data: diamond,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getDiamonds = async (_req: Request, res: Response) => {
  const diamonds = await DiamondService.getAllDiamonds();

  return res.status(200).json({
    data: diamonds,
  });
};

export const updateDiamond = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, image_url, base_price } = req.body;

    const diamond = await DiamondService.updateDiamond(id, {
      name,
      image_url,
      base_price,
    });

    return res.status(200).json({
      message: 'Diamond updated successfully',
      data: diamond,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
