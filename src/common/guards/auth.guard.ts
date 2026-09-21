import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { TokenService } from "../jwt/jwt.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.body?.token;
    if (!token) {
      throw new UnauthorizedException({ ok: false, message: "Unauthorized" });
    }
    const decoded = this.tokens.verify(token);
    if (!decoded) {
      throw new UnauthorizedException({
        ok: false,
        message: "Invalid or expired token",
      });
    }
    req.user = decoded;
    return true;
  }
}
