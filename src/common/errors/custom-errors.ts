import { ErrorCode } from "./error-codes";

export interface ErrorMetadata {
  [key: string]: any;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly metadata?: ErrorMetadata;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    metadata?: ErrorMetadata,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.isOperational = isOperational;
    this.name = "AppError";
    
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      metadata: this.metadata,
      stack: this.stack
    };
  }
}