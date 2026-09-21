import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
  constructor(private readonly jwt: NestJwtService) {}

  sign(payload: any, expiresIn: string | number = "1d") {
    return this.jwt.sign(payload, { expiresIn });
  }

  verify(token: string) {
    try {
      return this.jwt.verify(token);
    } catch {
      return null;
    }
  }
}
