import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  schoolCode: string;
  schoolName: string;
  inviterName: string;
  signupUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, schoolCode, schoolName, inviterName, signupUrl }: InvitationRequest = await req.json();

    console.log(`Sending invitation to ${email} for school ${schoolCode}`);

    if (!email || !schoolCode || !schoolName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Teacher's Desk <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${schoolName} on Teacher's Desk`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Teacher's Desk</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Education Management Platform</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1f2937; margin-top: 0;">You've been invited!</h2>
            
            <p style="color: #4b5563;">${inviterName} has invited you to join <strong>${schoolName}</strong> as a teacher on Teacher's Desk.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Your School Code</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; font-family: monospace; color: #667eea; letter-spacing: 4px;">${schoolCode}</p>
            </div>
            
            <p style="color: #4b5563;">Use this code when signing up to join your school's workspace.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Join as Teacher
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            © ${new Date().getFullYear()} Teacher's Desk. All rights reserved.
          </p>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-teacher-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
