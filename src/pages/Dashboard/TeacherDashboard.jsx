import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function TeacherDashboard() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-gold">Dashboard Docente / Presidente di Corte</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <Card variant="parchment">
          <h3 className="text-crimson">Le Tue Classi</h3>
          <ul style={{ listStyle: 'none', marginTop: '1rem', padding: 0 }}>
            <li style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>3°A Liceo Classico</strong>
                <div style={{ fontSize: '0.85rem' }} className="text-on-parchment-muted">Studenti: 24</div>
              </div>
              <Button variant="secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Vedi Progressi</Button>
            </li>
            <li style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>4°B Liceo Scientifico</strong>
                <div style={{ fontSize: '0.85rem' }} className="text-on-parchment-muted">Studenti: 18</div>
              </div>
              <Button variant="secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Vedi Progressi</Button>
            </li>
          </ul>
          <Button style={{ width: '100%', marginTop: '1rem' }}>Crea Nuova Classe</Button>
        </Card>

        <Card variant="dark-panel">
          <h3 className="text-gold">Codici di Invito</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Condividi questo codice con i tuoi studenti per farli unire alla tua classe (Corte).
          </p>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', textAlign: 'center', borderRadius: '8px', fontSize: '1.5rem', letterSpacing: '0.2em' }}>
            <strong>3A-DANTE-24</strong>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Button variant="secondary">Genera Nuovo Codice</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
