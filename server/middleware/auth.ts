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

  const hasUserSession = !!(req.session as any)?.userId;
  const hasAdminPassportSession = req.isAuthenticated && req.isAuthenticated();

  if (!hasUserSession && !hasAdminPassportSession) {
    console.log("Authentication failed - redirecting to login");
    return res.status(401).json({ message: "Authentication required" });
  }

  const uid = (req.session as any)?.userId || (req.user as any)?.id;
  console.log(`Authenticated user: ${(req.user as any)?.email || uid} from IP: ${req.ip}`);
  next();
}