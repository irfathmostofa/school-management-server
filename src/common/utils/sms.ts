export async function sendSms(phone: string, messageContent: string) {
  if (!phone) {
    console.warn("SMS not sent: no phone number provided");
    return;
  }
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const secretKey = process.env.SMS_SECRET_KEY;
  const callerId = process.env.SMS_CALLER_ID;
  if (!apiUrl || !apiKey) {
    console.warn("SMS not sent: missing SMS configuration");
    return;
  }
  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      secretkey: secretKey || "",
      callerID: callerId || "",
      toUser: "88" + phone,
      messageContent,
    });
    const res = await fetch(`${apiUrl}?${params.toString()}`);
    return await res.text();
  } catch (err) {
    console.error("SMS send failed:", err);
  }
}
