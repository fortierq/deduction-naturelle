// Exercise list and card components

import React, { useState, useMemo } from 'react';
import { Exercise, RuleType, allRules } from '../exercises';
import { FormulaParser } from '../formulas';
import { useLanguage } from '../i18n';
import { Latex } from './Latex';

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
    <div className="exercise-card" onClick={onClick}>
      <h4 className="font-bold text-slate-800 mb-2">{exercise.title}</h4>
      <p className="text-slate-600 text-sm mb-2">{exercise.description}</p>
      <div className="text-lg text-blue-600 mb-3">
        <Latex math={getGoalLatex()} />
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {exercise.rules.map(rule => (
          <span key={rule} className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded font-math">
            {rule}
          </span>
        ))}
      </div>
      <span className={`difficulty-badge ${exercise.difficulty}`}>
        {difficultyLabel.replace(/^[🌱🌿🌳]\s*/, '')}
      </span>
    </div>
  );
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDifficulties: Set<string>;
  selectedRules: Set<RuleType>;
  onDifficultyToggle: (diff: string) => void;
  onRuleToggle: (rule: RuleType) => void;
  onClearFilters: () => void;
  exerciseCount: number;
  totalCount: number;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedDifficulties,
  selectedRules,
  onDifficultyToggle,
  onRuleToggle,
  onClearFilters,
  exerciseCount,
  totalCount
}) => {
  const { t } = useLanguage();
  const difficulties = ['easy', 'medium', 'hard'];
  const difficultyLabels: Record<string, string> = {
    easy: t.easy,
    medium: t.medium,
    hard: t.hard
  };

  const activeFilterCount = selectedDifficulties.size + selectedRules.size;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">{t.filters}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Difficulty Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                {t.difficulty}
              </h4>
              <div className="space-y-2">
                {difficulties.map(diff => (
                  <label key={diff} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.has(diff)}
                      onChange={() => onDifficultyToggle(diff)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm group-hover:text-blue-600 transition-colors ${
                      selectedDifficulties.has(diff) ? 'text-blue-600 font-medium' : 'text-slate-600'
                    }`}>
                      {difficultyLabels[diff]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rules Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                {t.rulesUsed}
              </h4>
              <div className="space-y-2">
                {allRules.map(rule => (
                  <label key={rule} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedRules.has(rule)}
                      onChange={() => onRuleToggle(rule)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm font-math group-hover:text-blue-600 transition-colors ${
                      selectedRules.has(rule) ? 'text-blue-600 font-medium' : 'text-slate-600'
                    }`}>
                      {rule}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 space-y-3">
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
            >
              {t.clearAllFilters} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="text-center">
              <span className="text-sm text-slate-500">
                {t.showingExercises(exerciseCount, totalCount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ExerciseListProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onSelect }) => {
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set());
  const [selectedRules, setSelectedRules] = useState<Set<RuleType>>(new Set());

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      // Filter by difficulty
      if (selectedDifficulties.size > 0 && !selectedDifficulties.has(ex.difficulty)) {
        return false;
      }
      // Filter by rules (exercise must use at least one selected rule)
      if (selectedRules.size > 0 && !ex.rules.some(r => selectedRules.has(r))) {
        return false;
      }
      return true;
    });
  }, [exercises, selectedDifficulties, selectedRules]);

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

  const handleRuleToggle = (rule: RuleType) => {
    setSelectedRules(prev => {
      const next = new Set(prev);
      if (next.has(rule)) {
        next.delete(rule);
      } else {
        next.add(rule);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSelectedDifficulties(new Set());
    setSelectedRules(new Set());
  };

  const activeFilterCount = selectedDifficulties.size + selectedRules.size;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between border-b-2 border-blue-500 pb-2 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {t.selectExercise}
        </h2>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg shadow-sm border border-slate-200 transition-colors"
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

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedDifficulties={selectedDifficulties}
        selectedRules={selectedRules}
        onDifficultyToggle={handleDifficultyToggle}
        onRuleToggle={handleRuleToggle}
        onClearFilters={handleClearFilters}
        exerciseCount={filteredExercises.length}
        totalCount={exercises.length}
      />

      {/* Exercise Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map(exercise => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onClick={() => onSelect(exercise)}
            />
          ))}     
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center shadow-lg">
          <p className="text-slate-500 text-lg">{t.noExercisesMatch}</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-blue-600 hover:underline"
          >
            {t.clearFilters}
          </button>
        </div>
      )}
    </section>
  );
};
