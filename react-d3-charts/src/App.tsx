import { useEffect, useState } from "react";
import Chart from "./components/Chart";
import type { ChartEntry } from "./types";
import styles from "./App.module.css";
import ChartHint from "./components/ChartHint";

function App() {
  const [charts, setCharts] = useState<ChartEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as unknown;
        if (!Array.isArray(json)) throw new Error("Invalid data format");

        // Basic structure validation to prevent runtime issues
        const valid = (json as any[]).every(
          (it) =>
            typeof it?.title === "string" &&
            Array.isArray(it?.data) &&
            it.data.every(
              (row: any) =>
                Array.isArray(row) &&
                typeof row[0] === "number" &&
                (typeof row[1] === "number" ||
                  row[1] === null ||
                  (Array.isArray(row[1]) && row[1].length >= 3))
            )
        );
        if (!valid) throw new Error("Invalid row format");
        setCharts(json as ChartEntry[]);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error)
    return <div className={styles.error}>Failed to load charts: {error}</div>;

  return (
    <div className={styles.app}>
      <ChartHint />
      {charts.map((entry, idx) => (
        <div key={idx} className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>{entry.title}</h3>
          <Chart entry={entry} width={720} height={300} />
        </div>
      ))}
    </div>
  );
}

export default App;
