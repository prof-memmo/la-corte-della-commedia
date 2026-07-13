import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-crimson">Pannello di Controllo Supremo (Admin)</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <Card variant="dark-panel" style={{ textAlign: 'center' }}>
          <h3 className="text-gold">Statistiche Globali</h3>
          <ul style={{ listStyle: 'none', marginTop: '1rem', padding: 0 }}>
            <li style={{ padding: '0.5rem 0' }}>Utenti Registrati: <strong>142</strong></li>
            <li style={{ padding: '0.5rem 0' }}>Casi Completati: <strong>845</strong></li>
            <li style={{ padding: '0.5rem 0' }}>Corti Attive: <strong>12</strong></li>
          </ul>
        </Card>

        <Card variant="parchment" style={{ textAlign: 'center' }}>
          <h3 className="text-crimson">Gestione Contenuti</h3>
          <p className="text-on-parchment-muted" style={{ marginBottom: '1rem' }}>
            Aggiungi o modifica Personaggi, Casi, e Domande senza toccare il codice.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button variant="primary">Gestisci Casi</Button>
            <Button variant="secondary">Gestisci Personaggi</Button>
            <Button variant="secondary">Gestisci Badge</Button>
          </div>
        </Card>

        <Card variant="dark-panel" style={{ textAlign: 'center' }}>
          <h3 className="text-gold">Gestione Utenti</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Promuovi docenti o sospendi account.
          </p>
          <Button variant="secondary" style={{ width: '100%' }}>Visualizza Utenti</Button>
        </Card>
      </div>
    </div>
  );
}
