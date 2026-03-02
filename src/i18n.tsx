// Internationalization support

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface Translations {
  rulesUsed: string;
  // Header
  appTitle: string;
  appSubtitle: string;
  home: string;
  github: string;
  darkMode: string;
  lightMode: string;
  
  // Exercise list
  filters: string;
  difficulty: string;
  clearAllFilters: string;
  showingExercises: (count: number, total: number) => string;
  noExercisesMatch: string;
  clearFilters: string;
  customSequent: string;
  customSequentModalTitle: string;
  customSequentModalDescription: string;
  customSequentSyntaxHelp: string;
  customHypothesesPlaceholder: string;
  customGoalPlaceholder: string;
  startProof: string;
  customSequentTitle: string;
  customSequentDescription: string;
  randomExercise: string;
  
  // Difficulty levels
  easy: string;
  medium: string;
  hard: string;
  
  // Exercise view
  goal: string;
  hypotheses: string;
  none: string;
  resetProof: string;
  backToExercises: string;
  undo: string;
  nextExercise: string;
  
  // Rule panel
  inferenceRules: string;
  showRuleTrees: string;
  introductionRules: string;
  eliminationRules: string;
  otherRules: string;
  
  // Rule names
  implIntro: string;
  implElim: string;
  andIntro: string;
  andElimLeft: string;
  andElimRight: string;
  orIntroLeft: string;
  orIntroRight: string;
  orElim: string;
  negIntro: string;
  negElim: string;
  absurd: string;
  raa: string;
  axiom: string;
  
  // Messages
  noGoalSelected: string;
  noHypothesisMatches: (goal: string) => string;
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
  
  // Completion modal
  proofComplete: string;
  congratulations: string;
  chooseAnotherExercise: string;
  viewProof: string;
  
  // Formula input modal
  confirm: string;
  cancel: string;
  enterFormula: string;
  invalidFormula: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    // Header
    appTitle: 'Exercices de Déduction Naturelle',
    appSubtitle: 'Apprenez la logique propositionnelle par la construction interactive de preuves',
    home: 'Accueil',
    github: 'GitHub',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',

    // Exercise list
    filters: 'Filtres',
    difficulty: 'Difficulté',
    clearAllFilters: 'Effacer tous les filtres',
    showingExercises: (count, total) => `${count} / ${total} exercices`,
    noExercisesMatch: 'Aucun exercice ne correspond à vos filtres.',
    clearFilters: 'Effacer les filtres',
    customSequent: 'Séquent personnalisé',
    customSequentModalTitle: 'Créer un séquent personnalisé',
    customSequentModalDescription: 'Entrez les hypothèses séparées par des virgules, puis le but à prouver.',
    customSequentSyntaxHelp: 'Symboles : !, &, |, ->, 0, 1, ( )',
    customHypothesesPlaceholder: 'Ex: A -> B, A',
    customGoalPlaceholder: 'Ex: B',
    startProof: 'Commencer la preuve',
    customSequentTitle: 'Séquent personnalisé',
    customSequentDescription: 'Séquent défini par l\'utilisateur',
    randomExercise: 'Exercices aléatoires',

    // Difficulty levels
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',

    // Exercise view
    goal: 'But',
    hypotheses: 'Hypothèses',
    none: 'Aucune',
    resetProof: 'Réinitialiser',
    backToExercises: 'Retour aux exercices',
    undo: 'Annuler',
    nextExercise: 'Exercice suivant',

    // Rule panel
    inferenceRules: 'Règles d\'inférence',
    showRuleTrees: 'Afficher les règles',
    introductionRules: 'Introduction',
    eliminationRules: 'Élimination',
    otherRules: 'Autres règles',

    // Rule names
    implIntro: '→ Introduction',
    implElim: '→ Élimination',
    andIntro: '∧ Introduction',
    andElimLeft: '∧ Élimination Gauche',
    andElimRight: '∧ Élimination Droite',
    orIntroLeft: '∨ Introduction Gauche',
    orIntroRight: '∨ Introduction Droite',
    orElim: '∨ Élimination',
    negIntro: '¬ Introduction',
    negElim: '¬ Élimination',
    absurd: 'Ex Falso',
    raa: 'raa (Raisonnement par l\'absurde)',
    axiom: 'Axiome',

    // Messages
    noGoalSelected: 'Aucun but sélectionné',
    noHypothesisMatches: (goal) => `Aucune hypothèse ne correspond au but : ${goal}`,
    goalMustBeFalsum: 'Le but doit être ⊥ (faux) pour utiliser l\'élimination de la négation',
    unknownRule: 'Règle inconnue',
    undidLastAction: 'Dernière action annulée',
    nothingToUndo: 'Rien à annuler',
    unknownError: 'Erreur inconnue',
    proofCompletedWithAxioms: 'Preuve terminée.',
    proofHypothesisNotInContext: 'Hypothèse non disponible dans le contexte courant',
    proofHypothesisGoalMismatch: 'L\'hypothèse ne correspond pas au but',
    proofGoalNotImplication: 'Le but n\'est pas une implication',
    proofSelectedNotImplication: 'La formule sélectionnée n\'est pas une implication',
    proofImplicationConclusionMismatch: 'La conclusion de l\'implication ne correspond pas au but',
    proofGoalNotConjunction: 'Le but n\'est pas une conjonction',
    proofSelectedNotConjunction: 'La formule sélectionnée n\'est pas une conjonction',
    proofConjunctionLeftMismatch: 'Le côté gauche de la conjonction ne correspond pas au but',
    proofConjunctionRightMismatch: 'Le côté droit de la conjonction ne correspond pas au but',
    proofGoalNotDisjunction: 'Le but n\'est pas une disjonction',
    proofSelectedNotDisjunction: 'La formule sélectionnée n\'est pas une disjonction',
    proofGoalNotNegation: 'Le but n\'est pas une négation',

    // Completion modal
    proofComplete: 'Preuve terminée !',
    congratulations: 'Félicitations ! Vous avez prouvé :',
    chooseAnotherExercise: 'Choisir un autre exercice',
    viewProof: 'Voir la preuve',

    // Formula input modal
    confirm: 'Confirmer',
    cancel: 'Annuler',
    enterFormula: 'Entrez une formule',
    invalidFormula: 'Formule invalide',
    rulesUsed: 'Règles'
  },
  en: {
    // Header
    appTitle: 'Natural Deduction Exercises',
    appSubtitle: 'Learn propositional logic through interactive proof construction',
    home: 'Home',
    github: 'GitHub',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',

    // Exercise list
    filters: 'Filters',
    difficulty: 'Difficulty',
    clearAllFilters: 'Clear all filters',
    showingExercises: (count, total) => `${count} / ${total} exercises`,
    noExercisesMatch: 'No exercises match your filters.',
    clearFilters: 'Clear filters',
    customSequent: 'Custom Sequent',
    customSequentModalTitle: 'Create Custom Sequent',
    customSequentModalDescription: 'Enter hypotheses separated by commas, then the goal to prove.',
    customSequentSyntaxHelp: 'Symbols : !, &, |, ->, 0, 1, ( )',
    customHypothesesPlaceholder: 'e.g. A -> B, A',
    customGoalPlaceholder: 'e.g. B',
    startProof: 'Start Proof',
    customSequentTitle: 'Custom Sequent',
    customSequentDescription: 'User-defined sequent',
    randomExercise: 'Random Exercises',

    // Difficulty levels
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',

    // Exercise view
    goal: 'Goal',
    hypotheses: 'Hypotheses',
    none: 'None',
    resetProof: 'Reset Proof',
    backToExercises: 'Back to Exercises',
    undo: 'Undo',
    nextExercise: 'Next Exercise',

    // Rule panel
    inferenceRules: 'Inference Rules',
    showRuleTrees: 'Show rule trees',
    introductionRules: 'Introduction',
    eliminationRules: 'Elimination',
    otherRules: 'Other Rules',

    // Rule names
    implIntro: '→ Introduction',
    implElim: '→ Elimination',
    andIntro: '∧ Introduction',
    andElimLeft: '∧ Elimination Left',
    andElimRight: '∧ Elimination Right',
    orIntroLeft: '∨ Introduction Left',
    orIntroRight: '∨ Introduction Right',
    orElim: '∨ Elimination',
    negIntro: '¬ Introduction',
    negElim: '¬ Elimination',
    absurd: 'Ex Falso',
    raa: 'raa (Reductio ad Absurdum)',
    axiom: 'Axiom',

    // Messages
    noGoalSelected: 'No goal selected',
    noHypothesisMatches: (goal) => `No hypothesis matches the goal: ${goal}`,
    goalMustBeFalsum: 'Goal must be ⊥ (falsum) to use negation elimination',
    unknownRule: 'Unknown rule',
    undidLastAction: 'Undid last action',
    nothingToUndo: 'Nothing to undo',
    unknownError: 'Unknown error',
    proofCompletedWithAxioms: 'Proof tree completed.',
    proofHypothesisNotInContext: 'Hypothesis not available in current context',
    proofHypothesisGoalMismatch: 'Hypothesis does not match the goal',
    proofGoalNotImplication: 'Goal is not an implication',
    proofSelectedNotImplication: 'Selected formula is not an implication',
    proofImplicationConclusionMismatch: 'Conclusion of implication does not match the goal',
    proofGoalNotConjunction: 'Goal is not a conjunction',
    proofSelectedNotConjunction: 'Selected formula is not a conjunction',
    proofConjunctionLeftMismatch: 'Left side of conjunction does not match the goal',
    proofConjunctionRightMismatch: 'Right side of conjunction does not match the goal',
    proofGoalNotDisjunction: 'Goal is not a disjunction',
    proofSelectedNotDisjunction: 'Selected formula is not a disjunction',
    proofGoalNotNegation: 'Goal is not a negation',

    // Completion modal
    proofComplete: 'Proof Complete!',
    congratulations: 'Congratulations! You successfully proved:',
    chooseAnotherExercise: 'Choose Another Exercise',
    viewProof: 'View Proof',

    // Formula input modal
    confirm: 'Confirm',
    cancel: 'Cancel',
    enterFormula: 'Enter a formula',
    invalidFormula: 'Invalid formula',
    rulesUsed: 'Rules'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');
  
  const value = {
    language,
    setLanguage,
    t: translations[language]
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language selector component
export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const nextLanguage: Language = language === 'fr' ? 'en' : 'fr';
  
  return (
    <div className="flex items-center">
      <button
        onClick={() => setLanguage(nextLanguage)}
        title={language === 'fr' ? 'Français' : 'English'}
        aria-label={language === 'fr' ? 'Français' : 'English'}
        className="w-11 h-11 p-0 rounded-xl border-2 bg-white/15 text-white border-white/30 hover:bg-white/25 hover:border-white/40 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:hover:border-slate-600 transition-colors flex items-center justify-center"
      >
        {language === 'fr' ? (
        <svg className="w-7 h-5 rounded-sm shadow-sm" viewBox="0 0 24 16" aria-hidden="true">
          <rect width="8" height="16" x="0" y="0" fill="#1f4aa8" />
          <rect width="8" height="16" x="8" y="0" fill="#ffffff" />
          <rect width="8" height="16" x="16" y="0" fill="#d3202a" />
        </svg>
        ) : (
        <svg className="w-7 h-5 rounded-sm shadow-sm" viewBox="0 0 24 16" aria-hidden="true">
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
