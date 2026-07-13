import React from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function Phase7Verdict({ onNext, updateData }) {
  const [selectedVerdict, setSelectedVerdict] = React.useState(null);
  const [motivation, setMotivation] = React.useState('');

  const verdicts = [
    { id: 'confirm', label: 'Confermo la sentenza di Dante', type: 'danger' },
    { id: 'reduce', label: 'Riduco la pena (Attenuanti)', type: 'primary' },
    { id: 'increase', label: 'Aggraverei la pena', type: 'danger' },
    { id: 'absolve', label: 'Assolverei il personaggio', type: 'secondary' }
  ];

  const handleSubmit = () => {
    if (!selectedVerdict || motivation.length < 50) {
      alert("Seleziona un verdetto e inserisci una motivazione valida (almeno 50 caratteri).");
      return;
    }
    updateData({
      verdict: selectedVerdict,
      motivation: motivation,
      xpEarned: 500 // XP calcolati in base alla lunghezza e qualità della risposta in prod
    });
    onNext();
  };

  return (
    <Card variant="parchment" className="animate-fade-in">
      <h3 className="text-crimson" style={{ textAlign: 'center', marginBottom: '2rem' }}>Emetti il tuo Verdetto</h3>
      
      <p style={{ marginBottom: '1.5rem' }}>
        Dopo aver analizzato le prove, l'accusa, la difesa e considerato le implicazioni moderne del peccato, qual è la tua decisione come giudice?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {verdicts.map(v => (
          <button 
            key={v.id}
            className={`btn ${selectedVerdict === v.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem', background: selectedVerdict === v.id ? 'var(--accent-gold)' : 'transparent' }}
            onClick={() => setSelectedVerdict(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {selectedVerdict && (
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Motiva la tua Sentenza (L'argomentazione è fondamentale):
          </label>
          <textarea 
            style={{ 
              width: '100%', 
              minHeight: '150px', 
              padding: '1rem', 
              fontFamily: 'var(--font-body)', 
              background: 'transparent',
              border: '1px solid var(--text-on-parchment-muted)',
              borderRadius: '4px',
              color: 'var(--text-on-parchment)',
              resize: 'vertical'
            }}
            placeholder="Scrivi qui la tua motivazione..."
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
          />
          <div style={{ fontSize: '0.85rem', color: motivation.length < 50 ? 'red' : 'green', marginTop: '0.5rem' }}>
            {motivation.length}/50 caratteri minimi
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <Button onClick={handleSubmit} disabled={!selectedVerdict || motivation.length < 50}>
          Sigilla Sentenza
        </Button>
      </div>
    </Card>
  );
}
