import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Select, FormControl, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setCurrentLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
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
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
