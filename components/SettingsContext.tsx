
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Setting } from 'app/models/settings';
import { extractApiErrorMessage } from 'app/helpers/response';

interface SettingsContextType {
  settings: Record<string, string>;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType>({ settings: {}, isLoaded: false });

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(async (res) => {
        const payload = await res.json();

        if (!res.ok || !payload.ok) {
          throw new Error(extractApiErrorMessage(payload, 'Failed to fetch settings.'));
        }

        return payload.data as Setting[];
      })
      .then((data) => {
        const mapped: Record<string, string> = {};
        data.forEach((item) => {
          mapped[item.key] = item.value;
        });
        setSettings(mapped);
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
