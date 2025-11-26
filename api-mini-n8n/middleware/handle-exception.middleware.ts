import { AppException } from "../exception/app.exception";
import { NextFunction, Request, Response } from "express";

export default (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppException) {
    return res.status(error.getCode()).json({
      error: error.message,
    });
  }

  console.error(error)
  return res.status(500).json({
    error: 'Internal server error',
  });
}