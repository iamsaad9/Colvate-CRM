import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface MyJwtPayload {
  userId: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
  };
}

type AuthenticatedHandler = (
  req: AuthenticatedRequest
) => Promise<Response> | Response;

export const authMiddleware = (handler: AuthenticatedHandler) => {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const token = req.cookies.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY!
      ) as MyJwtPayload;

      const authReq = req as AuthenticatedRequest;
      authReq.user = { id: decoded.userId };

      return handler(authReq);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
};
