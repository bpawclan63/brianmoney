
-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own transactions"
ON public.payment_transactions;

DROP POLICY IF EXISTS "Users can view own transactions"
ON public.payment_transactions;

CREATE POLICY "Users can insert own transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
ON public.payment_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Function to handle expired subscriptions
CREATE OR REPLACE FUNCTION public.deactivate_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_subscriptions
    SET status = 'inactive'
    WHERE status = 'active' AND expiry_date < now();
END;
$$;

-- Update handle_new_user to include user_subscriptions initialization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'name');
  
  -- Initialize subscription record
  INSERT INTO public.user_subscriptions (user_id, status)
  VALUES (NEW.id, 'inactive');

  -- Insert default categories for the new user
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Salary', 'Briefcase', '#10b981', 'income', true),
    (NEW.id, 'Freelance', 'Laptop', '#06b6d4', 'income', true),
    (NEW.id, 'Investment', 'TrendingUp', '#8b5cf6', 'income', true),
    (NEW.id, 'Gift', 'Gift', '#ec4899', 'both', true),
    (NEW.id, 'Food & Dining', 'Utensils', '#f59e0b', 'expense', true),
    (NEW.id, 'Transportation', 'Car', '#3b82f6', 'expense', true),
    (NEW.id, 'Shopping', 'ShoppingBag', '#ec4899', 'expense', true),
    (NEW.id, 'Bills & Utilities', 'Zap', '#ef4444', 'expense', true),
    (NEW.id, 'Entertainment', 'Film', '#8b5cf6', 'expense', true),
    (NEW.id, 'Healthcare', 'Heart', '#10b981', 'expense', true),
    (NEW.id, 'Education', 'GraduationCap', '#06b6d4', 'expense', true),
    (NEW.id, 'Other', 'MoreHorizontal', '#6b7280', 'both', true);
  
  RETURN NEW;
END;
$$;
