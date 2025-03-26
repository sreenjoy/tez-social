import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import useThemeStore from '../store/themeStore';
import ThemeToggle from './ThemeToggle';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        backgroundImage: isDark 
          ? 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
          : 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          zIndex: 10
        }}
      >
        <ThemeToggle />
      </Box>
      
      <Box 
        sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '450px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Box
          component="img"
          src={isDark ? "/logo-white.svg" : "/logo.svg"}
          alt="Tez Social Logo"
          sx={{
            width: 'auto',
            height: 40,
            mb: 2
          }}
        />
      </Box>
      
      {children}
      
      <Box 
        sx={{ 
          mt: 3, 
          textAlign: 'center',
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
          fontSize: '0.75rem'
        }}
      >
        © {new Date().getFullYear()} Tez Social. All rights reserved.
      </Box>
    </Box>
  );
};

export default AuthLayout; 