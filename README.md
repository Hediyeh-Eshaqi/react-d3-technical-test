# 📊 React + TypeScript + D3 Interactive Line Chart

This project is a **technical test** implementation of dynamic, interactive line charts using **React**, **TypeScript**, and **D3.js**.  
It supports both **single‑series** and **multi‑series** datasets, with smooth zooming via brush selection and a double‑click reset, while ensuring all drawing stays within the chart boundaries using `clipPath`.

---

## ✨ Features

- **Single‑series & multi‑series** chart support (auto‑detected from data structure)
- **Shared Y‑axis** scaling across all series for accurate comparisons
- **Null‑safe plotting** – skips `null` values cleanly without breaking the rest of the series
- **Interactive zoom** – horizontal brush to zoom in on a selected range
- **Double‑click reset** – restores the original zoom level instantly
- **Clip‑path masking** – keeps lines constrained inside the plot area
- **TypeScript type safety** – strict type definitions and guards prevent invalid data

---

## 📦 Tech Stack

- [React](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — static typing
- [D3.js](https://d3js.org/) — scales, axes, brush, and rendering
- [Vite](https://vitejs.dev/) — fast dev server and build tool
- CSS Modules — scoped, component‑level styles

---

## 📊 Data Format

```json
[
  {
    "title": "Single Series Example",
    "data": [
      [0, 34],
      [10, 53],
      [20, null],
      [30, 70]
    ]
  },
  {
    "title": "Multi Series Example",
    "data": [
      [0, [34, 45, 75]],
      [10, [53, 84, 34]],
      [20, [null, 60, 40]],
      [30, [70, null, null]]
    ]
  }
]
•	Single‑series: [timestamp, value|null]
•	Multi‑series: [timestamp, [v0|null, v1|null, v2|null]]
```

---

## 🚀 Getting Started

### Clone the repository

`git clone https://github.com/Hediyeh-Eshaqi/react-d3-technical-test`

`cd react-d3-charts`

`npm install`

`npm run dev`

Then open http://localhost:5173 in your browser.

---

## 🖱 How to Use

    •	Brush to zoom: Click and drag horizontally over the chart to zoom into that range.
    •	Double‑click: Resets the chart to its original scale.
    •	Multi‑series colors:
                ◦	Blue → First series
                ◦	Green → Second series
                ◦	Red → Third series

## 📄 License

This code is provided solely for technical evaluation purposes.

Author: Hediyeh Eshaqi Dizanjeh GitHub: @Hediyeh-Eshaqi
