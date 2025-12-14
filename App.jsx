import { useState, useEffect } from 'react';
import { TEAMS } from './data/f1Data';
import TeamSelection from './components/TeamSelection';
import GameScreen from './components/GameScreen';
import OutcomeScreen from './components/OutcomeScreen';
import { generateScenario } from './game/scenarioGenerator';
import { simulateOutcome, getDecisionSpeed } from './game/simulator';
import { generateVerdict } from './game/verdictSystem';
import { getProgression, updateProgression } from './game/progressionSystem';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('team-selection'); // team-selection, playing, outcome
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [progression, setProgression] = useState(getProgression());

  // Load team from localStorage on mount
  useEffect(() => {
    const savedTeamId = localStorage.getItem('boxbox_team');
    if (savedTeamId) {
      const team = TEAMS.find(t => t.id === savedTeamId);
      if (team) {
        setSelectedTeam(team);
        setGameState('playing');
        setScenario(generateScenario());
      }
    }
  }, []);

  const handleTeamSelection = (team) => {
    setSelectedTeam(team);
    localStorage.setItem('boxbox_team', team.id);
    setGameState('playing');
    setScenario(generateScenario());
  };

  const handleDecision = (decision, timeRemaining) => {
    // Simulate outcome
    const result = simulateOutcome(scenario, decision, selectedTeam);
    const speed = getDecisionSpeed(timeRemaining);
    const verdictData = generateVerdict(result, selectedTeam, speed, scenario);

    setOutcome(result);
    setVerdict(verdictData);
    setGameState('outcome');

    // Update progression
    const newProgression = updateProgression(result);
    setProgression(newProgression);
  };

  const handleNextRound = () => {
    setScenario(generateScenario());
    setOutcome(null);
    setVerdict(null);
    setGameState('playing');
  };

  const handleChangeTeam = () => {
    localStorage.removeItem('boxbox_team');
    setSelectedTeam(null);
    setScenario(null);
    setOutcome(null);
    setVerdict(null);
    setGameState('team-selection');
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      {gameState === 'team-selection' && (
        <TeamSelection onSelectTeam={handleTeamSelection} />
      )}

      {gameState === 'playing' && scenario && (
        <GameScreen
          scenario={scenario}
          team={selectedTeam}
          onDecision={handleDecision}
          progression={progression}
        />
      )}

      {gameState === 'outcome' && outcome && verdict && (
        <OutcomeScreen
          scenario={scenario}
          outcome={outcome}
          verdict={verdict}
          team={selectedTeam}
          progression={progression}
          onNextRound={handleNextRound}
          onChangeTeam={handleChangeTeam}
        />
      )}
    </div>
  );
}

export default App;
