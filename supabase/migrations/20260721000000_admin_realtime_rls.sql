-- Enable admin realtime subscriptions by fixing RLS policies
-- Without these, realtime won't deliver events for admin-only tables

-- 1. Admin override for profiles SELECT
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Admin override for orders SELECT
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Admin override for order_items SELECT
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Fix bug_reports: replace service_role check with admin profile check
DROP POLICY IF EXISTS "Service role can manage bug reports" ON public.bug_reports;
CREATE POLICY "Admins can manage bug reports" ON public.bug_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Fix contact_messages: replace service_role check with admin profile check
DROP POLICY IF EXISTS "Admin can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
