-- Drop existing teacher view policy for students table
DROP POLICY IF EXISTS "Teachers can view all students in their school" ON public.students;

-- Create new restrictive policy: Teachers can only view students in their assigned classes
-- OR if they have view_students permission enabled
CREATE POLICY "Teachers can view students with permission"
ON public.students
FOR SELECT
USING (
  -- Students can view their own record (already covered by separate policy)
  user_id = auth.uid()
  OR
  -- Teachers with view_students permission can see students in their school
  (
    school_code IN (
      SELECT p.school_code FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'teacher'::user_role
    )
    AND
    (
      -- Check if teacher has view_students permission
      EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid()
        AND up.is_active = true
        AND (
          up.admin_role IN ('super_admin', 'school_admin')
          OR (up.permissions->>'view_students')::boolean = true
        )
      )
      OR
      -- OR teacher is assigned to this student's class
      EXISTS (
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = auth.uid()
        AND up.is_active = true
        AND class_name = ANY(up.assigned_classes)
      )
    )
  )
  OR
  -- Admins can view all students in their school
  is_school_admin(auth.uid(), school_code)
);

-- Update INSERT policy to also check permissions
DROP POLICY IF EXISTS "Teachers can insert students" ON public.students;
CREATE POLICY "Teachers can insert students with permission"
ON public.students
FOR INSERT
WITH CHECK (
  school_code IN (
    SELECT p.school_code FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'teacher'::user_role
  )
  AND
  (
    -- Admin can always insert
    is_school_admin(auth.uid(), school_code)
    OR
    -- Teachers with edit_students permission
    EXISTS (
      SELECT 1 FROM user_permissions up
      WHERE up.user_id = auth.uid()
      AND up.is_active = true
      AND (up.permissions->>'edit_students')::boolean = true
    )
  )
);

-- Update UPDATE policy to also check permissions
DROP POLICY IF EXISTS "Teachers can update students in their school" ON public.students;
CREATE POLICY "Teachers can update students with permission"
ON public.students
FOR UPDATE
USING (
  school_code IN (
    SELECT p.school_code FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'teacher'::user_role
  )
  AND
  (
    -- Admin can always update
    is_school_admin(auth.uid(), school_code)
    OR
    -- Teachers with edit_students permission
    EXISTS (
      SELECT 1 FROM user_permissions up
      WHERE up.user_id = auth.uid()
      AND up.is_active = true
      AND (up.permissions->>'edit_students')::boolean = true
    )
    OR
    -- Teachers can update students in their assigned classes
    EXISTS (
      SELECT 1 FROM user_permissions up
      WHERE up.user_id = auth.uid()
      AND up.is_active = true
      AND class_name = ANY(up.assigned_classes)
    )
  )
);