// Exercise list and card components

import React, { useState, useMemo, useEffect } from 'react';
import { Exercise, RuleType } from '../exercises';
import { FormulaParser } from '../formulas';
import { useLanguage } from '../i18n';
import { Latex } from './Latex';
import { Modal } from './Modal';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  const { t } = useLanguage();
  
  const getGoalLatex = () => {
    try {
      const goal = FormulaParser.parse(exercise.goal);
      const hypotheses = exercise.hypotheses.map(h => FormulaParser.parse(h));
      
      if (hypotheses.length > 0) {
        return hypotheses.map(h => h.toLatex()).join(', ') + ' \\vdash ' + goal.toLatex();
      }
      return '\\vdash ' + goal.toLatex();
    } catch {
      return exercise.goal;
    }
  };

  const difficultyLabel = exercise.difficulty === 'easy' ? t.easy : 
                          exercise.difficulty === 'medium' ? t.medium : t.hard;

  return (
    <button
      type="button"
      className="exercise-card"
      onClick={onClick}
      aria-label={`${t.startProof}: ${exercise.goal}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="text-base sm:text-lg text-slate-900 dark:text-slate-100 min-w-0 overflow-hidden">
          <Latex math={getGoalLatex()} className="exercise-card-math" />
        </div>
        <span className={`difficulty-badge ${exercise.difficulty} shrink-0 self-start sm:self-auto`}>
          {difficultyLabel}
        </span>
      </div>
    </button>
  );
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomSequent: () => void;
  onShuffleExercises: () => void;
  selectedDifficulties: Set<string>;
  selectedOperators: Set<OperatorFilter>;
  onDifficultyToggle: (diff: string) => void;
  onOperatorToggle: (operator: OperatorFilter) => void;
  onClearFilters: () => void;
  exerciseCount: number;
  totalCount: number;
  drawerWidth: number;
  onDrawerWidthChange: (width: number) => void;
}

type OperatorFilter = '→' | '∧' | '∨' | '¬' | '⊥' | 'raa';

const operatorOptions: OperatorFilter[] = ['→', '∧', '∨', '¬', '⊥', 'raa'];
const difficultyOptions = ['easy', 'medium', 'hard'];

const mapRuleToOperator = (rule: RuleType): OperatorFilter => {
  if (rule.startsWith('\\to')) return '→';
  if (rule.startsWith('\\wedge')) return '∧';
  if (rule.startsWith('\\vee')) return '∨';
  if (rule.startsWith('\\neg')) return '¬';
  if (rule === '\\bot_e') return '⊥';
  return 'raa';
};

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCustomSequent,
  onShuffleExercises,
  selectedDifficulties,
  selectedOperators,
  onDifficultyToggle,
  onOperatorToggle,
  onClearFilters,
  exerciseCount,
  totalCount,
  drawerWidth,
  onDrawerWidthChange
}) => {
  const { t } = useLanguage();
  const [isDrawerResizing, setIsDrawerResizing] = useState(false);
  const mobileDrawerWidth = `min(${drawerWidth}px, calc(100vw - 1rem))`;
  const difficultyLabels: Record<string, string> = {
    easy: t.easy,
    medium: t.medium,
    hard: t.hard
  };

  const activeFilterCount = selectedDifficulties.size + selectedOperators.size;

  useEffect(() => {
    if (!isDrawerResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(620, Math.max(320, event.clientX));
      onDrawerWidthChange(nextWidth);
    };

    const handleMouseUp = () => {
      setIsDrawerResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawerResizing, onDrawerWidthChange]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 dark:border-r-2 dark:border-slate-700 z-40 transform transition-transform duration-300 ease-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ width: mobileDrawerWidth, maxWidth: `${drawerWidth}px` }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative flex items-center justify-center p-4 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">{t.filters}</h3>
            <button
              onClick={onClose}
              className="absolute right-4 p-2 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors md:hidden"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* Difficulty Filter */}
            <div className="mb-6 w-full">
              <h4 className="font-semibold text-slate-700 dark:text-slate-100 mb-3 text-sm uppercase tracking-wide text-center">
                {t.difficulty}
              </h4>
              <div className="space-y-2">
                {difficultyOptions.map(diff => (
                  <label key={diff} className="flex items-center justify-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.has(diff)}
                      onChange={() => onDifficultyToggle(diff)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors ${
                      selectedDifficulties.has(diff) ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {difficultyLabels[diff]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="w-full mb-6 border-t-2 border-slate-200 dark:border-slate-700" />

            {/* Operator Filter */}
            <div className="mb-6 w-full">
              <h4 className="font-semibold text-slate-700 dark:text-slate-100 mb-3 text-sm uppercase tracking-wide text-center">
                {t.rulesUsed}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {operatorOptions.map(operator => (
                  <label key={operator} className="flex items-center justify-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedOperators.has(operator)}
                      onChange={() => onOperatorToggle(operator)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm font-math group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors ${
                      selectedOperators.has(operator) ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {operator}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t-2 border-slate-200 dark:border-slate-700 space-y-3">
            <button
              onClick={onOpenCustomSequent}
              className="w-full px-4 py-2 text-sm text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
            >
              {t.customSequent}
            </button>
            <button
              onClick={onShuffleExercises}
              aria-label={t.randomExercise}
              title={t.randomExercise}
              className="w-full px-4 py-2 text-sm text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
            >
              {t.randomExercise}
            </button>
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 text-sm text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
            >
              {t.clearAllFilters} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="text-center">
              <span className="text-sm text-slate-500 dark:text-slate-100">
                {t.showingExercises(exerciseCount, totalCount)}
              </span>
            </div>
          </div>
        </div>

        <div
          className="absolute top-0 right-0 h-full w-2 cursor-col-resize hidden md:block"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDrawerResizing(true);
          }}
        />
      </div>
    </>
  );
};

interface ExerciseListProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onCreateCustomSequent: (goal: string, hypotheses: string[]) => void;
  drawerWidth: number;
  onDrawerWidthChange: (width: number) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onSelect,
  onCreateCustomSequent,
  drawerWidth,
  onDrawerWidthChange
}) => {
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set(difficultyOptions));
  const [selectedOperators, setSelectedOperators] = useState<Set<OperatorFilter>>(new Set(operatorOptions));
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [customHypotheses, setCustomHypotheses] = useState('');
  const [shuffledExercises, setShuffledExercises] = useState<Exercise[] | null>(null);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      // Filter by difficulty
      if (selectedDifficulties.size > 0 && !selectedDifficulties.has(ex.difficulty)) {
        return false;
      }
      // Filter by rules (exercise must use at least one selected rule)
      if (selectedOperators.size > 0 && !ex.rules.some(r => selectedOperators.has(mapRuleToOperator(r)))) {
        return false;
      }
      return true;
    });
  }, [exercises, selectedDifficulties, selectedOperators]);

  useEffect(() => {
    setShuffledExercises(null);
  }, [exercises, selectedDifficulties, selectedOperators]);

  const displayedExercises = shuffledExercises ?? filteredExercises;

  const handleDifficultyToggle = (diff: string) => {
    setSelectedDifficulties(prev => {
      const next = new Set(prev);
      if (next.has(diff)) {
        next.delete(diff);
      } else {
        next.add(diff);
      }
      return next;
    });
  };

  const handleOperatorToggle = (operator: OperatorFilter) => {
    setSelectedOperators(prev => {
      const next = new Set(prev);
      if (next.has(operator)) {
        next.delete(operator);
      } else {
        next.add(operator);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSelectedDifficulties(new Set());
    setSelectedOperators(new Set());
  };

  const activeFilterCount = selectedDifficulties.size + selectedOperators.size;

  const handleCreateCustomSequent = () => {
    const goal = customGoal.trim();
    if (!goal) return;

    const hypotheses = customHypotheses
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    onCreateCustomSequent(goal, hypotheses);
    setIsCustomModalOpen(false);
    setCustomGoal('');
    setCustomHypotheses('');
  };

  const handleShuffleExercises = () => {
    if (filteredExercises.length === 0) return;
    const shuffled = [...filteredExercises];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledExercises(shuffled);
    onSelect(shuffled[0]);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-slate-900 hover:text-blue-700 hover:bg-blue-50 rounded-lg shadow-sm border-2 border-slate-200 hover:border-blue-500 transition-colors md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{t.filters}</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title={t.customSequentModalTitle}
      >
        <label className="block text-slate-700 dark:text-slate-200 mb-2">{t.hypotheses}</label>
        <input
          type="text"
          className="modal-input mb-4"
          value={customHypotheses}
          onChange={(e) => setCustomHypotheses(e.target.value)}
          placeholder={t.customHypothesesPlaceholder}
        />
        <label className="block text-slate-700 dark:text-slate-200 mb-2">{t.goal}</label>
        <input
          type="text"
          className="modal-input"
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          placeholder={t.customGoalPlaceholder}
        />
        <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
          {t.customSequentSyntaxHelp}
        </p>
        <div className="flex gap-3 justify-end mt-4">
          <button className="modal-btn-cancel" onClick={() => setIsCustomModalOpen(false)}>{t.cancel}</button>
          <button
            className="modal-btn-confirm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreateCustomSequent}
            disabled={!customGoal.trim()}
          >
            {t.startProof}
          </button>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenCustomSequent={() => setIsCustomModalOpen(true)}
        onShuffleExercises={handleShuffleExercises}
        selectedDifficulties={selectedDifficulties}
        selectedOperators={selectedOperators}
        onDifficultyToggle={handleDifficultyToggle}
        onOperatorToggle={handleOperatorToggle}
        onClearFilters={handleClearFilters}
        exerciseCount={filteredExercises.length}
        totalCount={exercises.length}
        drawerWidth={drawerWidth}
        onDrawerWidthChange={onDrawerWidthChange}
      />

      {/* Exercise Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
          {displayedExercises.map(exercise => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onClick={() => onSelect(exercise)}
            />
          ))}     
        </div>
      ) : (
        <div className="bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-2 dark:border-slate-700 rounded-xl p-8 text-center shadow-lg">
          <p className="text-slate-500 dark:text-slate-300 text-lg">{t.noExercisesMatch}</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 text-sm text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
          >
            {t.clearFilters}
          </button>
        </div>
      )}
    </section>
  );
};
