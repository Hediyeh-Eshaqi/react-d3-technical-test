import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  isMultiChart,
  type ChartEntry,
  type MultiPoint,
  type SinglePoint,
} from "../types";

type Props = {
  entry: ChartEntry; // The chart's data and title
  width?: number; // Outer SVG width (including margins)
  height?: number; // Outer SVG height (including margins)
};

const COLORS = ["#1f77b4", "#2ca02c", "#d62728"]; // Blue, Green, Red
const MARGIN = { top: 10, right: 30, bottom: 30, left: 60 };

//
// ---------- Helper Functions ----------
//

// Collect all numeric Y values from chart data (ignore nulls)
function collectYValues(entry: ChartEntry): number[] {
  if (isMultiChart(entry)) {
    const vals: number[] = [];
    (entry.data as MultiPoint[]).forEach(([_, triple]) => {
      triple.forEach((v) => {
        if (typeof v === "number") vals.push(v);
      });
    });
    return vals;
  }
  return (entry.data as SinglePoint[])
    .map(([, v]) => v)
    .filter((v): v is number => typeof v === "number");
}

// Build an array of series for multi-series charts
function getSeriesArrays(entry: ChartEntry): [number, number | null][][] {
  if (!isMultiChart(entry)) return [];
  const data = entry.data as MultiPoint[];
  return [0, 1, 2].map((i) => data.map((row) => [row[0], row[1][i]]));
}

// Create line generators for single- and multi-series charts
function createLineGenerators(
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>
) {
  return {
    single: d3
      .line<SinglePoint>()
      .defined((d) => d[1] !== null)
      .x((d) => x(d[0]))
      .y((d) => y(d[1] as number)),
    multi: d3
      .line<[number, number | null]>()
      .defined((d) => d[1] !== null)
      .x((d) => x(d[0]))
      .y((d) => y(d[1] as number)),
  };
}

//
// ---------- Main Component ----------
//

export default function Chart({ entry, width = 720, height = 300 }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const clipIdRef = useRef(`clip-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    // Root <g> translated by margins
    const root = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Clip-path to keep all drawing within inner plot area
    root
      .append("defs")
      .append("clipPath")
      .attr("id", clipIdRef.current)
      .append("rect")
      .attr("width", innerW)
      .attr("height", innerH);

    // X scale (numeric timestamps)
    const timestamps = entry.data.map((d) => d[0] as number);
    const x0 = d3.extent(timestamps) as [number, number];
    const x = d3.scaleLinear().domain(x0).range([0, innerW]).nice();

    // Y scale (shared across series)
    const yValues = collectYValues(entry);
    const y = d3
      .scaleLinear()
      .domain(
        yValues.length ? (d3.extent(yValues) as [number, number]) : [0, 1]
      )
      .range([innerH, 0])
      .nice();

    // Axes
    const xAxisG = root
      .append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6));
    root.append("g").call(d3.axisLeft(y).ticks(6));

    // Build line generators
    const { single: singleLine, multi: multiLine } = createLineGenerators(x, y);

    // Group for chart paths, clipped to plot area
    const plotG = root
      .append("g")
      .attr("clip-path", `url(#${clipIdRef.current})`);

    // Initial draw
    let seriesArrays: [number, number | null][][] = [];
    if (isMultiChart(entry)) {
      seriesArrays = getSeriesArrays(entry);
      seriesArrays.forEach((serie, idx) => {
        plotG
          .append("path")
          .attr("fill", "none")
          .attr("stroke", COLORS[idx])
          .attr("stroke-width", 1.5)
          .attr("d", multiLine(serie) ?? "");
      });
    } else {
      const data = entry.data as SinglePoint[];
      plotG
        .append("path")
        .attr("fill", "none")
        .attr("stroke", COLORS[0])
        .attr("stroke-width", 1.5)
        .attr("d", singleLine(data) ?? "");
    }

    // Re-draw helper used by both brush and double-click
    const redraw = (newX: d3.ScaleLinear<number, number>) => {
      xAxisG.transition().duration(250).call(d3.axisBottom(newX).ticks(6));
      if (isMultiChart(entry)) {
        const lineWithX = createLineGenerators(newX, y).multi;
        plotG.selectAll<SVGPathElement, unknown>("path").each(function (_d, i) {
          d3.select(this)
            .transition()
            .duration(250)
            .attr("d", lineWithX(seriesArrays[i]) ?? "");
        });
      } else {
        const data = entry.data as SinglePoint[];
        const lineWithX = createLineGenerators(newX, y).single;
        plotG
          .selectAll<SVGPathElement, unknown>("path")
          .transition()
          .duration(250)
          .attr("d", lineWithX(data) ?? "");
      }
    };

    // Brush for selecting an X-range to zoom into
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [innerW, innerH],
      ])
      .on("end", (event) => {
        const sel = event.selection as [number, number] | null;
        if (!sel) return; // Ignore if no selection
        const newX = x.copy().domain([x.invert(sel[0]), x.invert(sel[1])]);
        plotG.select<SVGGElement>(".brush").call(brush.move as any, null);
        redraw(newX);
      });

    plotG
      .append("g")
      .attr("class", "brush")
      .call(brush as any);

    // Double-click to reset the X-axis to its original domain
    root.on("dblclick", () => redraw(x.copy().domain(x0)));
  }, [entry, width, height]);

  return <svg ref={svgRef} role="img" aria-label={entry.title} />;
}
