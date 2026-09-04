export const ACTIONS = [
  { id: "left", label: "Move Cursor Left", command: "← MOVE LEFT", short: "CURSOR LEFT", frequency: 1.8 },
  { id: "right", label: "Move Cursor Right", command: "→ MOVE RIGHT", short: "CURSOR RIGHT", frequency: 2.3 },
  { id: "up", label: "Move Up", command: "↑ MOVE UP", short: "MOVE UP", frequency: 2.8 },
  { id: "down", label: "Move Down", command: "↓ MOVE DOWN", short: "MOVE DOWN", frequency: 3.2 },
  { id: "select", label: "Select", command: "● SELECT", short: "SELECT", frequency: 4.4 },
  { id: "rest", label: "Rest", command: "— REST", short: "REST", frequency: 0.8 },
] as const;

export type ActionId = (typeof ACTIONS)[number]["id"];
export type SignalPoint = { time: number; value: number };
export type Probabilities = Record<ActionId, number>;

export function createInitialSignal(length = 96): SignalPoint[] {
  return Array.from({ length }, (_, index) => ({ time: index, value: 0 }));
}

export function generateNeuralSignal(actionId: ActionId, tick: number, noisePercent: number, strengthPercent: number): SignalPoint {
  const action = ACTIONS.find((item) => item.id === actionId) ?? ACTIONS[0];
  const phase = tick / 6;
  const baseline = Math.sin(phase * action.frequency) * 0.28 + Math.sin(phase * 0.47) * 0.12;
  const pulse = Math.max(0, Math.sin(phase * 0.72 + action.frequency)) ** 8 * 0.7;
  const noise = (Math.sin(tick * 12.9898 + action.frequency * 78.233) * 43758.5453 % 1) * (noisePercent / 100) * 0.8;
  const value = (baseline + pulse + noise) * (strengthPercent / 100);
  return { time: tick, value: Math.max(-1, Math.min(1, value)) };
}

export function calculateSignalQuality(noise: number, strength: number): "Excellent" | "Good" | "Moderate" | "Poor" {
  const score = strength - noise * 0.65;
  if (score >= 72) return "Excellent";
  if (score >= 52) return "Good";
  if (score >= 32) return "Moderate";
  return "Poor";
}

export function simulateAIClassification(actionId: ActionId, noise: number, strength: number, tick: number): Probabilities {
  const action = ACTIONS.findIndex((item) => item.id === actionId);
  const confidence = Math.max(38, Math.min(96, strength - noise * 0.35 + Math.sin(tick / 10) * 4));
  const remainder = 100 - confidence;
  const result = {} as Probabilities;
  ACTIONS.forEach((item, index) => { result[item.id] = index === action ? confidence : remainder / (ACTIONS.length - 1); });
  return result;
}

export function readStoredSettings(): { noise: number; strength: number; actionId: ActionId } {
  if (typeof window === "undefined") return { noise: 18, strength: 78, actionId: "left" };
  try {
    const raw = window.localStorage.getItem("neurocommand-settings");
    if (!raw) return { noise: 18, strength: 78, actionId: "left" };
    const parsed = JSON.parse(raw) as Partial<{ noise: number; strength: number; actionId: ActionId }>;
    return { noise: parsed.noise ?? 18, strength: parsed.strength ?? 78, actionId: parsed.actionId ?? "left" };
  } catch { return { noise: 18, strength: 78, actionId: "left" }; }
}

export function persistSettings(settings: { noise: number; strength: number; actionId: ActionId }) {
  try { window.localStorage.setItem("neurocommand-settings", JSON.stringify(settings)); } catch { /* storage is optional */ }
}
