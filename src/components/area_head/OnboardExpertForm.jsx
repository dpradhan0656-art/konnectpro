import React from 'react';
import ExpertRegistrationForm from '../forms/ExpertRegistrationForm';

/**
 * @deprecated Use `ExpertRegistrationForm` with `variant="areaHead"` directly.
 * Thin wrapper kept so imports don’t break; implementation is the shared form.
 */
export default function OnboardExpertForm({ manager }) {
  return (
    <ExpertRegistrationForm
      variant="areaHead"
      areaHeadId={manager?.id}
      defaultCity={manager?.assigned_area?.trim() || ''}
      cityReadOnly={Boolean(manager?.assigned_area?.trim())}
    />
  );
}

/*
 * -----------------------------------------------------------------------------
 * Old Inconsistent Form (history — preset categories, no email / experience / aadhar)
 * -----------------------------------------------------------------------------
 *
 * import React, { useState, useCallback } from 'react';
 * import { supabase } from '../../lib/supabase';
 * import { User, Phone, Briefcase, MapPin, UserPlus, Loader2, CheckCircle } from 'lucide-react';
 *
 * const PRESET_CATEGORIES = ['Plumber', 'Electrician', 'Beautician', 'Carpenter', 'Salon'];
 * ... (full previous component body was here)
 * -----------------------------------------------------------------------------
 */
