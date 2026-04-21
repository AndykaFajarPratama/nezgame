import axios from "axios";
import { env } from "../config/env.js";

/**
 * Service to handle sending emails via EmailJS REST API.
 * This approach is used on the server to keep tokens secure.
 */
export class EmailService {
  private baseUrl = "https://api.emailjs.com/api/v1.0/email/send";

  private async send(templateId: string, templateParams: Record<string, any>) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          service_id: env.EMAILJS_SERVICE_ID.trim(),
          template_id: templateId.trim(),
          user_id: env.EMAILJS_PUBLIC_KEY.trim(),
          accessToken: env.EMAILJS_PRIVATE_KEY.trim(),
          template_params: templateParams,
        }
      );

      console.log(`✅ [EmailJS] Success: ${templateId} sent to ${templateParams.to_email}`);
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error(`❌ [EmailJS] Error:`, errorData || error.message);
      return false;
    }
  }

  /**
   * Send verification OTP to new users.
   */
  async sendVerificationEmail(toEmail: string, userName: string, code: string) {
    return this.send(env.EMAILJS_VERIFY_TEMPLATE_ID, {
      to_email: toEmail,
      email: toEmail, // Alias
      user_email: toEmail, // Alias
      user_name: userName,
      otp_code: code,
    });
  }

  /**
   * Send password reset link to requested users.
   */
  async sendPasswordResetEmail(toEmail: string, userName: string, url: string) {
    return this.send(env.EMAILJS_RESET_TEMPLATE_ID, {
      to_email: toEmail,
      user_name: userName,
      reset_url: url,
    });
  }
}

export const emailService = new EmailService();
