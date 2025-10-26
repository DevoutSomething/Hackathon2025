import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface UserSettings {
  educationLevel: string;
  learningStyle: string;
  complexity: number; // 0-4 scale for animation complexity
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>({
    educationLevel: 'high-school',
    learningStyle: 'visual',
    complexity: 2 // Default medium complexity (0-4 scale)
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
};
