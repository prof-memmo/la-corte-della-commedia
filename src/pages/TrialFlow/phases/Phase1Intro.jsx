import React from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function Phase1Intro({ caseData, onNext }) {
  return (
    <Card variant="parchment" className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 className="text-crimson">Apertura del Fascicolo</h3>
        <h2 className="text-on-parchment" style={{ fontFamily: 'var(--font-heading)' }}>{caseData.character}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <img src="/assets/dante_avatar.png" alt="Ritratto" style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--text-on-parchment-muted)' }} />
        </div>
        <div>
          <p><strong>Canto:</strong> {caseData.canto}</p>
          <p><strong>Cerchio:</strong> {caseData.circle}</p>
          <hr style={{ margin: '1rem 0', borderColor: 'var(--text-on-parchment-muted)', opacity: 0.3 }} />
          <p>
            Giudice, la Corte è convocata per esaminare questo spirito. 
            Il tuo compito sarà analizzare i fatti, raccogliere le prove, 
            ascoltare l'accusa formulata da Dante e considerare eventuali attenuanti.
          </p>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.2)', borderRadius: '4px' }}>
            <strong>Ricompense potenziali:</strong>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>500 XP</li>
              <li>Badge "Analista Storico"</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Button onClick={onNext}>Inizia Procedimento</Button>
      </div>
    </Card>
  );
}
