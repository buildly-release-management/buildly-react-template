/* eslint-disable react-hooks/rules-of-hooks */
import { useTheme, useMediaQuery } from '@material-ui/core';

export function isMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}
