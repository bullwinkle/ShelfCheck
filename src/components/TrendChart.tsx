import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

type Props = {
  title: string;
  labels: string[];
  values: number[];
  color?: string;
};

export default function TrendChart({ title, labels, values, color = '#f0a500' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: title,
            data: values,
            borderColor: color,
            backgroundColor: 'rgba(240, 165, 0, 0.15)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });

    return () => chart.destroy();
  }, [color, labels, title, values]);

  return <div className="h-72"><canvas ref={canvasRef} aria-label={title} /></div>;
}
