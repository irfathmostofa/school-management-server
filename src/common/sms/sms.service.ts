import { Injectable } from "@nestjs/common";

@Injectable()
export class SmsService {
  get apiUrl() {
    return process.env.SMS_API_URL;
  }
  get apiKey() {
    return process.env.SMS_API_KEY;
  }
  get secretKey() {
    return process.env.SMS_SECRET_KEY;
  }
  get callerId() {
    return process.env.SMS_CALLER_ID;
  }

  async send(phone: string, messageContent: string) {
    if (!phone) {
      console.warn("SMS not sent: no phone number provided");
      return;
    }
    if (!this.apiUrl || !this.apiKey) {
      console.warn("SMS not sent: missing SMS configuration");
      return;
    }
    try {
      const params = new URLSearchParams({
        apikey: this.apiKey,
        secretkey: this.secretKey || "",
        callerID: this.callerId || "",
        toUser: "88" + phone,
        messageContent,
      });
      const res = await fetch(`${this.apiUrl}?${params.toString()}`);
      return await res.text();
    } catch (err) {
      console.error("SMS send failed:", err);
    }
  }
}
