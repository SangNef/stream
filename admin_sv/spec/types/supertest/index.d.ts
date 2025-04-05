import { IUser } from '@src/models/User';
import 'supertest';
import { Request } from "express";

declare module 'supertest' {

  export interface Response  {
    headers: Record<string, string[]>;
    body: {
      error: string;
      users: IUser[];
    };
  }
}

declare module 'express' {
  interface Request {
    user?: {
      id: string;
    };
  }
}