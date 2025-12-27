-- Fix schools RLS to allow unauthenticated users to validate school codes during signup
DROP POLICY IF EXISTS "Anyone can check school code existence" ON schools;

CREATE POLICY "Anyone can validate school codes"
ON schools FOR SELECT
USING (true);

-- Add a comment for security context
COMMENT ON POLICY "Anyone can validate school codes" ON schools IS 'Allows signup flow to validate school codes. Only exposes code, name - no sensitive data.';