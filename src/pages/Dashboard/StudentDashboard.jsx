import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="animate-fade-in">
      <h2 className="text-gold">Bentornato, Giudice {currentUser?.displayName}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <Card variant="parchment">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <img src="/assets/dante_avatar.png" alt="Avatar" style={{ width: '60px', borderRadius: '50%', border: '2px solid var(--border-gold)' }} />
            <div>
              <h3>Livello 1 - Esploratore</h3>
              <p className="text-on-parchment-muted">XP: 150 / 500</p>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--accent-gold)', height: '100%', width: '30%' }}></div>
          </div>
        </Card>

        <Card variant="dark-panel">
          <h3 className="text-gold">I Tuoi Fascicoli</h3>
          <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <Link to="/case/mock_case_1" style={{ color: 'var(--text-on-parchment)', textDecoration: 'none' }}>
                📕 Inferno - Caso #1: Paolo e Francesca (Clicca per avviare)
              </Link>
            </li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-muted">📕 Inferno - Caso #2: Ciacco (Disponibile)</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
