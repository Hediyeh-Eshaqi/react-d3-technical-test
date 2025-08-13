import type { ChartEntry } from "../types";

type Props = {
  entry: ChartEntry;
  width?: number;
  height?: number;
};

export default function Chart({ entry, width = 720, height = 300 }: Props) {
  const props = [entry, width, height];
  return <div>inside chart </div>;
}
