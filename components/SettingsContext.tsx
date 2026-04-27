
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Setting } from 'app/models/settings';
import { extractApiErrorMessage } from 'app/helpers/response';
import { transformHomeSettings, type HomeSettings } from 'app/transformers/settings';

interface SettingsContextType {
  settings: Record<string, string>;
  homeSettings: HomeSettings;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  homeSettings: transformHomeSettings({}),
  isLoaded: false,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const homeSettings = transformHomeSettings(settings);

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
    <SettingsContext.Provider value={{ settings, homeSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
