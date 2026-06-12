import { supabase } from '../../../lib/supabase';

export async function fetchAreaHeadDailyReports(filterDate) {
  const params = {
    filter_date: filterDate || null,
  };
  const { data, error } = await supabase.rpc('admin_get_daily_reports', params);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
