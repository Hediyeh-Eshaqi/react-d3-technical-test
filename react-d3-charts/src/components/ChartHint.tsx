import styles from "./ChartHint.module.css";
export default function ChartHint() {
  return (
    <p className={styles.ChartHintBox}>
      💡 Brush the chart to zoom. Double click to re-initialize.
    </p>
  );
}
