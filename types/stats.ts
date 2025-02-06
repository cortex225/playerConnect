export type StatsResult = {
  success: boolean;
  data?: StatItem[];
  error?: string;
};

export type StatItem = {
  key: string;
  value: number;
};
