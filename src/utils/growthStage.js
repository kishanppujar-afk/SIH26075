/**
 * Determine the growth stage metadata based on readiness score (0-100).
 * Shared by GrowthTreeWidget and ProfileView so stage names stay in sync.
 */
export function getStageInfo(score) {
  if (score < 25) {
    return {
      key: 'seed',
      stageIndex: 0,
      name: 'Seed & Sprout',
      subVariant: 'sprout',
      badge: 'Sprout 🌱',
      narrative: "Every journey starts with a single seed. You're just getting started.",
      accentClass: 'text-sage-700 bg-sage-50 border-sage-200',
    };
  }
  if (score < 50) {
    return {
      key: 'sapling',
      stageIndex: 1,
      name: 'Young Sapling',
      subVariant: 'sapling',
      badge: 'Sapling 🌿',
      narrative: 'Your foundation is taking root.',
      accentClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }
  if (score < 75) {
    return {
      key: 'young-tree',
      stageIndex: 2,
      name: 'Young Tree',
      subVariant: 'young-tree',
      badge: 'Young Tree 🌳',
      narrative: 'Strong growth — your skills are branching out.',
      accentClass: 'text-teal-700 bg-teal-50 border-teal-200',
    };
  }

  let subVariant = 'bloom-early';
  let badge = 'Early Bloom 🌸';
  let narrative = 'Your expertise is beginning to blossom.';
  let name = 'Blossoming Tree';

  if (score >= 95) {
    subVariant = 'bloom-peak';
    badge = 'Peak Bloom 🌺';
    narrative = 'Your expertise is in full, radiant bloom.';
    name = 'Blossoming Tree — Peak';
  } else if (score >= 85) {
    subVariant = 'bloom-vibrant';
    badge = 'Vibrant Bloom 🌸';
    narrative = 'Your skills are in flourishing bloom.';
    name = 'Blossoming Tree — Full';
  }

  return {
    key: `blossom-${subVariant}`,
    stageIndex: 3,
    name,
    subVariant,
    badge,
    narrative,
    accentClass: 'text-rose-700 bg-rose-50 border-rose-200',
  };
}
