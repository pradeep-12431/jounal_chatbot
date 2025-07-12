// 📁 frontend/src/components/MoodChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MoodChart = ({ entries, timeRange }) => {
  // Filter entries based on timeRange
  const filterEntriesByTimeRange = (data) => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
      default: // ⭐ Added default case
        startDate = new Date(0); // Epoch, effectively all time
        break;
    }

    return data.filter(entry => new Date(entry.date) >= startDate);
  };

  const filteredEntries = filterEntriesByTimeRange(entries);

  // Prepare data for the chart
  // Sort entries by date ascending for proper chart display
  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = sortedEntries.map(entry => new Date(entry.date).toLocaleDateString());
  const moodData = sortedEntries.map(entry => {
    // Map mood strings to numerical values for the chart
    switch (entry.mood) {
      case 'happy': return 5;
      case 'excited': return 4; // Assuming excited is slightly less than happy
      case 'neutral': return 3;
      case 'anxious': return 2; // Assuming anxious is slightly less than sad
      case 'sad': return 1;
      case 'angry': return 0; // Assuming angry is the lowest
      default: return 3; // Neutral for unknown moods ⭐ Added default case
    }
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Mood Level',
        data: moodData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Mood Trend (${timeRange === 'all' ? 'All Time' : timeRange.replace('days', ' Days')})`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const moodValue = context.raw;
            let moodLabel = 'Unknown';
            switch (moodValue) {
              case 5: moodLabel = 'Happy 😊'; break;
              case 4: moodLabel = 'Excited 🤩'; break;
              case 3: moodLabel = 'Neutral 😐'; break;
              case 2: moodLabel = 'Anxious 😟'; break;
              case 1: moodLabel = 'Sad 😢'; break;
              case 0: moodLabel = 'Angry 😠'; break;
              default: moodLabel = 'Unknown'; break; // ⭐ Added default case
            }
            return `Mood: ${moodLabel}`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            switch (value) {
              case 0: return 'Angry 😠';
              case 1: return 'Sad 😢';
              case 2: return 'Anxious 😟';
              case 3: return 'Neutral 😐';
              case 4: return 'Excited 🤩';
              case 5: return 'Happy 😊';
              default: return ''; // ⭐ Added default case
            }
          }
        },
        title: {
          display: true,
          text: 'Mood Level'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  if (filteredEntries.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500">
        No mood entries available for the selected period.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <Line data={data} options={options} />
    </div>
  );
};

export default MoodChart;