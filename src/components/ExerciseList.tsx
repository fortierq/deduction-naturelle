// Exercise list and card components

import React, { useState, useMemo, useEffect } from "react";
import { Exercise, getExerciseKey } from "../exercises";
import { FormulaParser } from "../formulas";
import { useLanguage } from "../i18n";
import { RULE_OPERATORS, RuleOperator } from "../rules";
import { Latex } from "./Latex";
import { Modal } from "./Modal";
import { SyntaxHelpBadge } from "./SyntaxHelpBadge";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  const { t } = useLanguage();

  const getGoalLatex = () => {
    try {
      const goal = FormulaParser.parse(exercise.goal);
      const hypotheses = exercise.hypotheses.map((h) => FormulaParser.parse(h));

      if (hypotheses.length > 0) {
        return (
          hypotheses.map((h) => h.toLatex()).join(", ") +
          " \\vdash " +
          goal.toLatex()
        );
      }
      return "\\vdash " + goal.toLatex();
    } catch {
      return exercise.goal;
    }
  };

  const difficultyLabel =
    exercise.difficulty === "easy"
      ? t.easy
      : exercise.difficulty === "medium"
        ? t.medium
        : t.hard;

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
        <span
          className={`difficulty-badge ${exercise.difficulty} shrink-0 self-start sm:self-auto`}
        >
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
  selectedDifficulties: Set<DifficultyFilter>;
  selectedOperators: Set<RuleOperator>;
  onDifficultyToggle: (diff: DifficultyFilter) => void;
  onOperatorToggle: (operator: RuleOperator) => void;
  exerciseCount: number;
  totalCount: number;
}

type DifficultyFilter = Exercise["difficulty"];
const difficultyOptions: DifficultyFilter[] = ["easy", "medium", "hard"];
const operatorLatexByFilter: Record<RuleOperator, string> = {
  imp: "\\to",
  and: "\\wedge",
  or: "\\vee",
  neg: "\\neg",
  bot: "\\bot",
  raa: "\\mathrm{raa}",
  te: "\\mathrm{te}",
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
  exerciseCount,
  totalCount,
}) => {
  const { t } = useLanguage();
  const drawerWidth = 420;
  const mobileDrawerWidth = `min(${drawerWidth}px, calc(100vw - 1rem))`;
  const difficultyLabels: Record<DifficultyFilter, string> = {
    easy: t.easy,
    medium: t.medium,
    hard: t.hard,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 dark:border-r-2 dark:border-slate-700 z-40 transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ width: mobileDrawerWidth, maxWidth: `${drawerWidth}px` }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative flex items-center justify-center p-4 border-b-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">
              {t.filters}
            </h3>
            <button
              onClick={onClose}
              className="absolute right-4 p-2 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-600 dark:text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
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
                {difficultyOptions.map((diff) => (
                  <label
                    key={diff}
                    className="flex items-center justify-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.has(diff)}
                      onChange={() => onDifficultyToggle(diff)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span
                      className={`text-sm group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors ${selectedDifficulties.has(diff)
                        ? "text-slate-900 dark:text-slate-100 font-medium"
                        : "text-slate-900 dark:text-slate-100"
                        }`}
                    >
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
                {RULE_OPERATORS.map((operator) => (
                  <label
                    key={operator}
                    className="flex items-center justify-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOperators.has(operator)}
                      onChange={() => onOperatorToggle(operator)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span
                      className={`text-sm font-math group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors ${selectedOperators.has(operator)
                        ? "text-slate-900 dark:text-slate-100 font-medium"
                        : "text-slate-900 dark:text-slate-100"
                        }`}
                    >
                      <Latex math={operatorLatexByFilter[operator]} />
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
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-sm text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
            >
              {t.customSequent}
            </button>
            <button
              onClick={onShuffleExercises}
              aria-label={t.randomExercise}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-sm text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
            >
              {t.randomExercise}
            </button>
            <div className="text-center">
              <span className="text-sm text-slate-500 dark:text-slate-100">
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
  onCreateCustomSequent: (goal: string, hypotheses: string[]) => void;
  isDrawerOpen: boolean;
  onDrawerOpenChange: (isOpen: boolean) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onSelect,
  onCreateCustomSequent,
  isDrawerOpen,
  onDrawerOpenChange,
}) => {
  const { t } = useLanguage();
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    Set<DifficultyFilter>
  >(new Set(difficultyOptions));
  const [selectedOperators, setSelectedOperators] = useState<Set<RuleOperator>>(
    new Set(RULE_OPERATORS),
  );
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const [customHypotheses, setCustomHypotheses] = useState("");
  const [shuffledExercises, setShuffledExercises] = useState<Exercise[] | null>(
    null,
  );

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Filter by difficulty
      if (
        selectedDifficulties.size > 0 &&
        !selectedDifficulties.has(ex.difficulty)
      ) {
        return false;
      }
      // Filter by rules (exercise is shown only if all required rules are enabled)
      if (selectedOperators.size === 0) {
        return false;
      }
      if (ex.rules.some((r) => !selectedOperators.has(r))) {
        return false;
      }
      return true;
    });
  }, [exercises, selectedDifficulties, selectedOperators]);

  useEffect(() => {
    setShuffledExercises(null);
  }, [exercises, selectedDifficulties, selectedOperators]);

  const displayedExercises = shuffledExercises ?? filteredExercises;

  const handleDifficultyToggle = (diff: DifficultyFilter) => {
    setSelectedDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(diff)) {
        next.delete(diff);
      } else {
        next.add(diff);
      }
      return next;
    });
  };

  const handleOperatorToggle = (operator: RuleOperator) => {
    setSelectedOperators((prev) => {
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
    setSelectedDifficulties(new Set(difficultyOptions));
    setSelectedOperators(new Set(RULE_OPERATORS));
  };

  const handleCreateCustomSequent = () => {
    const goal = customGoal.trim();
    if (!goal) return;

    const hypotheses = customHypotheses
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    onCreateCustomSequent(goal, hypotheses);
    setIsCustomModalOpen(false);
    setCustomGoal("");
    setCustomHypotheses("");
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
      <Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title={t.customSequentModalTitle}
      >
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            className="modal-input"
            value={customHypotheses}
            onChange={(e) => setCustomHypotheses(e.target.value)}
            placeholder={t.hypotheses}
          />
        </div>
        <label className="block text-slate-700 dark:text-slate-200 mb-2"></label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="modal-input"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder={t.goal}
          />
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <SyntaxHelpBadge text={t.customSequentSyntaxHelp} />
          <button
            className="modal-btn-cancel"
            onClick={() => setIsCustomModalOpen(false)}
          >
            {t.cancel}
          </button>
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
        onClose={() => onDrawerOpenChange(false)}
        onOpenCustomSequent={() => setIsCustomModalOpen(true)}
        onShuffleExercises={handleShuffleExercises}
        selectedDifficulties={selectedDifficulties}
        selectedOperators={selectedOperators}
        onDifficultyToggle={handleDifficultyToggle}
        onOperatorToggle={handleOperatorToggle}
        exerciseCount={filteredExercises.length}
        totalCount={exercises.length}
      />

      {/* Exercise Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {displayedExercises.map((exercise) => (
            <ExerciseCard
              key={getExerciseKey(exercise)}
              exercise={exercise}
              onClick={() => onSelect(exercise)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-2 dark:border-slate-700 rounded-xl p-8 text-center shadow-lg">
          <p className="text-slate-500 dark:text-slate-300 text-lg">
            {t.noExercisesMatch}
          </p>
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
