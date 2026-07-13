import React from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function Phase3Evidence({ onNext }) {
  return (
    <Card variant="parchment" className="animate-fade-in">
      <h3 className="text-crimson" style={{ textAlign: 'center', marginBottom: '2rem' }}>Raccolta Prove (Minigioco)</h3>
      <div style={{ padding: '2rem', border: '2px dashed var(--border-gold)', textAlign: 'center', marginBottom: '2rem' }}>
        <p className="text-on-parchment-muted" style={{ marginBottom: '1rem' }}>
          Qui andrà il motore dei minigiochi (Drag & Drop, Trova l'intruso, Vero/Falso) caricato dal database.
        </p>
        <p>[ Simulazione Completamento ]</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Button onClick={onNext}>Analizza l'Accusa</Button>
      </div>
    </Card>
  );
}
