import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if any super admin already exists
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("is_super_admin", true)
      .limit(1);

    if (checkError) {
      console.error("Error checking existing admins:", checkError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({ error: "A super admin already exists. This function can only be used once." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to create auth user or get existing one
    let userId: string;
    
    // First check if user already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      console.log("User already exists in auth, linking to admins table");
      userId = existingUser.id;
      
      // Update user metadata
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          name,
          role: "admin",
          is_super_admin: true,
        },
      });
    } else {
      // Create new auth user
      const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: "admin",
          is_super_admin: true,
        },
      });

      if (createUserError || !authUser.user) {
        console.error("Failed to create auth user:", createUserError);
        return new Response(
          JSON.stringify({ error: createUserError?.message || "Failed to create user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = authUser.user.id;
    }

    // Insert into admins table
    const { error: insertError } = await supabaseAdmin
      .from("admins")
      .insert({
        id: userId,
        email: email.toLowerCase(),
        name,
        school_code: null, // Super admin has access to all schools
        is_super_admin: true,
        is_active: true,
      });

    if (insertError) {
      console.error("Failed to insert admin:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create admin record: " + insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Super admin ${email} created successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Super admin created successfully! You can now login at /admin/login",
        admin: {
          id: userId,
          email: email.toLowerCase(),
          name,
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
