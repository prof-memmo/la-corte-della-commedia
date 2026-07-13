import React from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function Phase45Arguments({ phaseType, onNext }) {
  const isAccusa = phaseType === 'accusa';
  
  return (
    <Card variant="dark-panel" className="animate-fade-in">
      <h3 className={isAccusa ? "text-crimson" : "text-gold"} style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {isAccusa ? "L'Accusa di Dante" : "La Difesa (Contesto)"}
      </h3>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        {isAccusa ? (
          <>
            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              "Amor, ch'a nullo amato amar perdona, / mi prese del costui piacer sì forte, / che, come vedi, ancor non m'abbandona."
            </p>
            <p>Dante condanna la sottomissione della ragione al desiderio (istinto). Il contrappasso (la bufera eterna) riflette la tempesta delle passioni a cui si sono abbandonati in vita.</p>
          </>
        ) : (
          <>
            <p>Francesca argomenta che è stata vittima dell'"Amore", personificato come una forza irresistibile tipica della concezione cortese. Inoltre, il matrimonio con Gianciotto era stato combinato per ragioni politiche e, secondo alcune fonti storiche, ottenuto con l'inganno.</p>
          </>
        )}
      </div>
      <div style={{ textAlign: 'center' }}>
        <Button onClick={onNext}>{isAccusa ? 'Ascolta la Difesa' : 'Confronta con il Moderno'}</Button>
      </div>
    </Card>
  );
}
