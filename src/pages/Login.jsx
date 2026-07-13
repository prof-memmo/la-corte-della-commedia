import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // Se l'utente è già loggato, lo rimandiamo alla dashboard
  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card variant="parchment" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <img src="/assets/court_emblem.png" alt="Emblema della Corte" style={{ width: '120px', marginBottom: '1rem' }} />
        <h2 className="text-gold">La Corte della Commedia</h2>
        <p className="text-on-parchment-muted" style={{ marginBottom: '2rem' }}>
          Entra nel tribunale e assumi il ruolo di giudice. Esamina i casi, ascolta l'accusa e la difesa, ed emetti la tua sentenza.
        </p>
        <Button onClick={handleLogin} style={{ width: '100%', justifyContent: 'center' }}>
          <LogIn size={20} />
          Accedi con Google
        </Button>
      </Card>
    </div>
  );
}
