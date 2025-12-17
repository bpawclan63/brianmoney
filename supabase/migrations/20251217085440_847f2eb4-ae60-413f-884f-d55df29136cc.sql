-- Add subscription tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS activated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS deactivated_at timestamp with time zone DEFAULT NULL;