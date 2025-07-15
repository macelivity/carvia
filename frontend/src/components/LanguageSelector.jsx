import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Select, FormControl, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

// Verfügbare Sprachen mit Ländercodes
const languages = [
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'es', name: 'Español', flag: 'ES' }
];

/**
 * Flaggen-Icon Komponente - Zeigt Länderflaggen mit CSS an
 * @param {string} countryCode - Ländercode für die Flagge
 */
const FlagIcon = ({ countryCode }) => (
  <Box
    component="span"
    sx={{
      width: 20,
      height: 15,
      display: 'inline-block',
      backgroundImage: `url(https://flagcdn.com/w20/${countryCode.toLowerCase()}.png)`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      borderRadius: '2px',
      border: '1px solid rgba(0,0,0,0.1)'
    }}
  />
);

/**
 * LanguageSelector Komponente - Ermöglicht die Auswahl der Anwendungssprache
 */
export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  /**
   * Behandelt die Sprachänderung
   * @param {Object} event - Select-Event
   */
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setCurrentLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    // Speichere die gewählte Sprache im lokalen Speicher
    localStorage.setItem('language', newLanguage);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon sx={{ color: 'inherit' }} />
      <FormControl size="small" variant="outlined">
        <Select
          value={currentLanguage}
          onChange={handleLanguageChange}
          sx={{
            color: 'inherit',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.7)'
            },
            '& .MuiSvgIcon-root': {
              color: 'inherit'
            }
          }}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlagIcon countryCode={language.flag} />
                <span>{language.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
