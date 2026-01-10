// Internationalization support

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  
  // Exercise list
  selectExercise: string;
  filters: string;
  difficulty: string;
  rulesUsed: string;
  clearAllFilters: string;
  showingExercises: (count: number, total: number) => string;
  noExercisesMatch: string;
  clearFilters: string;
  
  // Difficulty levels
  easy: string;
  medium: string;
  hard: string;
  
  // Exercise view
  goal: string;
  hypotheses: string;
  none: string;
  proofTree: string;
  resetProof: string;
  backToExercises: string;
  undo: string;
  
  // Rule panel
  inferenceRules: string;
  hoverToSeeTree: string;
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
  
  // Modal titles
  implElimTitle: string;
  andElimLeftTitle: string;
  andElimRightTitle: string;
  orElimTitle: string;
  negElimTitle: string;
  
  // Modal descriptions
  implElimDesc: (goal: string) => string;
  andElimLeftDesc: (goal: string) => string;
  andElimRightDesc: (goal: string) => string;
  orElimDesc: string;
  negElimDesc: string;
  
  // Messages
  noGoalSelected: string;
  noHypothesisMatches: (goal: string) => string;
  goalMustBeFalsum: string;
  unknownRule: string;
  undidLastAction: string;
  nothingToUndo: string;
  unknownError: string;
  
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
    appTitle: '🌳 Déduction Naturelle - Arbres de Preuve',
    appSubtitle: 'Apprenez la logique propositionnelle par la construction interactive de preuves',
    
    // Exercise list
    selectExercise: 'Choisir un exercice',
    filters: 'Filtres',
    difficulty: 'Difficulté',
    rulesUsed: 'Règles utilisées',
    clearAllFilters: 'Effacer tous les filtres',
    showingExercises: (count, total) => `Affichage de ${count} sur ${total} exercices`,
    noExercisesMatch: 'Aucun exercice ne correspond à vos filtres.',
    clearFilters: 'Effacer les filtres',
    
    // Difficulty levels
    easy: '🌱 Facile',
    medium: '🌿 Moyen',
    hard: '🌳 Difficile',
    
    // Exercise view
    goal: 'But',
    hypotheses: 'Hypothèses',
    none: 'Aucune',
    proofTree: 'Arbre de preuve',
    resetProof: '🔄 Réinitialiser',
    backToExercises: '⬅️ Retour aux exercices',
    undo: '↩️ Annuler',
    
    // Rule panel
    inferenceRules: 'Règles d\'inférence',
    hoverToSeeTree: 'Survolez une règle pour voir sa forme arborescente',
    introductionRules: 'Règles d\'introduction',
    eliminationRules: 'Règles d\'élimination',
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
    raa: 'RAA (Raisonnement par l\'absurde)',
    axiom: 'Axiome',
    
    // Modal titles
    implElimTitle: '→ Élimination (Modus Ponens)',
    andElimLeftTitle: '∧ Élimination Gauche',
    andElimRightTitle: '∧ Élimination Droite',
    orElimTitle: '∨ Élimination',
    negElimTitle: '¬ Élimination',
    
    // Modal descriptions
    implElimDesc: (goal) => `Entrez l'implication A → ${goal} :`,
    andElimLeftDesc: (goal) => `Entrez la conjonction ${goal} ∧ B :`,
    andElimRightDesc: (goal) => `Entrez la conjonction A ∧ ${goal} :`,
    orElimDesc: 'Entrez la disjonction A ∨ B pour faire une analyse de cas :',
    negElimDesc: 'Entrez la formule A (vous devrez prouver A et ¬A) :',
    
    // Messages
    noGoalSelected: 'Aucun but sélectionné',
    noHypothesisMatches: (goal) => `Aucune hypothèse ne correspond au but : ${goal}`,
    goalMustBeFalsum: 'Le but doit être ⊥ (faux) pour utiliser l\'élimination de la négation',
    unknownRule: 'Règle inconnue',
    undidLastAction: 'Dernière action annulée',
    nothingToUndo: 'Rien à annuler',
    unknownError: 'Erreur inconnue',
    
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
  },
  en: {
    // Header
    appTitle: '🌳 Natural Deduction Proof Tree Builder',
    appSubtitle: 'Learn propositional logic through interactive proof construction',
    
    // Exercise list
    selectExercise: 'Select an Exercise',
    filters: 'Filters',
    difficulty: 'Difficulty',
    rulesUsed: 'Rules Used',
    clearAllFilters: 'Clear all filters',
    showingExercises: (count, total) => `Showing ${count} of ${total} exercises`,
    noExercisesMatch: 'No exercises match your filters.',
    clearFilters: 'Clear filters',
    
    // Difficulty levels
    easy: '🌱 Easy',
    medium: '🌿 Medium',
    hard: '🌳 Hard',
    
    // Exercise view
    goal: 'Goal',
    hypotheses: 'Hypotheses',
    none: 'None',
    proofTree: 'Proof Tree',
    resetProof: '🔄 Reset Proof',
    backToExercises: '⬅️ Back to Exercises',
    undo: '↩️ Undo',
    
    // Rule panel
    inferenceRules: 'Inference Rules',
    hoverToSeeTree: 'Hover over a rule to see its tree form',
    introductionRules: 'Introduction Rules',
    eliminationRules: 'Elimination Rules',
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
    raa: 'RAA (Reductio ad Absurdum)',
    axiom: 'Axiom',
    
    // Modal titles
    implElimTitle: '→ Elimination (Modus Ponens)',
    andElimLeftTitle: '∧ Elimination Left',
    andElimRightTitle: '∧ Elimination Right',
    orElimTitle: '∨ Elimination',
    negElimTitle: '¬ Elimination',
    
    // Modal descriptions
    implElimDesc: (goal) => `Enter the implication A → ${goal}:`,
    andElimLeftDesc: (goal) => `Enter the conjunction ${goal} ∧ B:`,
    andElimRightDesc: (goal) => `Enter the conjunction A ∧ ${goal}:`,
    orElimDesc: 'Enter the disjunction A ∨ B to do case analysis on:',
    negElimDesc: 'Enter the formula A (you will need to prove both A and ¬A):',
    
    // Messages
    noGoalSelected: 'No goal selected',
    noHypothesisMatches: (goal) => `No hypothesis matches the goal: ${goal}`,
    goalMustBeFalsum: 'Goal must be ⊥ (falsum) to use negation elimination',
    unknownRule: 'Unknown rule',
    undidLastAction: 'Undid last action',
    nothingToUndo: 'Nothing to undo',
    unknownError: 'Unknown error',
    
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
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          language === 'fr' 
            ? 'bg-white text-blue-600' 
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          language === 'en' 
            ? 'bg-white text-blue-600' 
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        EN
      </button>
    </div>
  );
};
