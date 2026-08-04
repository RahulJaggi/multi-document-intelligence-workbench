import { Request, Response, NextFunction } from 'express';

export const getHealth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(200).json({
      success: true,
      message: 'Server running',
    });
  } catch (error) {
    next(error);
  }
};
