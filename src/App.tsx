// Main App component

import React, { useState, useCallback, useRef } from 'react';
import { Formula } from './formulas';
import { ProofTree, ProofResult, ProofNode } from './proof';
import { Exercise, ParsedExercise, exercises, parseExercise } from './exercises';
import { 
  ExerciseList, 
  FormulaInputModal, 
  ProofNodeDisplay,
  RulePanel,
  Latex
} from './components';
import { useLanguage, LanguageSelector } from './i18n';

type MessageType = 'success' | 'error' | 'info';

interface Message {
  text: string;
  type: MessageType;
}

type ModalAction = 'impl-elim' | 'and-elim-left' | 'and-elim-right' | 'or-elim' | 'neg-elim';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  placeholder: string;
  action: ModalAction;
}

const App: React.FC = () => {
  const { t } = useLanguage();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [parsedExercise, setParsedExercise] = useState<ParsedExercise | null>(null);
  const [proofTree, setProofTree] = useState<ProofTree | null>(null);
  const proofTreeRef = useRef<ProofTree | null>(null);
  const [, setVersion] = useState(0); // Used to trigger re-renders
  const [message, setMessage] = useState<Message | null>(null);
  const [modalState, setModalState] = useState<ModalConfig | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Force re-render without losing the class instance
  const forceUpdate = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  const showMessage = useCallback((text: string, type: MessageType) => {
    setMessage({ text, type });
    if (type !== 'success') {
      setTimeout(() => setMessage(null), 5000);
    }
  }, []);

  const selectExercise = useCallback((exercise: Exercise) => {
    const parsed = parseExercise(exercise);
    const tree = new ProofTree(parsed.goalFormula, parsed.hypothesesFormulas);
    setCurrentExercise(exercise);
    setParsedExercise(parsed);
    setProofTree(tree);
    proofTreeRef.current = tree;
    setMessage(null);
  }, []);

  const resetProof = useCallback(() => {
    if (parsedExercise) {
      const tree = new ProofTree(parsedExercise.goalFormula, parsedExercise.hypothesesFormulas);
      setProofTree(tree);
      proofTreeRef.current = tree;
      setMessage(null);
    }
  }, [parsedExercise]);

  const backToExercises = useCallback(() => {
    setCurrentExercise(null);
    setParsedExercise(null);
    setProofTree(null);
    setMessage(null);
  }, []);

  const undo = useCallback(() => {
    if (proofTree?.undo()) {
      forceUpdate();
      showMessage(t.undidLastAction, 'info');
    } else {
      showMessage(t.nothingToUndo, 'error');
    }
  }, [proofTree, showMessage, forceUpdate, t]);

  const handleNodeClick = useCallback((node: ProofNode) => {
    if (!node.rule && !node.isComplete && proofTree) {
      proofTree.selectedNode = node;
      forceUpdate();
    }
  }, [proofTree, forceUpdate]);

  const handleResult = useCallback((result: ProofResult) => {
    if (result.success) {
      forceUpdate();
      setMessage(null);
      // Check completion
      if (proofTreeRef.current?.isComplete()) {
        setShowCompletionModal(true);
      }
    } else {
      showMessage(result.error || t.unknownError, 'error');
    }
  }, [showMessage, forceUpdate, t]);

  const handleModalSubmit = useCallback((formula: Formula) => {
    const tree = proofTreeRef.current;
    if (!tree) return;

    let result: ProofResult;
    switch (modalState?.action) {
      case 'impl-elim':
        result = tree.applyImplElim(formula);
        break;
      case 'and-elim-left':
        result = tree.applyAndElimLeft(formula);
        break;
      case 'and-elim-right':
        result = tree.applyAndElimRight(formula);
        break;
      case 'or-elim':
        result = tree.applyOrElim(formula);
        break;
      case 'neg-elim':
        result = tree.applyNegElim(formula);
        break;
      default:
        return;
    }
    handleResult(result);
    setModalState(null);
  }, [modalState, handleResult]);

  const applyRule = useCallback((ruleName: string) => {
    if (!proofTree || !proofTree.selectedNode) {
      showMessage(t.noGoalSelected, 'error');
      return;
    }

    const node = proofTree.selectedNode;
    let result: ProofResult;

    switch (ruleName) {
      case 'axiom': {
        const hypotheses = node.sequent.context;
        const matchingHypotheses = hypotheses.filter(h => h.equals(node.sequent.goal));
        
        if (matchingHypotheses.length === 0) {
          showMessage(t.noHypothesisMatches(node.sequent.goal.toDisplayString()), 'error');
          return;
        }
        result = proofTree.applyAxiom(matchingHypotheses[0]);
        break;
      }
      
      case 'impl-intro':
        result = proofTree.applyImplIntro();
        break;
      
      case 'impl-elim':
        setModalState({
          isOpen: true,
          title: t.implElimTitle,
          description: t.implElimDesc(node.sequent.goal.toDisplayString()),
          placeholder: `A -> ${node.sequent.goal.toDisplayString()}`,
          action: 'impl-elim'
        });
        return;
      
      case 'and-intro':
        result = proofTree.applyAndIntro();
        break;
      
      case 'and-elim-left':
        setModalState({
          isOpen: true,
          title: t.andElimLeftTitle,
          description: t.andElimLeftDesc(node.sequent.goal.toDisplayString()),
          placeholder: `${node.sequent.goal.toDisplayString()} & B`,
          action: 'and-elim-left'
        });
        return;
      
      case 'and-elim-right':
        setModalState({
          isOpen: true,
          title: t.andElimRightTitle,
          description: t.andElimRightDesc(node.sequent.goal.toDisplayString()),
          placeholder: `A & ${node.sequent.goal.toDisplayString()}`,
          action: 'and-elim-right'
        });
        return;
      
      case 'or-intro-left':
        result = proofTree.applyOrIntroLeft();
        break;
      
      case 'or-intro-right':
        result = proofTree.applyOrIntroRight();
        break;
      
      case 'or-elim':
        setModalState({
          isOpen: true,
          title: t.orElimTitle,
          description: t.orElimDesc,
          placeholder: 'A | B',
          action: 'or-elim'
        });
        return;
      
      case 'neg-intro':
        result = proofTree.applyNegIntro();
        break;
      
      case 'neg-elim':
        if (node.sequent.goal.type !== 'bottom') {
          showMessage(t.goalMustBeFalsum, 'error');
          return;
        }
        setModalState({
          isOpen: true,
          title: t.negElimTitle,
          description: t.negElimDesc,
          placeholder: 'A',
          action: 'neg-elim'
        });
        return;
      
      case 'absurd':
        result = proofTree.applyAbsurd();
        break;
      
      case 'raa':
        result = proofTree.applyRAA();
        break;
      
      default:
        showMessage(t.unknownRule, 'error');
        return;
    }

    handleResult(result);
  }, [proofTree, showMessage, handleResult, t]);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-slate-800 to-blue-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2">{t.appTitle}</h1>
            <p className="text-lg opacity-90">{t.appSubtitle}</p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {!currentExercise ? (
          <ExerciseList exercises={exercises} onSelect={selectExercise} />
        ) : (
          <>
            {/* Exercise Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentExercise.title}</h2>
              <p className="text-slate-600 mb-4">{currentExercise.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/50 rounded-lg px-4 py-2">
                  <strong className="text-slate-700">{t.goal}:</strong>
                  <span className="text-lg text-blue-600 font-semibold ml-2">
                    <Latex math={parsedExercise?.goalFormula.toLatex() || ''} />
                  </span>
                </div>
                <div className="bg-white/50 rounded-lg px-4 py-2">
                  <strong className="text-slate-700">{t.hypotheses}:</strong>
                  <span className="text-lg ml-2">
                    {parsedExercise && parsedExercise.hypothesesFormulas.length > 0
                      ? <Latex math={parsedExercise.hypothesesFormulas.map(h => h.toLatex()).join(', ')} />
                      : t.none}
                  </span>
                </div>
              </div>
            </div>

            {/* Proof Tree */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg min-h-[400px] overflow-x-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{t.proofTree}</h3>
              <div className="flex justify-center p-4">
                {proofTree && (
                  <ProofNodeDisplay
                    node={proofTree.root}
                    selectedNode={proofTree.selectedNode}
                    onNodeClick={handleNodeClick}
                  />
                )}
              </div>
            </div>

            {/* Rule Panel */}
            <RulePanel onRuleClick={applyRule} />

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
                onClick={resetProof}
              >
                {t.resetProof}
              </button>
              <button 
                className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
                onClick={backToExercises}
              >
                {t.backToExercises}
              </button>
              <button 
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
                onClick={undo}
              >
                {t.undo}
              </button>
            </div>

            {/* Message Area */}
            {message && (
              <div className={`rounded-lg p-4 text-center font-semibold ${
                message.type === 'success' ? 'bg-green-100 border-2 border-green-500 text-green-800' :
                message.type === 'error' ? 'bg-red-100 border-2 border-red-500 text-red-800' :
                'bg-blue-100 border-2 border-blue-500 text-blue-800'
              } ${message.type === 'success' ? 'animate-pulse' : ''}`}>
                {message.text}
              </div>
            )}
          </>
        )}
      </main>

      {/* Formula Input Modal */}
      {modalState && (
        <FormulaInputModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState(null)}
          title={modalState.title}
          description={modalState.description}
          placeholder={modalState.placeholder}
          onSubmit={handleModalSubmit}
          onError={(msg) => showMessage(msg, 'error')}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-11/12 shadow-2xl text-center transform animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">{t.proofComplete}</h2>
            <p className="text-slate-600 mb-6">
              {t.congratulations}
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <span className="text-xl text-green-700">
                <Latex math={
                  (parsedExercise?.hypothesesFormulas.length 
                    ? parsedExercise.hypothesesFormulas.map(h => h.toLatex()).join(', ') + ' \\vdash '
                    : '\\vdash ') +
                  (parsedExercise?.goalFormula.toLatex() || '')
                } />
              </span>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  backToExercises();
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                {t.chooseAnotherExercise}
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                {t.viewProof}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
