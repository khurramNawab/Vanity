import { useState, useEffect } from 'react';
import { fetchApi } from './api';

export interface StoreSettings {
  store_address: string;
  contact_address: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  social_instagram?: string;
  social_facebook?: string;
  social_linkedin?: string;
  social_email?: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_address: 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027',
  contact_address: 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027',
  contact_email: 'thevanityjewels@gmail.com',
  contact_phone: '+91 98765 43210',
  whatsapp_number: '919876543210',
};

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/settings/public')
      .then(res => {
        if (res && res.success && res.settings) {
          setSettings(prev => ({
            ...prev,
            ...res.settings,
            store_address: res.settings.store_address || prev.store_address,
            contact_address: res.settings.contact_address || res.settings.store_address || prev.contact_address,
            contact_email: res.settings.contact_email || res.settings.social_email || prev.contact_email,
            contact_phone: res.settings.contact_phone || prev.contact_phone,
            whatsapp_number: res.settings.whatsapp_number || prev.whatsapp_number,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
