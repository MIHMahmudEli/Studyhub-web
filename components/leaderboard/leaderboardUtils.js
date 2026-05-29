const LEVELS = [
  { level: 1, name: 'Bronze', threshold: 0, color: 'from-orange-400 to-orange-600', textColor: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', barColor: 'bg-orange-500' },
  { level: 2, name: 'Silver', threshold: 50, color: 'from-slate-300 to-slate-500', textColor: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/20', barColor: 'bg-slate-400' },
  { level: 3, name: 'Gold', threshold: 150, color: 'from-amber-400 to-amber-600', textColor: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', barColor: 'bg-amber-500' },
  { level: 4, name: 'Platinum', threshold: 350, color: 'from-purple-400 to-purple-600', textColor: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', barColor: 'bg-purple-500' },
  { level: 5, name: 'Diamond', threshold: 700, color: 'from-cyan-400 to-blue-600', textColor: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', barColor: 'bg-cyan-500' },
];

export function getLevelInfo(points) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1] || null;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].threshold) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const xpInLevel = points - currentLevel.threshold;
  const xpToNext = nextLevel ? nextLevel.threshold - currentLevel.threshold : 0;
  const progress = nextLevel ? Math.min(xpInLevel / xpToNext, 1) : 1;

  return { currentLevel, nextLevel, xpInLevel, xpToNext, progress };
}
