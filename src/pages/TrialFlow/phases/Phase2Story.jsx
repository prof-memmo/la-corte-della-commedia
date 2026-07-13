import React from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function Phase2Story({ onNext }) {
  return (
    <Card variant="dark-panel" className="animate-fade-in">
      <h3 className="text-gold" style={{ textAlign: 'center', marginBottom: '2rem' }}>Ricostruzione dei Fatti</h3>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
        Paolo e Francesca sono due anime condannate nel secondo cerchio dell'Inferno, 
        quello dei lussuriosi, dove vengono trascinati eternamente da una bufera incessante.
        Francesca da Polenta era sposata con Gianciotto Malatesta, ma si innamorò del 
        fratello di lui, Paolo. Furono scoperti e uccisi dal marito tradito.
      </p>
      <div style={{ textAlign: 'center' }}>
        <Button onClick={onNext}>Procedi alla Raccolta Prove</Button>
      </div>
    </Card>
  );
}
