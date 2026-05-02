import { HashRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastProvider } from './components/ui';
import { ThemeProvider } from './context/ThemeContext';
import Watermark from './components/ui/Watermark';
import LoginPage from './auth/LoginPage';
import Shell from './layout/Shell';

function AppInner() {
  const { auth } = useAuth();
  return auth ? <Shell /> : <LoginPage />;
}

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppInner />
            <Watermark />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
