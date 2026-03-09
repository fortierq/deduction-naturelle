// Internationalization support

import {
  createContext,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react";

export type Language = "fr" | "en";

interface Translations {
  syntaxHelp: ReactNode;
  rulesUsed: string;
  // Header
  appTitle: string;
  home: string;
  github: string;
  darkMode: string;
  lightMode: string;

  // Exercise list
  filters: string;
  difficulty: string;
  showingExercises: (count: number, total: number) => string;
  noExercisesMatch: string;
  clearFilters: string;
  customSequent: string;
  customSequentModalTitle: string;
  customSequentSyntaxHelp: string;
  startProof: string;
  randomExercise: string;

  // Difficulty levels
  easy: string;
  medium: string;
  hard: string;

  // Exercise view
  goal: string;
  hypotheses: string;
  notation: string;
  notationSetPlaceholder: string;
  notationCurrent: string;
  notationApply: string;
  resetProof: string;
  undo: string;
  nextExercise: string;

  // Rule panel
  inferenceRules: string;
  introductionRules: string;
  eliminationRules: string;

  // Messages
  noGoalSelected: string;
  noHypothesisMatches: string;
  goalMustBeFalsum: string;
  unknownRule: string;
  undidLastAction: string;
  nothingToUndo: string;
  unknownError: string;
  proofCompletedWithAxioms: string;
  proofHypothesisNotInContext: string;
  proofHypothesisGoalMismatch: string;
  proofGoalNotImplication: string;
  proofSelectedNotImplication: string;
  proofImplicationConclusionMismatch: string;
  proofGoalNotConjunction: string;
  proofSelectedNotConjunction: string;
  proofConjunctionLeftMismatch: string;
  proofConjunctionRightMismatch: string;
  proofGoalNotDisjunction: string;
  proofSelectedNotDisjunction: string;
  proofGoalNotNegation: string;
  proofGoalNotExcludedMiddle: string;

  // Formula input modal
  confirm: string;
  cancel: string;
  invalidFormula: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    // Header
    appTitle: "Exercices de Déduction Naturelle",
    home: "Accueil",
    github: "GitHub",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",

    // Exercise list
    filters: "Filtres",
    difficulty: "Difficulté",
    showingExercises: (count, total) => `${count} / ${total} exercices`,
    noExercisesMatch: "Aucun exercice ne correspond à vos filtres.",
    clearFilters: "Effacer les filtres",
    customSequent: "Séquent personnalisé",
    customSequentModalTitle: "Créer un séquent personnalisé",
    customSequentSyntaxHelp: "Symboles : !, &, |, ->, 0, 1, ( )",
    startProof: "Commencer la preuve",
    randomExercise: "Exercices aléatoires",

    // Difficulty levels
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",

    // Exercise view
    goal: "But",
    hypotheses: "Hypothèses",
    notation: "Notation",
    notationSetPlaceholder: "Formules séparées par des virgules",
    notationCurrent: "Notation active ",
    notationApply: "Appliquer",
    resetProof: "Réinitialiser",
    undo: "Annuler",
    nextExercise: "Suivant",

    // Rule panel
    inferenceRules: "Règles d'inférence",
    introductionRules: "Introduction",
    eliminationRules: "Élimination",

    // Messages
    noGoalSelected: "Aucun but sélectionné",
    noHypothesisMatches: `Aucune hypothèse ne correspond au but`,
    goalMustBeFalsum: "Le but n' est pas faux",
    unknownRule: "Règle inconnue",
    undidLastAction: "Dernière action annulée",
    nothingToUndo: "Rien à annuler",
    unknownError: "Erreur inconnue",
    proofCompletedWithAxioms: "Preuve terminée.",
    proofHypothesisNotInContext:
      "Hypothèse non disponible dans le contexte courant",
    proofHypothesisGoalMismatch: "L'hypothèse ne correspond pas au but",
    proofGoalNotImplication: "Le but n'est pas une implication",
    proofSelectedNotImplication:
      "La formule sélectionnée n'est pas une implication",
    proofImplicationConclusionMismatch:
      "La conclusion de l'implication ne correspond pas au but",
    proofGoalNotConjunction: "Le but n'est pas une conjonction",
    proofSelectedNotConjunction:
      "La formule sélectionnée n'est pas une conjonction",
    proofConjunctionLeftMismatch:
      "Le côté gauche de la conjonction ne correspond pas au but",
    proofConjunctionRightMismatch:
      "Le côté droit de la conjonction ne correspond pas au but",
    proofGoalNotDisjunction: "Le but n'est pas une disjonction",
    proofSelectedNotDisjunction:
      "La formule sélectionnée n'est pas une disjonction",
    proofGoalNotNegation: "Le but n'est pas une négation",
    proofGoalNotExcludedMiddle:
      "Le but doit être de la forme A | !A ou !A | A",

    // Formula input modal
    confirm: "Confirmer",
    cancel: "Annuler",
    invalidFormula: "Formule invalide",
    rulesUsed: "Règles",
    syntaxHelp: "Aide",
  },
  en: {
    // Header
    appTitle: "Natural Deduction Exercises",
    home: "Home",
    github: "GitHub",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",

    // Exercise list
    filters: "Filters",
    difficulty: "Difficulty",
    showingExercises: (count, total) => `${count} / ${total} exercises`,
    noExercisesMatch: "No exercises match your filters.",
    clearFilters: "Clear filters",
    customSequent: "Custom Sequent",
    customSequentModalTitle: "Create Custom Sequent",
    customSequentSyntaxHelp: "Symbols : !, &, |, ->, 0, 1, ( )",
    startProof: "Start Proof",
    randomExercise: "Random Exercises",

    // Difficulty levels
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",

    // Exercise view
    goal: "Goal",
    hypotheses: "Hypotheses",
    notation: "Notation",
    notationSetPlaceholder: "Formulas separated by commas",
    notationCurrent: "Current notation",
    notationApply: "Apply",
    resetProof: "Reset",
    undo: "Undo",
    nextExercise: "Next",

    // Rule panel
    inferenceRules: "Inference Rules",
    introductionRules: "Introduction",
    eliminationRules: "Elimination",

    // Messages
    noGoalSelected: "No goal selected",
    noHypothesisMatches: `No hypothesis matches the goal`,
    goalMustBeFalsum: "Goal is not false",
    unknownRule: "Unknown rule",
    undidLastAction: "Undid last action",
    nothingToUndo: "Nothing to undo",
    unknownError: "Unknown error",
    proofCompletedWithAxioms: "Proof tree completed.",
    proofHypothesisNotInContext: "Hypothesis not available in current context",
    proofHypothesisGoalMismatch: "Hypothesis does not match the goal",
    proofGoalNotImplication: "Goal is not an implication",
    proofSelectedNotImplication: "Selected formula is not an implication",
    proofImplicationConclusionMismatch:
      "Conclusion of implication does not match the goal",
    proofGoalNotConjunction: "Goal is not a conjunction",
    proofSelectedNotConjunction: "Selected formula is not a conjunction",
    proofConjunctionLeftMismatch:
      "Left side of conjunction does not match the goal",
    proofConjunctionRightMismatch:
      "Right side of conjunction does not match the goal",
    proofGoalNotDisjunction: "Goal is not a disjunction",
    proofSelectedNotDisjunction: "Selected formula is not a disjunction",
    proofGoalNotNegation: "Goal is not a negation",
    proofGoalNotExcludedMiddle:
      "Goal must be of the form A | !A or !A | A",

    // Formula input modal
    confirm: "Confirm",
    cancel: "Cancel",
    invalidFormula: "Invalid formula",
    rulesUsed: "Rules",
    syntaxHelp: "Help",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("fr");

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Language selector component
export const LanguageSelector: FC = () => {
  const { language, setLanguage } = useLanguage();
  const nextLanguage: Language = language === "fr" ? "en" : "fr";

  return (
    <div className="flex items-center">
      <button
        onClick={() => setLanguage(nextLanguage)}
        aria-label={language === "fr" ? "Français" : "English"}
        className="w-11 h-11 p-0 rounded-xl border-2 bg-white/15 text-white border-white/30 hover:bg-white/25 hover:border-white/40 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:hover:border-slate-600 transition-colors flex items-center justify-center"
      >
        {language === "fr" ? (
          <svg
            className="w-7 h-5 rounded-sm shadow-sm"
            viewBox="0 0 24 16"
            aria-hidden="true"
          >
            <rect width="8" height="16" x="0" y="0" fill="#1f4aa8" />
            <rect width="8" height="16" x="8" y="0" fill="#ffffff" />
            <rect width="8" height="16" x="16" y="0" fill="#d3202a" />
          </svg>
        ) : (
          <svg
            className="w-7 h-5 rounded-sm shadow-sm"
            viewBox="0 0 24 16"
            aria-hidden="true"
          >
            <rect width="24" height="16" fill="#1f4aa8" />
            <rect x="10" y="0" width="4" height="16" fill="#ffffff" />
            <rect x="0" y="6" width="24" height="4" fill="#ffffff" />
            <rect x="11" y="0" width="2" height="16" fill="#d3202a" />
            <rect x="0" y="7" width="24" height="2" fill="#d3202a" />
          </svg>
        )}
      </button>
    </div>
  );
};
