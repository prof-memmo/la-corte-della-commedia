import React from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function Phase6Modern({ onNext }) {
  return (
    <Card variant="parchment" className="animate-fade-in">
      <h3 className="text-crimson" style={{ textAlign: 'center', marginBottom: '2rem' }}>Dante Oggi</h3>
      <p style={{ marginBottom: '1rem' }}>
        Nel mondo contemporaneo, il tema della "lussuria" si evolve spesso nella difficoltà di controllare gli istinti di fronte all'immediatezza digitale e ai social media, oppure nel modo in cui giustifichiamo azioni sbagliate dicendo "non ho potuto farne a meno".
      </p>
      <div style={{ padding: '1.5rem', background: 'var(--bg-parchment-dark)', borderRadius: '8px', marginBottom: '2rem' }}>
        <strong>Riflessione:</strong>
        <p style={{ marginTop: '0.5rem' }}>Fino a che punto le emozioni forti giustificano le nostre scelte? Siamo padroni delle nostre passioni o vittime di esse?</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Button onClick={onNext}>Prepara il Verdetto</Button>
      </div>
    </Card>
  );
}
