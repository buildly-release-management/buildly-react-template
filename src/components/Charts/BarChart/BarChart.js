import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// style={{ maxHeight: "600px" }}

const BarChart = ({
  id, label, labels, data, backgroundColor, borderWidth, borderColor,
}) => {
  const options = {
    plugins: {
      title: {
        display: true,
        text: label,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    maintainAspectRatio: false,
  };

  const chartData = {
    labels,
    datasets: data,
  };
  return <Bar id={id} options={options} data={chartData} />;
};

export default BarChart;
