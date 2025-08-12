import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log("RequireAuth check:", {
    isAuthenticated: !!(req.session as any)?.userId,
    hasUser: !!(req.session as any)?.userId,
    sessionID: req.sessionID,
    userID: (req.session as any)?.userId,
    session: req.session ? 'exists' : 'missing',
    cookies: req.headers.cookie ? 'present' : 'missing'
  });

  if (!(req.session as any)?.userId) {
    console.log("Authentication failed - redirecting to login");
    return res.status(401).json({ message: "Authentication required" });
  }

  console.log(`Authenticated user ID: ${(req.session as any).userId} from IP: ${req.ip}`);
  next();
}