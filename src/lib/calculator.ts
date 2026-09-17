export interface WellnessResult {
  waterOz: number;
  waterCups: string;
  recoveryScore: number;
  status: "optimal" | "moderate" | "rest";
  statusLabel: string;
  tip: string;
}

export function computeWellness(
  weightLbs: number,
  activityMins: number,
  sleepHours: number,
): WellnessResult {
  const weight = Number.isFinite(weightLbs) ? weightLbs : 160;
  const activity = Number.isFinite(activityMins) ? activityMins : 30;
  const sleep = Number.isFinite(sleepHours) ? sleepHours : 7.5;

  const waterOz = Math.round(weight * 0.5 + (activity / 30) * 12);
  const waterCups = (waterOz / 8).toFixed(1);

  const sleepScore = Math.min(50, (sleep / 8) * 50);
  const activityScore = Math.min(30, (activity / 45) * 30);
  const hydrationScore = 20;
  const recoveryScore = Math.min(
    100,
    Math.round(sleepScore + activityScore + hydrationScore),
  );

  let status: WellnessResult["status"];
  let statusLabel: string;
  let tip: string;

  if (recoveryScore >= 85) {
    status = "optimal";
    statusLabel = "Optimal Sync";
    tip =
      "Your rest and activity levels provide excellent baseline leptin regulation and stress resistance.";
  } else if (recoveryScore >= 65) {
    status = "moderate";
    statusLabel = "Moderate Balance";
    tip =
      "Increasing sleep by 30–60 minutes will reduce cortisol levels and curb afternoon appetite spikes.";
  } else {
    status = "rest";
    statusLabel = "Rest Needed";
    tip =
      "Sleep debt can trigger high ghrelin (hunger hormone) signals. Focus on restorative sleep and gentle hydration.";
  }

  return { waterOz, waterCups, recoveryScore, status, statusLabel, tip };
}
