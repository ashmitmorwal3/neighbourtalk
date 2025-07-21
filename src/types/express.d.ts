import { Express } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// This empty export is needed to make the file a module
export {};
