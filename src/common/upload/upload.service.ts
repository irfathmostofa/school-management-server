import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UploadService {
  readonly publicDirectory = path.join(process.cwd(), "public");

  constructor() {
    for (const dir of [
      "image",
      "doTask",
      "RecruitmentApplicantCV",
      "csv",
      "temp",
    ]) {
      fs.mkdirSync(path.join(this.publicDirectory, dir), { recursive: true });
    }
  }

  async saveFile(file: any, destination: string, filename?: string) {
    if (!file) return "";
    const destDir = path.join(this.publicDirectory, destination);
    fs.mkdirSync(destDir, { recursive: true });
    const name = filename || `${Date.now()}${file.name || ""}`;
    const dest = path.join(destDir, name);
    if (typeof file.mv === "function") {
      await file.mv(dest);
    } else if (file.data) {
      await fs.promises.writeFile(dest, file.data);
    } else if (file.buffer) {
      await fs.promises.writeFile(dest, file.buffer);
    }
    return name;
  }

  async saveNamed(file: any, destination: string) {
    if (!file) return "";
    const name = `${uuidv4()}_${file.name}`;
    return this.saveFile(file, destination, name);
  }
}
