"use client";

type ActivityDisplayNameProps = {
  name: string;
  sportType: string;
  startDateIso: string;
};

function getSportLabel(sportType: string) {
  const normalized = sportType.trim().toLowerCase();

  if (normalized.includes("run")) {
    return "Run";
  }
  if (normalized.includes("walk")) {
    return "Walk";
  }
  if (
    normalized.includes("ride") ||
    normalized.includes("bike") ||
    normalized.includes("cycl")
  ) {
    return "Ride";
  }
  if (normalized.includes("swim")) {
    return "Swim";
  }
  if (normalized.includes("hike")) {
    return "Hike";
  }

  return sportType
    .split(" ")
    .filter(Boolean)
    .map(
      (token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase(),
    )
    .join(" ");
}

function getTimeOfDayLabel(date: Date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "Evening";
  }
  return "Night";
}

function isGenericActivityName(name: string) {
  const trimmed = name.trim();

  if (/^#\d+$/i.test(trimmed)) {
    return true;
  }

  if (/^(morning|afternoon|evening|night)\s+[a-z ]+?\s*#\d+$/i.test(trimmed)) {
    return true;
  }

  return false;
}

export function ActivityDisplayName({
  name,
  sportType,
  startDateIso,
}: ActivityDisplayNameProps) {
  if (!isGenericActivityName(name)) {
    return <>{name}</>;
  }

  const startDate = new Date(startDateIso);

  if (Number.isNaN(startDate.getTime())) {
    return <>{name}</>;
  }

  const timeOfDay = getTimeOfDayLabel(startDate);
  const sportLabel = getSportLabel(sportType);

  return <>{`${timeOfDay} ${sportLabel}`}</>;
}
