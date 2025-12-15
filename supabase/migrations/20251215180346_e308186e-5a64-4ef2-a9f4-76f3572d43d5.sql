-- Add is_active column to profiles for user activation/deactivation
ALTER TABLE public.profiles ADD COLUMN is_active boolean DEFAULT true;

-- Add RLS policy for admins to update profiles (for activation toggle)
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admins to manage user roles (promote/demote)
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));