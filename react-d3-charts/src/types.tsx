export type Timestamp = number;

export type SinglePoint = [Timestamp, number | null];

export type Triple = [number | null, number | null, number | null];
export type MultiPoint = [Timestamp, Triple];

export type ChartEntry = {
  title: string;
  data: Array<SinglePoint | MultiPoint>;
};

// Distinguish a single datapoint as multi-series
export function isMultiPoint(p: SinglePoint | MultiPoint): p is MultiPoint {
  return Array.isArray((p as MultiPoint)[1]);
}

// Determine if the entire chart is multi-series
export function isMultiChart(entry: ChartEntry): boolean {
  if (!entry?.data?.length) return false;
  return Array.isArray((entry.data[0] as MultiPoint)[1]);
}
