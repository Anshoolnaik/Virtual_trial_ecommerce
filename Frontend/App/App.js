import { useState } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';

const Navigator = () => {
  const [screen, setScreen] = useState('home'); // 'home' | 'login' | 'signup'

  if (screen === 'login') return <LoginScreen onNavigate={setScreen} />;
  if (screen === 'signup') return <SignupScreen onNavigate={setScreen} />;
  return <HomeScreen onNavigate={setScreen} />;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navigator />
      </CartProvider>
    </AuthProvider>
  );
}
