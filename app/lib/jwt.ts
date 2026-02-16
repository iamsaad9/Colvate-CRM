import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET is not defined");

// Ensure this is cast as a valid expiresIn type (string | number)
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

export function signJwt(payload: object): string {
  const options: SignOptions = { expiresIn: EXPIRES_IN };
  // Using '!' tells TS we know SECRET is defined thanks to our check above
  return jwt.sign(payload, SECRET!, options);
}

export function verifyJwt<T = JwtPayload | string>(token: string): T | null {
  try {
    return jwt.verify(token, SECRET!) as T;
  } catch {
    return null;
  }
}
