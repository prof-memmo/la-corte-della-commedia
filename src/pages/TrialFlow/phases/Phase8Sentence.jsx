import React from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function Phase8Sentence({ trialData, caseData }) {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card variant="parchment" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', border: '4px solid var(--border-gold)' }}>
        <img src="/assets/court_emblem.png" alt="Sigillo" style={{ width: '80px', marginBottom: '1rem' }} />
        
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-on-parchment)', marginBottom: '0.5rem' }}>
          Sentenza Ufficiale
        </h2>
        <h4 className="text-crimson" style={{ marginBottom: '2rem' }}>{caseData.character}</h4>
        
        <div style={{ textAlign: 'left', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '4px' }}>
          <p style={{ marginBottom: '0.5rem' }}><strong>Verdetto:</strong> {trialData.verdict}</p>
          <p><strong>Motivazione del Giudice:</strong></p>
          <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"{trialData.motivation}"</p>
        </div>

        <div style={{ margin: '2rem 0', fontSize: '1.2rem' }}>
          <span className="text-gold" style={{ fontWeight: 'bold' }}>+{trialData.xpEarned} XP</span>
        </div>

        <Button onClick={() => navigate('/dashboard')}>Archivia nel Registro</Button>
      </Card>
    </div>
  );
}
