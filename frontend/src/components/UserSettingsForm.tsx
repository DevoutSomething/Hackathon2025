import React from 'react';
import { useUserSettings } from '../contexts/UserSettingsContext';
import './UserSettingsForm.css';

const UserSettingsForm: React.FC = () => {
  const { settings, updateSettings } = useUserSettings();

  const educationLevels = [
    { value: 'elementary', label: 'Elementary School' },
    { value: 'middle-school', label: 'Middle School' },
    { value: 'high-school', label: 'High School' },
    { value: 'college', label: 'College/University' },
    { value: 'graduate', label: 'Graduate Level' }
  ];

  const learningStyles = [
    { value: 'visual', label: 'Visual Learner' },
    { value: 'auditory', label: 'Auditory Learner' },
    { value: 'kinesthetic', label: 'Kinesthetic Learner' },
    { value: 'reading-writing', label: 'Reading/Writing Learner' }
  ];

  const handleEducationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ educationLevel: e.target.value });
  };

  const handleLearningStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ learningStyle: e.target.value });
  };

  return (
    <div className="user-settings-form">
      <h3>Learning Preferences</h3>
      <div className="settings-grid">
        <div className="setting-group">
          <label htmlFor="education-level">Education Level:</label>
          <select
            id="education-level"
            value={settings.educationLevel}
            onChange={handleEducationChange}
            className="settings-select"
          >
            {educationLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <label htmlFor="learning-style">Learning Style:</label>
          <select
            id="learning-style"
            value={settings.learningStyle}
            onChange={handleLearningStyleChange}
            className="settings-select"
          >
            {learningStyles.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsForm;
