// Main App component

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Formula, FormulaParser } from "./formulas";
import { ProofTree, ProofResult, ProofNode, ProofMessageKey } from "./proof";
import {
  Exercise,
  ParsedExercise,
  exercises,
  parseExercise,
} from "./exercises";
import { ModalRuleName, isModalRuleName, RuleName } from "./rules";
import { ExerciseList } from "./components/ExerciseList";
import { ProofNodeDisplay } from "./components/ProofTree";
import { Latex } from "./components/Latex";
import { RulePanel } from "./components/RulePanel";
import { SyntaxHelpBadge } from "./components/SyntaxHelpBadge";
import { Modal } from "./components/Modal";
import { useLanguage, LanguageSelector } from "./i18n";
import { NotationRule } from "./notation";

type MessageType = "success" | "error" | "info";

interface Message {
  text: string;
  type: MessageType;
}

interface ModalConfig {
  formulaTemplate?: string;
  variableNames?: string[];
  action: ModalRuleName;
}

const App: React.FC = () => {
  const { t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [parsedExercise, setParsedExercise] = useState<ParsedExercise | null>(
    null,
  );
  const [proofTree, setProofTree] = useState<ProofTree | null>(null);
  const proofTreeRef = useRef<ProofTree | null>(null);
  const [, setVersion] = useState(0); // Used to trigger re-renders
  const [message, setMessage] = useState<Message | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);
  const [modalState, setModalState] = useState<ModalConfig | null>(null);
  const [panelModalValues, setPanelModalValues] = useState<
    Record<string, string>
  >({});
  const panelModalFirstInputRef = useRef<HTMLInputElement | null>(null);
  const [isRulesDrawerOpen, setIsRulesDrawerOpen] = useState(false);
  const [notationRule, setNotationRule] = useState<NotationRule | null>(null);
  const [isNotationModalOpen, setIsNotationModalOpen] = useState(false);
  const [notationInput, setNotationInput] = useState("");
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(
    () => window.matchMedia("(min-width: 768px)").matches,
  );
  const [drawerWidth, setDrawerWidth] = useState(420);
  const [isRulesDrawerResizing, setIsRulesDrawerResizing] = useState(false);
  const isLeftPanelOpen = currentExercise
    ? isRulesDrawerOpen
    : isFiltersDrawerOpen;
  const desktopDrawerOffset = isLeftPanelOpen ? drawerWidth + 16 : 16;
  const mobileDrawerWidth = `min(${drawerWidth}px, calc(100vw - 1rem))`;

  const proofMessages = useCallback(() => {
    const entries: Record<ProofMessageKey, string> = {
      noGoalSelected: t.noGoalSelected,
      goalMustBeFalsum: t.goalMustBeFalsum,
      proofHypothesisNotInContext: t.proofHypothesisNotInContext,
      proofHypothesisGoalMismatch: t.proofHypothesisGoalMismatch,
      proofGoalNotImplication: t.proofGoalNotImplication,
      proofSelectedNotImplication: t.proofSelectedNotImplication,
      proofImplicationConclusionMismatch: t.proofImplicationConclusionMismatch,
      proofGoalNotConjunction: t.proofGoalNotConjunction,
      proofSelectedNotConjunction: t.proofSelectedNotConjunction,
      proofConjunctionLeftMismatch: t.proofConjunctionLeftMismatch,
      proofConjunctionRightMismatch: t.proofConjunctionRightMismatch,
      proofGoalNotDisjunction: t.proofGoalNotDisjunction,
      proofSelectedNotDisjunction: t.proofSelectedNotDisjunction,
      proofGoalNotNegation: t.proofGoalNotNegation,
      proofGoalNotExcludedMiddle: t.proofGoalNotExcludedMiddle,
    };
    return entries;
  }, [t]);

  // Force re-render without losing the class instance
  const forceUpdate = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const showMessage = useCallback((text: string, type: MessageType) => {
    if (messageTimeoutRef.current !== null) {
      window.clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    setMessage({ text, type });
    if (type !== "success") {
      messageTimeoutRef.current = window.setTimeout(() => {
        setMessage(null);
        messageTimeoutRef.current = null;
      }, 5000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current !== null) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const startExercise = useCallback(
    (exercise: Exercise, parsed: ParsedExercise) => {
      const tree = new ProofTree(
        parsed.goalFormula,
        parsed.hypothesesFormulas,
        proofMessages(),
      );
      const isSmallScreen = window.matchMedia("(max-width: 767px)").matches;
      setCurrentExercise(exercise);
      setParsedExercise(parsed);
      setProofTree(tree);
      proofTreeRef.current = tree;
      setIsRulesDrawerOpen(!isSmallScreen);
      setIsFiltersDrawerOpen(false);
      setNotationRule(null);
      setIsNotationModalOpen(false);
      setNotationInput("");
      setModalState(null);
      setMessage(null);
    },
    [proofMessages],
  );

  const selectExercise = useCallback(
    (exercise: Exercise) => {
      const parsed = parseExercise(exercise);
      startExercise(exercise, parsed);
    },
    [startExercise],
  );

  const createCustomSequent = useCallback(
    (goal: string, hypotheses: string[]) => {
      try {
        const customExercise: Exercise = {
          goal,
          hypotheses,
          difficulty: "medium",
          rules: [],
        };

        const parsed: ParsedExercise = {
          ...customExercise,
          goalFormula: FormulaParser.parse(goal),
          hypothesesFormulas: hypotheses.map((h) => FormulaParser.parse(h)),
        };

        startExercise(customExercise, parsed);
      } catch (e) {
        showMessage(`${t.invalidFormula}: ${(e as Error).message}`, "error");
      }
    },
    [startExercise, showMessage, t],
  );

  const resetProof = useCallback(() => {
    if (parsedExercise) {
      const tree = new ProofTree(
        parsedExercise.goalFormula,
        parsedExercise.hypothesesFormulas,
        proofMessages(),
      );
      setProofTree(tree);
      proofTreeRef.current = tree;
      setNotationRule(null);
      setIsNotationModalOpen(false);
      setNotationInput("");
      setModalState(null);
      setMessage(null);
    }
  }, [parsedExercise, proofMessages]);

  const backToExercises = useCallback(() => {
    setCurrentExercise(null);
    setParsedExercise(null);
    setProofTree(null);
    setIsRulesDrawerOpen(false);
    setIsFiltersDrawerOpen(window.matchMedia("(min-width: 768px)").matches);
    setNotationRule(null);
    setIsNotationModalOpen(false);
    setNotationInput("");
    setModalState(null);
    setMessage(null);
  }, []);

  const openNotationModal = useCallback(() => {
    setIsNotationModalOpen(true);
  }, []);

  const closeNotationModal = useCallback(() => {
    setIsNotationModalOpen(false);
  }, []);

  const applyNotation = useCallback(() => {
    try {
      const trimmedInput = notationInput.trim();

      if (!trimmedInput) {
        setNotationRule(null);
        setNotationInput("");
        setIsNotationModalOpen(false);
        return;
      }

      const formulas = trimmedInput
        .split(/[\n,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => FormulaParser.parse(value));

      if (formulas.length === 1) {
        setNotationRule({
          type: "formula",
          formula: formulas[0],
        });
        setIsNotationModalOpen(false);
        return;
      }

      setNotationRule({
        type: "set",
        formulas,
      });
      setIsNotationModalOpen(false);
    } catch (e) {
      showMessage(`${t.invalidFormula}: ${(e as Error).message}`, "error");
    }
  }, [notationInput, showMessage, t]);

  const goToNextExercise = useCallback(() => {
    if (exercises.length === 0) return;

    if (!currentExercise) {
      selectExercise(exercises[0]);
      return;
    }

    const currentIndex = exercises.indexOf(currentExercise);
    const nextIndex =
      currentIndex >= 0 ? (currentIndex + 1) % exercises.length : 0;
    selectExercise(exercises[nextIndex]);
  }, [currentExercise, selectExercise]);

  const undo = useCallback(() => {
    if (proofTree?.undo()) {
      forceUpdate();
      showMessage(t.undidLastAction, "info");
    } else {
      showMessage(t.nothingToUndo, "error");
    }
  }, [proofTree, showMessage, forceUpdate, t]);

  const handleNodeClick = useCallback(
    (node: ProofNode) => {
      if (!node.rule && !node.isComplete && proofTree) {
        proofTree.selectedNode = node;
        setIsRulesDrawerOpen(true);
        forceUpdate();
      }
    },
    [proofTree, forceUpdate],
  );

  const handleResult = useCallback(
    (result: ProofResult) => {
      if (result.success) {
        forceUpdate();
        setMessage(null);
        // Check completion
        if (proofTreeRef.current?.isComplete()) {
          showMessage(t.proofCompletedWithAxioms, "success");
        }
      } else {
        showMessage(result.error || t.unknownError, "error");
      }
    },
    [showMessage, forceUpdate, t],
  );

  const handleModalSubmit = useCallback(
    (formula: Formula) => {
      const tree = proofTreeRef.current;
      if (!tree) return;

      let result: ProofResult;
      switch (modalState?.action) {
        case "imp-elim":
          result = tree.applyImpElim(formula);
          break;
        case "and-elim-left":
          result = tree.applyAndElimLeft(formula);
          break;
        case "and-elim-right":
          result = tree.applyAndElimRight(formula);
          break;
        case "or-elim":
          result = tree.applyOrElim(formula);
          break;
        case "neg-elim":
          result = tree.applyNegElim(formula);
          break;
        default:
          return;
      }
      handleResult(result);
      setModalState(null);
      if (window.matchMedia("(max-width: 767px)").matches) {
        setIsRulesDrawerOpen(false);
      }
    },
    [modalState, handleResult],
  );

  const submitPanelRuleInput = useCallback(() => {
    if (!modalState) return;

    try {
      const variableNames = modalState.variableNames ?? [];
      let formulaText = "";

      if (variableNames.length > 0) {
        formulaText = modalState.formulaTemplate ?? "";
        for (const variableName of variableNames) {
          const variableValue = (panelModalValues[variableName] ?? "").trim();
          if (!variableValue) {
            showMessage(`${t.invalidFormula}: ${variableName}`, "error");
            return;
          }
          formulaText = formulaText
            .split(`{${variableName}}`)
            .join(`(${variableValue})`);
        }
      } else {
        formulaText = (panelModalValues.formula ?? "").trim();
        if (!formulaText) {
          showMessage(`${t.invalidFormula}`, "error");
          return;
        }
      }

      const formula = FormulaParser.parse(formulaText);
      handleModalSubmit(formula);
    } catch (e) {
      showMessage(`${t.invalidFormula}: ${(e as Error).message}`, "error");
    }
  }, [modalState, panelModalValues, handleModalSubmit, showMessage, t]);

  const handlePanelRuleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitPanelRuleInput();
      } else if (e.key === "Escape") {
        setModalState(null);
      }
    },
    [submitPanelRuleInput],
  );

  useEffect(() => {
    if (!modalState) {
      setPanelModalValues({});
      return;
    }

    const variableNames = modalState.variableNames ?? [];
    if (variableNames.length > 0) {
      const nextValues: Record<string, string> = {};
      variableNames.forEach((variableName) => {
        nextValues[variableName] = "";
      });
      setPanelModalValues(nextValues);
      return;
    }

    setPanelModalValues({ formula: "" });
  }, [modalState]);

  useEffect(() => {
    if (!modalState || !isRulesDrawerOpen) return;
    const timeoutId = window.setTimeout(() => {
      panelModalFirstInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [modalState, isRulesDrawerOpen]);

  const applyRule = useCallback(
    (ruleName: RuleName) => {
      setModalState(null);

      if (!proofTree || !proofTree.selectedNode) {
        showMessage(t.noGoalSelected, "error");
        return;
      }

      const node = proofTree.selectedNode;
      let result: ProofResult;

      switch (ruleName) {
        case "axiom": {
          const hypotheses = node.sequent.context;
          const matchingHypotheses = hypotheses.filter((h) =>
            h.equals(node.sequent.goal),
          );

          if (matchingHypotheses.length === 0) {
            showMessage(t.noHypothesisMatches, "error");
            return;
          }
          result = proofTree.applyAxiom(matchingHypotheses[0]);
          break;
        }

        case "te":
          result = proofTree.applyTe();
          break;

        case "imp-intro":
          result = proofTree.applyImpIntro();
          break;

        case "imp-elim":
          setModalState({
            formulaTemplate: `({X}) -> (${node.sequent.goal.toString()})`,
            variableNames: ["X"],
            action: "imp-elim",
          });
          return;

        case "and-intro":
          result = proofTree.applyAndIntro();
          break;

        case "and-elim-left":
          setModalState({
            formulaTemplate: `(${node.sequent.goal.toString()}) & ({Y})`,
            variableNames: ["Y"],
            action: "and-elim-left",
          });
          return;

        case "and-elim-right":
          setModalState({
            formulaTemplate: `({X}) & (${node.sequent.goal.toString()})`,
            variableNames: ["X"],
            action: "and-elim-right",
          });
          return;

        case "or-intro-left":
          result = proofTree.applyOrIntroLeft();
          break;

        case "or-intro-right":
          result = proofTree.applyOrIntroRight();
          break;

        case "or-elim":
          setModalState({
            formulaTemplate: "{X} | {Y}",
            variableNames: ["X", "Y"],
            action: "or-elim",
          });
          return;

        case "neg-intro":
          result = proofTree.applyNegIntro();
          break;

        case "neg-elim":
          if (node.sequent.goal.type !== "bot") {
            showMessage(t.goalMustBeFalsum, "error");
            return;
          }
          setModalState({
            formulaTemplate: "{X}",
            variableNames: ["X"],
            action: "neg-elim",
          });
          return;

        case "bot-elim":
          result = proofTree.applyBotElim();
          break;

        case "raa":
          result = proofTree.applyraa();
          break;

        default:
          showMessage(t.unknownRule, "error");
          return;
      }

      setModalState(null);
      handleResult(result);
    },
    [proofTree, showMessage, handleResult, t],
  );

  const handleRuleClick = useCallback(
    (ruleName: RuleName) => {
      applyRule(ruleName);
      const requiresInlineForm = isModalRuleName(ruleName);

      if (
        window.matchMedia("(max-width: 767px)").matches &&
        !requiresInlineForm
      ) {
        setIsRulesDrawerOpen(false);
      }
    },
    [applyRule],
  );

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const toggleLeftPanel = useCallback(() => {
    if (currentExercise) {
      setIsRulesDrawerOpen(true);
      return;
    }
    setIsFiltersDrawerOpen(true);
  }, [currentExercise]);

  useEffect(() => {
    if (!isRulesDrawerResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(620, Math.max(240, event.clientX));
      setDrawerWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsRulesDrawerResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isRulesDrawerResizing]);

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} min-h-screen ${isDarkMode ? "bg-slate-900 text-slate-100" : "bg-slate-100 text-slate-800"}`}
    >
      <header
        className={`${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-blue-900 text-white"} sticky top-0 z-30 py-3 px-3 sm:py-4 sm:px-4 md:pl-[var(--drawer-offset)]`}
        style={
          {
            ["--drawer-offset" as string]: `${desktopDrawerOffset}px`,
          } as React.CSSProperties
        }
      >
        <div className="max-w-[112rem] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <h1 className="text-xl font-bold leading-tight pr-2">
            <span className="md:hidden">Déduction Naturelle</span>
            <span className="hidden md:inline">{t.appTitle}</span>
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={backToExercises}
              aria-label={t.home}
              className={`${isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700" : "bg-white/15 hover:bg-white/25 text-white border-white/30"} inline-flex items-center justify-center w-11 h-11 rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l9-9 9 9M4.5 10.5V21h15v-10.5"
                />
              </svg>
            </button>
            <a
              href="https://github.com/fortierq/deduction-naturelle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.github}
              className={`${isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700" : "bg-white/15 hover:bg-white/25 text-white border-white/30"} inline-flex items-center justify-center w-11 h-11 rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.4 7.86 10.92.57.1.78-.25.78-.56 0-.28-.01-1.02-.01-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.7.08-.68.08-.68 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.56-.3-5.25-1.28-5.25-5.71 0-1.26.45-2.28 1.18-3.08-.12-.3-.51-1.52.11-3.17 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.65.23 2.87.11 3.17.74.8 1.18 1.82 1.18 3.08 0 4.44-2.7 5.41-5.27 5.7.41.36.77 1.06.77 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.2.67.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
                />
              </svg>
            </a>
            <button
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? t.lightMode : t.darkMode}
              className={`${isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600" : "bg-white/15 hover:bg-white/25 text-white border-white/30"} inline-flex items-center justify-center w-11 h-11 rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
            >
              {isDarkMode ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                      d="M21 12.79A9 9 0 0 1 11.21 3c0 .07-.01.14-.01.21A9 9 0 1 0 20.79 13c.07 0 .14-.01.21-.01Z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                      d="M12 3v2.25M12 18.75V21M3 12h2.25M18.75 12H21M5.64 5.64l1.59 1.59M16.77 16.77l1.59 1.59M5.64 18.36l1.59-1.59M16.77 7.23l1.59-1.59M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
              )}
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main
        className="max-w-[112rem] mx-auto p-3 sm:p-4 md:p-6 md:pl-[var(--drawer-offset)]"
        style={
          {
            ["--drawer-offset" as string]: `${desktopDrawerOffset}px`,
          } as React.CSSProperties
        }
      >
        {!currentExercise ? (
          <ExerciseList
            exercises={exercises}
            onSelect={selectExercise}
            onCreateCustomSequent={createCustomSequent}
            drawerWidth={drawerWidth}
            onDrawerWidthChange={setDrawerWidth}
            isDrawerOpen={isFiltersDrawerOpen}
            onDrawerOpenChange={setIsFiltersDrawerOpen}
          />
        ) : (
          <>
            {/* Proof Tree */}
            <div
              className={`${isDarkMode ? "bg-slate-800 border-2 border-slate-700" : "bg-white border-2 border-slate-200"} rounded-xl p-3 sm:p-4 md:p-4 mb-4 min-h-[300px] md:min-h-[400px] overflow-x-auto`}
            >
              <div className="w-max min-w-full flex justify-center p-1 sm:p-2 md:p-4">
                {proofTree && (
                  <ProofNodeDisplay
                    node={proofTree.root}
                    selectedNode={proofTree.selectedNode}
                    onNodeClick={handleNodeClick}
                    notationRule={notationRule}
                  />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:hidden">
                <button
                  className="px-4 py-2.5 text-sm sm:text-base bg-white dark:bg-slate-800 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
                  onClick={resetProof}
                >
                  {t.resetProof}
                </button>
                <button
                  className="px-4 py-2.5 text-sm sm:text-base bg-white dark:bg-slate-800 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
                  onClick={undo}
                >
                  {t.undo}
                </button>
                <button
                  className={`${notationRule ? "bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-500" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"} px-4 py-2.5 text-sm sm:text-base hover:text-blue-700 hover:bg-blue-50 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 dark:hover:border-slate-500 hover:border-blue-500`}
                  onClick={openNotationModal}
                >
                  {t.notation}
                </button>
                <button
                  className="px-4 py-2.5 text-sm sm:text-base bg-white dark:bg-slate-800 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
                  onClick={goToNextExercise}
                >
                  {t.nextExercise}
                </button>
              </div>

              <div className="hidden md:flex md:flex-wrap md:justify-center md:gap-4">
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
                    onClick={resetProof}
                  >
                    {t.resetProof}
                  </button>
                  <button
                    className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
                    onClick={undo}
                  >
                    {t.undo}
                  </button>
                  <button
                    className={`${notationRule ? "bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-500" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"} px-6 py-3 hover:text-blue-700 hover:bg-blue-50 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 hover:border-blue-500 dark:hover:border-slate-500`}
                    onClick={openNotationModal}
                  >
                    {t.notation}
                  </button>
                  <button
                    className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-slate-500"
                    onClick={goToNextExercise}
                  >
                    {t.nextExercise}
                  </button>
                </div>
              </div>
            </div>

            {notationRule && (
              <div className="mb-4 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm dark:border-blue-500/60 dark:bg-blue-900/20 dark:text-blue-100">
                  <span>{t.notationCurrent}:</span>
                  <span className="inline-flex items-center gap-1 align-middle rounded-full bg-white/80 px-2 py-1 dark:bg-slate-900/50">
                    <Latex
                      math={
                        notationRule.type === "formula"
                          ? String.raw`\varphi`
                          : String.raw`\Gamma`
                      }
                    />
                    <span>=</span>
                    <Latex
                      math={
                        notationRule.type === "formula"
                          ? notationRule.formula.toLatex()
                          : notationRule.formulas
                            .map((formula) => formula.toLatex())
                            .join(", ")
                      }
                    />
                  </span>
                </div>
              </div>
            )}

            {/* Message Area */}
            {message && (
              <div
                className={`mb-4 mx-auto inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 md:px-6 md:py-3 min-h-[42px] md:min-h-[50px] text-center font-semibold ${message.type === "success"
                  ? "bg-green-100 border-2 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-500 dark:text-green-200"
                  : message.type === "error"
                    ? "bg-red-100 border-2 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-500 dark:text-red-200"
                    : "bg-blue-100 border-2 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-200"
                  }`}
              >
                {message.text}
              </div>
            )}
          </>
        )}
      </main>

      {!isLeftPanelOpen && (
        <button
          onClick={toggleLeftPanel}
          aria-label={currentExercise ? t.inferenceRules : t.filters}
          className="fixed z-50 top-20 left-0 h-10 w-7 rounded-r-xl border-2 border-l-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 hover:bg-blue-50 dark:hover:text-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {currentExercise && (
        <>
          <div
            className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 md:hidden ${isRulesDrawerOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
              }`}
            onClick={() => setIsRulesDrawerOpen(false)}
          />

          <aside
            className={`fixed top-0 left-0 h-full flex flex-col bg-white dark:bg-slate-900 dark:border-r dark:border-slate-700 z-40 transform transition-transform duration-300 ease-out ${isRulesDrawerOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            style={{ width: mobileDrawerWidth, maxWidth: `${drawerWidth}px` }}
          >
            <div
              className={`px-3 pt-3 ${modalState ? "mb-2" : "mb-4"} grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2`}
            >
              <div className="w-9 h-9" aria-hidden="true" />
              <div className="justify-self-center w-full max-w-md">
                {modalState &&
                  (modalState.variableNames &&
                    modalState.variableNames.length > 0 ? (
                    <div
                      className={`${modalState.variableNames.length === 2 ? "grid grid-cols-2 gap-2" : "flex justify-center"}`}
                    >
                      {modalState.variableNames.map((variableName, index) => (
                        <div key={variableName}>
                          <div className="flex items-center gap-2">
                            <input
                              ref={
                                index === 0
                                  ? panelModalFirstInputRef
                                  : undefined
                              }
                              type="text"
                              className="modal-input text-center"
                              style={{ height: "2.125rem" }}
                              placeholder={variableName}
                              aria-label={variableName}
                              value={panelModalValues[variableName] ?? ""}
                              onChange={(e) => {
                                const nextValue = e.target.value;
                                setPanelModalValues((prev) => ({
                                  ...prev,
                                  [variableName]: nextValue,
                                }));
                              }}
                              onKeyDown={handlePanelRuleInputKeyDown}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="flex w-full max-w-md items-center gap-2">
                        <input
                          ref={panelModalFirstInputRef}
                          type="text"
                          className="modal-input text-center max-w-md"
                          style={{ height: "2.125rem" }}
                          value={panelModalValues.formula ?? ""}
                          onChange={(e) =>
                            setPanelModalValues({ formula: e.target.value })
                          }
                          onKeyDown={handlePanelRuleInputKeyDown}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => setIsRulesDrawerOpen(false)}
                className="justify-self-end p-2 text-slate-900 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label={t.cancel}
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

            {modalState && (
              <div className="mx-3 mb-2">
                <div className="flex gap-2 justify-center mt-0.5">
                  <SyntaxHelpBadge
                    text={t.customSequentSyntaxHelp}
                    tooltipPosition="bottom"
                  />
                  <button
                    className="modal-btn-cancel"
                    onClick={() => setModalState(null)}
                  >
                    {t.cancel}
                  </button>
                  <button
                    className="modal-btn-confirm"
                    onClick={submitPanelRuleInput}
                  >
                    {t.confirm}
                  </button>
                </div>
              </div>
            )}

            <RulePanel
              onRuleClick={handleRuleClick}
              className="mb-0 shadow-none w-full flex-1 overflow-y-auto px-3 pb-3"
              activeRule={modalState?.action}
            />

            <div
              className="absolute top-0 right-0 h-full w-2 cursor-col-resize hidden md:block"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsRulesDrawerResizing(true);
              }}
            />
          </aside>
        </>
      )}

      <Modal
        isOpen={isNotationModalOpen}
        onClose={closeNotationModal}
        title={t.notation}
      >
        <div className="space-y-4">
          <input
            type="text"
            className="modal-input"
            value={notationInput}
            onChange={(e) => setNotationInput(e.target.value)}
            placeholder={t.notationSetPlaceholder}
          />

          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <SyntaxHelpBadge
              text={t.customSequentSyntaxHelp}
              tooltipPosition="right"
            />
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={closeNotationModal}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="modal-btn-confirm"
                onClick={applyNotation}
              >
                {t.notationApply}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
