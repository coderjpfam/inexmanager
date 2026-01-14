import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Custom hook that provides all themed colors used in authentication pages
 * (sign-in, sign-up, auth)
 */
export function useAuthColors() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const containerBg = useThemeColor(
    { light: '#E8F4F8', dark: '#0F172A' },
    'background'
  );
  const cardBg = useThemeColor(
    { light: '#FFFFFF', dark: '#1A2332' },
    'background'
  );
  const borderColor = useThemeColor(
    { light: '#D1D5DB', dark: '#374151' },
    'icon'
  );
  const inputBg = useThemeColor({}, 'background');
  const placeholderColor = useThemeColor(
    { light: '#9CA3AF', dark: '#6B7280' },
    'icon'
  );

  return {
    backgroundColor,
    textColor,
    containerBg,
    cardBg,
    borderColor,
    inputBg,
    placeholderColor,
  };
}
