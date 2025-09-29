-- Fix critical privilege escalation vulnerability
-- Drop existing profile update policy that allows role changes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that prevents users from updating their own role
-- Users can update their profile but cannot change their role unless they're admin
CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create separate policy for role updates - only admins can change roles
CREATE POLICY "Only admins can change user roles" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  -- If user is updating their own record and they're not admin, role must stay the same
  (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())) OR
  -- If user is admin, they can change any role
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Clean up redundant tables since they're empty and roles are in profiles
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE; 
DROP TABLE IF EXISTS public.students CASCADE;

-- Create audit function for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log role changes
  IF OLD.role != NEW.role THEN
    RAISE LOG 'Role changed for user % from % to % by %', 
      NEW.user_id, OLD.role, NEW.role, auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for role change auditing
CREATE TRIGGER audit_profile_role_changes
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION public.audit_role_changes();