import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

import Phase1Intro from './phases/Phase1Intro';
import Phase2Story from './phases/Phase2Story';
import Phase3Evidence from './phases/Phase3Evidence';
import Phase45Arguments from './phases/Phase45Arguments';
import Phase6Modern from './phases/Phase6Modern';
import Phase7Verdict from './phases/Phase7Verdict';
import Phase8Sentence from './phases/Phase8Sentence';

export default function TrialFlow({ caseId = 'mock_case_1' }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [trialData, setTrialData] = useState({
    verdict: null,
    motivation: '',
    xpEarned: 0
  });

  // Mock case data (In produzione verrà fetchata tramite firestoreApi.getCaseDetails)
  const caseData = {
    title: "Caso #1: Paolo e Francesca",
    character: "Francesca da Rimini",
    circle: "Secondo Cerchio (Lussuriosi)",
    canto: "V"
  };

  const nextPhase = () => setCurrentPhase(p => Math.min(p + 1, 8));
  const prevPhase = () => setCurrentPhase(p => Math.max(p - 1, 1));

  const updateTrialData = (data) => setTrialData(prev => ({ ...prev, ...data }));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="text-gold">Tribunale - {caseData.title}</h2>
        <span className="text-muted">Fase {currentPhase} di 8</span>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', height: '6px', borderRadius: '3px', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--accent-gold)', height: '100%', width: `${(currentPhase / 8) * 100}%`, transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="trial-phase-container">
        {currentPhase === 1 && <Phase1Intro caseData={caseData} onNext={nextPhase} />}
        {currentPhase === 2 && <Phase2Story onNext={nextPhase} />}
        {currentPhase === 3 && <Phase3Evidence onNext={nextPhase} />}
        {currentPhase === 4 && <Phase45Arguments phaseType="accusa" onNext={nextPhase} />}
        {currentPhase === 5 && <Phase45Arguments phaseType="difesa" onNext={nextPhase} />}
        {currentPhase === 6 && <Phase6Modern onNext={nextPhase} />}
        {currentPhase === 7 && <Phase7Verdict onNext={nextPhase} updateData={updateTrialData} />}
        {currentPhase === 8 && <Phase8Sentence trialData={trialData} caseData={caseData} />}
      </div>
      
      {currentPhase > 1 && currentPhase < 8 && (
        <div style={{ marginTop: '2rem' }}>
          <Button variant="secondary" onClick={prevPhase}>Indietro</Button>
        </div>
      )}
    </div>
  );
}
