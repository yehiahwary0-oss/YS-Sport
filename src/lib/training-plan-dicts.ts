/**
 * Maps the canonical plan_structure strings (day/type/intensity) to
 * next-intl message keys so every label can be localized (ar/en).
 * Unknown values fall back to the raw string.
 */

export const SESSION_TYPE_KEYS: Record<string, string> = {
  'Technical Skills': 'trainingPlans.sessionTypes.technicalSkills',
  'Fitness/Conditioning': 'trainingPlans.sessionTypes.fitnessConditioning',
  'Small-Sided Games': 'trainingPlans.sessionTypes.smallSidedGames',
  'Strength & Core': 'trainingPlans.sessionTypes.strengthCore',
  'Strength & Power': 'trainingPlans.sessionTypes.strengthPower',
  'Tactical Awareness': 'trainingPlans.sessionTypes.tacticalAwareness',
  'Tactical Briefing': 'trainingPlans.sessionTypes.tacticalBriefing',
  'Practice Match': 'trainingPlans.sessionTypes.practiceMatch',
  'Full Practice Match': 'trainingPlans.sessionTypes.fullPracticeMatch',
  'Full Match': 'trainingPlans.sessionTypes.fullMatch',
  'Match Day': 'trainingPlans.sessionTypes.matchDay',
  'Recovery/Stretching': 'trainingPlans.sessionTypes.recoveryStretching',
  'Ball Handling': 'trainingPlans.sessionTypes.ballHandling',
  'Shooting Practice': 'trainingPlans.sessionTypes.shootingPractice',
  'Footwork Drills': 'trainingPlans.sessionTypes.footworkDrills',
  'Agility Drills': 'trainingPlans.sessionTypes.agilityDrills',
  'Team Drills': 'trainingPlans.sessionTypes.teamDrills',
  'Defense Drills': 'trainingPlans.sessionTypes.defenseDrills',
  Scrimmage: 'trainingPlans.sessionTypes.scrimmage',
  'Full Scrimmage': 'trainingPlans.sessionTypes.fullScrimmage',
  'Full Game': 'trainingPlans.sessionTypes.fullGame',
  'Game Day': 'trainingPlans.sessionTypes.gameDay',
  'Light Shooting': 'trainingPlans.sessionTypes.lightShooting',
  Walkthrough: 'trainingPlans.sessionTypes.walkthrough',
  'Technique Drills': 'trainingPlans.sessionTypes.techniqueDrills',
  'Freestyle Drills': 'trainingPlans.sessionTypes.freestyleDrills',
  'Stroke Drills': 'trainingPlans.sessionTypes.strokeDrills',
  'Breathing Drills': 'trainingPlans.sessionTypes.breathingDrills',
  'Swim Basics': 'trainingPlans.sessionTypes.swimBasics',
  'Endurance Swim': 'trainingPlans.sessionTypes.enduranceSwim',
  'Fitness Swim': 'trainingPlans.sessionTypes.fitnessSwim',
  'Distance Swim': 'trainingPlans.sessionTypes.distanceSwim',
  'Swim Intervals': 'trainingPlans.sessionTypes.swimIntervals',
  'Sprint Intervals': 'trainingPlans.sessionTypes.sprintIntervals',
  'Starts & Turns': 'trainingPlans.sessionTypes.startsTurns',
  'Race Pacing': 'trainingPlans.sessionTypes.racePacing',
  'Race Pace': 'trainingPlans.sessionTypes.racePace',
  'Light Technique': 'trainingPlans.sessionTypes.lightTechnique',
  'Water Aerobics': 'trainingPlans.sessionTypes.waterAerobics',
  Competition: 'trainingPlans.sessionTypes.competition',
  'Full Body Workout': 'trainingPlans.sessionTypes.fullBodyWorkout',
  'Cardio Base': 'trainingPlans.sessionTypes.cardioBase',
  'Cardio Intervals': 'trainingPlans.sessionTypes.cardioIntervals',
  'Strength Fundamentals': 'trainingPlans.sessionTypes.strengthFundamentals',
  'Strength Circuit': 'trainingPlans.sessionTypes.strengthCircuit',
  'Upper Body Strength': 'trainingPlans.sessionTypes.upperBodyStrength',
  'Lower Body Strength': 'trainingPlans.sessionTypes.lowerBodyStrength',
  'Core & Stabilizers': 'trainingPlans.sessionTypes.coreStabilizers',
  'Sport-Specific Drills': 'trainingPlans.sessionTypes.sportSpecificDrills',
  'Skills Practice': 'trainingPlans.sessionTypes.skillsPractice',
  'Simulated Competition': 'trainingPlans.sessionTypes.simulatedCompetition',
  Conditioning: 'trainingPlans.sessionTypes.conditioning',
  'General Workout': 'trainingPlans.sessionTypes.generalWorkout',
  'Strength Basics': 'trainingPlans.sessionTypes.strengthBasics',
  'Active Recovery': 'trainingPlans.sessionTypes.activeRecovery',
}

export const INTENSITY_KEYS: Record<string, string> = {
  Low: 'trainingPlans.intensity.low',
  Moderate: 'trainingPlans.intensity.moderate',
  High: 'trainingPlans.intensity.high',
  'Very High': 'trainingPlans.intensity.veryHigh',
}

export const DAY_KEYS: Record<string, string> = {
  Monday: 'trainingPlans.days.monday',
  Tuesday: 'trainingPlans.days.tuesday',
  Wednesday: 'trainingPlans.days.wednesday',
  Thursday: 'trainingPlans.days.thursday',
  Friday: 'trainingPlans.days.friday',
  Saturday: 'trainingPlans.days.saturday',
  Sunday: 'trainingPlans.days.sunday',
}

export const LEVEL_KEYS: Record<string, string> = {
  beginner: 'trainingPlans.levels.beginner',
  intermediate: 'trainingPlans.levels.intermediate',
  advanced: 'trainingPlans.levels.advanced',
}

export const GOAL_KEYS: Record<string, string> = {
  fitness: 'trainingPlans.goals.fitness',
  competition: 'trainingPlans.goals.competition',
  weight_loss: 'trainingPlans.goals.weightLoss',
  muscle_gain: 'trainingPlans.goals.muscleGain',
  general: 'trainingPlans.goals.general',
}
