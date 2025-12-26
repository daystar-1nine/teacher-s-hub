import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  school_code: string | null;
  is_super_admin?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user's JWT (for authorization checks)
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client (for admin operations)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the caller is authenticated
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // SECURITY CHECK: Verify caller is an admin
    // ============================================
    const { data: callerAdmin, error: adminCheckError } = await supabaseAdmin
      .from("admins")
      .select("id, email, name, school_code, is_super_admin, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .single();

    if (adminCheckError || !callerAdmin) {
      console.error("Admin check failed:", adminCheckError);
      return new Response(
        JSON.stringify({ error: "Access denied. Only administrators can create new admins." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: CreateAdminRequest = await req.json();
    const { name, email, password, school_code, is_super_admin = false } = body;

    // ============================================
    // VALIDATION
    // ============================================
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // ROLE ESCALATION PREVENTION
    // ============================================
    // Only super admins can create other super admins
    if (is_super_admin && !callerAdmin.is_super_admin) {
      console.warn(`Role escalation attempt by user ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Only super administrators can create other super administrators" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Non-super admins can only create admins in their own school
    if (!callerAdmin.is_super_admin) {
      if (school_code && school_code !== callerAdmin.school_code) {
        return new Response(
          JSON.stringify({ error: "You can only create admins for your own school" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ============================================
    // VERIFY SCHOOL EXISTS (if school_code provided)
    // ============================================
    if (school_code) {
      const { data: schoolExists, error: schoolError } = await supabaseAdmin
        .from("schools")
        .select("code")
        .eq("code", school_code)
        .single();

      if (schoolError || !schoolExists) {
        return new Response(
          JSON.stringify({ error: "School code does not exist" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ============================================
    // CHECK IF EMAIL ALREADY EXISTS
    // ============================================
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: "An admin with this email already exists" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // CREATE AUTH USER
    // ============================================
    const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm for admin-created accounts
      user_metadata: {
        name,
        role: "admin",
        school_code: school_code || null,
        is_super_admin,
      },
    });

    if (createUserError || !authUser.user) {
      console.error("Failed to create auth user:", createUserError);
      return new Response(
        JSON.stringify({ error: createUserError?.message || "Failed to create user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // INSERT INTO ADMINS TABLE
    // ============================================
    const { error: insertAdminError } = await supabaseAdmin
      .from("admins")
      .insert({
        id: authUser.user.id,
        email: email.toLowerCase(),
        name,
        school_code: school_code || null,
        is_super_admin: is_super_admin,
        is_active: true,
      });

    if (insertAdminError) {
      console.error("Failed to insert admin record:", insertAdminError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to create admin record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // LOG THE ACTIVITY
    // ============================================
    await supabaseAdmin.from("activity_logs").insert({
      user_id: user.id,
      school_code: school_code || callerAdmin.school_code || "SYSTEM",
      entity_type: "admin",
      action: "create_admin",
      entity_id: authUser.user.id,
      metadata: {
        created_by: callerAdmin.email,
        new_admin_email: email,
        is_super_admin,
      },
    });

    console.log(`Admin ${email} created successfully by ${callerAdmin.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin created successfully",
        admin: {
          id: authUser.user.id,
          email: email.toLowerCase(),
          name,
          school_code,
          is_super_admin,
        },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
