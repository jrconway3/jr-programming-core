
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Setting } from '../models/settings';

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
      .then((res) => res.json())
      .then((data: Setting[]) => {
        const mapped: Record<string, string> = {};
        data.forEach((item) => {
          mapped[item.key] = item.value;
        });
        setSettings(mapped);
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
