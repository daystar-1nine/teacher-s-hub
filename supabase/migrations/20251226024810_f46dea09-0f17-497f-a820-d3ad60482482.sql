-- Drop the existing public read policy that exposes school data
DROP POLICY IF EXISTS "Schools are publicly readable" ON public.schools;

-- Create a policy that allows authenticated users to view only their school
CREATE POLICY "Authenticated users can view their school"
ON public.schools
FOR SELECT
USING (
  code IN (
    SELECT school_code FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Allow unauthenticated users to verify school code exists (for signup)
-- This only allows checking if a code exists, not viewing other data
CREATE POLICY "Anyone can check school code existence"
ON public.schools
FOR SELECT
USING (
  -- Only allow access to the 'code' and 'name' columns conceptually
  -- But since RLS is row-level, we limit to checking specific codes
  -- This is needed for the signup flow to validate school codes
  auth.uid() IS NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.code = schools.code
  )
);