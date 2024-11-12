let kaiData = [];
let jsonDates = [];

const CHART_COLORS = {
  // Cool and Vivid Colors
  blue: 'rgb(54, 162, 235)',
  green: 'rgb(48, 217, 87)',
  red: 'rgb(255, 102, 102)',
  purple: 'rgb(153, 102, 255)',
  cyan: 'rgb(176, 58, 111)',
  darkBlue: 'rgb(0, 0, 139)',
  yellow: 'rgb(255, 205, 86)',
  orange: 'rgb(255, 159, 64)',

  // Warm and Muted/Pastel Colors
  lightOrange: 'rgb(255, 200, 112)',
  lightBlue: 'rgb(122, 213, 255)',
  lightPurple: 'rgb(199, 171, 255)',

  // Transparent colors
  redTransparent: 'rgba(255, 99, 132, 0.5)',
  orangeTransparent: 'rgba(255, 159, 64, 0.5)',
  yellowTransparent: 'rgba(255, 205, 86, 0.5)',
  blueTransparent: 'rgba(54, 162, 235, 0.5)',
  purpleTransparent: 'rgba(153, 102, 255, 0.5)',
  lightBlueTransparent: 'rgb(122, 213, 255, 0.5)',
  lightPurpleTransparent: 'rgb(199, 171, 255, 0.5)',
};

// todo: Update to correct path or env variable
const gistURL =
  'https://gist.githubusercontent.com/midays/c6e40aac77cbecf8b9a92849bd3393ca/raw/857df002b4ac87ccb334baac7e0fc46f18b5e76e/newData';

function createDatePicker() {
  const datePicker = document.getElementById('date-picker');

  const minDate = jsonDates[0];
  const maxDate = jsonDates[jsonDates.length - 1];
  datePicker.min = minDate;
  datePicker.max = maxDate;

  datePicker.addEventListener('change', (event) => {
    const selectedDate = event.target.value;

    if (!jsonDates.includes(selectedDate)) return;

    resetCanvasElements(
      ['pies-chart', 'average-ranges-chart'],
      'single-performace-charts'
    );

    pieCharts(selectedDate);
    averageRangesChart(selectedDate);
  });
}

function resetCanvasElements(chartIds, containerId) {
  chartIds.forEach((chartId) => {
    const existingCanvas = document.getElementById(chartId);
    if (existingCanvas) {
      existingCanvas.remove();
    }
    const newCanvas = document.createElement('canvas');
    newCanvas.id = chartId;
    document.getElementById(containerId).appendChild(newCanvas);
  });
}

function formatDatesToLabels(dates) {
  return dates.map((dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
}

function addRangePicker(options = {}) {
  const defaultOptions = {
    mode: 'range',
    dateFormat: 'Y-m-d',
    onClose: function (selectedDates) {
      if (selectedDates.length !== 2) return;

      const startDate = selectedDates[0];
      const endDate = selectedDates[1];

      const filteredData = kaiData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });

      resetCanvasElements(['kai-performance-chart'], 'history-performance');

      kaiPerformanceChart(filteredData);
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  flatpickr('#date-range-input', finalOptions);
}

async function fetchJson() {
  const retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(gistURL);
      if (!response.ok) {
        throw new Error(
          'Network Error, failed to fetch the evaluation data file'
        );
      }
      kaiData = await response.json();
      jsonDates = kaiData.map((obj) => obj.date.split(' ')[0]);
      jsonDates.sort();
      break;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      retries -= 1;
      if (retries === 0) {
        console.error(
          'All retries failed. Please check your network connection or the URL.'
        );
      }
    }
  }
}

function getMinAndMaxValues(data, key) {
  const values = data.map((item) => item[key]);
  return [Math.min(...values), Math.max(...values)];
}

function kaiPerformanceChart(filteredData) {
  filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

  formattedDates = formatDatesToLabels(filteredData.map((item) => item.date));

  const chartData = {
    labels: formattedDates,
    datasets: [
      {
        label: 'Total Incidents',
        data: filteredData.map((item) => item.kaiEvalData.length),
        borderColor: CHART_COLORS.red,
        backgroundColor: CHART_COLORS.red,
        borderWidth: 4,
        tension: 0.4,
        order: 0,
      },
      {
        label: 'Average Score',
        data: filteredData.map((item) => item.kaiEvalData.averageScore),
        borderColor: CHART_COLORS.blue,
        backgroundColor: CHART_COLORS.blue,
        borderWidth: 4,
        tension: 0.4,
        order: 0,
      },
      {
        label: 'Average Effectiveness',
        data: filteredData.map((item) => item.kaiEvalData.averageEffectiveness),
        borderColor: CHART_COLORS.green,
        backgroundColor: CHART_COLORS.green,
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Average Specificity',
        data: filteredData.map((item) => item.kaiEvalData.averageSpecificity),
        borderColor: CHART_COLORS.cyan,
        backgroundColor: CHART_COLORS.cyan,
        borderWidth: 2,
        tension: 0.4,
        order: 0,
      },
      {
        label: 'Average Reasoning',
        data: filteredData.map((item) => item.kaiEvalData.averageReasoning),
        borderColor: CHART_COLORS.darkBlue,
        backgroundColor: CHART_COLORS.darkBlue,
        borderWidth: 2,
        tension: 0.4,
        order: 0,
      },
      {
        label: 'Average Competency',
        data: filteredData.map((item) => item.kaiEvalData.averageCompetency),
        borderColor: CHART_COLORS.purple,
        backgroundColor: CHART_COLORS.purple,
        borderWidth: 2,
        tension: 0.4,
        order: 0,
      },
      {
        label: 'Valid Code True',
        data: filteredData.map((obj) => {
          const totalCount = obj.kaiEvalData.data.reduce((count, data) => {
            return data.validCode === true ? count + 1 : count;
          }, 0);
          return totalCount;
        }),
        backgroundColor: CHART_COLORS.redTransparent,
        borderColor: CHART_COLORS.red,
        type: 'bar',
        order: 1,
        stack: 'stack1',
        barPercentage: 0.2,
        borderWidth: 1,
      },
      {
        label: 'Valid Code False',
        data: filteredData.map((obj) => {
          const totalCount = obj.kaiEvalData.data.reduce((count, data) => {
            return data.validCode === false ? count + 1 : count;
          }, 0);
          return totalCount;
        }),
        backgroundColor: CHART_COLORS.lightBlueTransparent,
        borderColor: CHART_COLORS.blue,
        type: 'bar',
        order: 1,
        stack: 'stack1',
        barPercentage: 0.2,
        borderWidth: 1,
      },
      {
        label: 'Unnecessary Changes True',
        data: filteredData.map((obj) => {
          const totalCount = obj.kaiEvalData.data.reduce((count, data) => {
            return data.unnecessaryChanges === true ? count + 1 : count;
          }, 0);
          return totalCount;
        }),
        backgroundColor: CHART_COLORS.orangeTransparent,
        borderColor: CHART_COLORS.orange,
        type: 'bar',
        order: 1,
        stack: 'stack2',
        barPercentage: 0.2,
        borderWidth: 1,
      },
      {
        label: 'Unnecessary Changes False',
        data: filteredData.map((obj) => {
          const totalCount = obj.kaiEvalData.data.reduce((count, data) => {
            return data['unnecessaryChanges'] === false ? count + 1 : count;
          }, 0);
          return totalCount;
        }),
        backgroundColor: CHART_COLORS.lightPurpleTransparent,
        borderColor: CHART_COLORS.lightPurple,
        type: 'bar',
        order: 1,
        stack: 'stack2',
        borderWidth: 1,
        barPercentage: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        barPercentage: 0.1,
      },
      y: {
        beginAtZero: true,
        suggestedMax: 12,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        position: 'nearest',
        bodyFont: {
          size: 16,
        },
        titleFont: {
          size: 18,
        },
        padding: 12,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  createChart('kai-performance-chart', 'line', chartData, chartOptions);
}

function pieCharts(selectedDate) {
  selectedkaiData = kaiData.find((item) => item.date.includes(selectedDate));

  const [
    validCodeTrueCount,
    validCodeFalseCount,
    unnecessaryChangesCount,
    necessaryChangesCount,
  ] = selectedkaiData.kaiEvalData.data.reduce(
    (
      [codeTrueCount, codeFalseCount, changesTrueCount, changesFalseCount],
      item
    ) => [
      codeTrueCount + (item['validCode'] === true ? 1 : 0),
      codeFalseCount + (item['validCode'] === false ? 1 : 0),
      changesTrueCount + (item['unnecessaryChanges'] === true ? 1 : 0),
      changesFalseCount + (item['unnecessaryChanges'] === false ? 1 : 0),
    ],
    [0, 0, 0, 0]
  );

  const chartData = {
    labels: [
      'Valid Code',
      'Invalid Code',
      'Unnecessary Changes',
      'Necessary Changes',
    ],
    datasets: [
      {
        data: [validCodeTrueCount, validCodeFalseCount],
        backgroundColor: [CHART_COLORS.lightOrange, CHART_COLORS.orange],
      },
      {
        data: [unnecessaryChangesCount, necessaryChangesCount],
        backgroundColor: [CHART_COLORS.blue, CHART_COLORS.lightBlue],
      },
    ],
  };

  chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          generateLabels: function (chart) {
            const datasets = chart.data.datasets;
            let resultLabels = [];

            datasets.forEach((dataset, datasetIndex) => {
              dataset.data.forEach((dataPoint, dataIndex) => {
                resultLabels.push({
                  text: `${chart.data.labels[dataIndex + datasetIndex * 2]}`,
                  fillStyle: dataset.backgroundColor[dataIndex],
                  hidden:
                    chart.getDatasetMeta(datasetIndex).data[dataIndex].hidden ||
                    false,
                  datasetIndex: datasetIndex,
                  index: dataIndex,
                });
              });
            });

            return resultLabels;
          },
        },
        onClick: function (mouseEvent, legendItem, legend) {
          const datasetIndex = legendItem.datasetIndex;
          const dataIndex = legendItem.index;
          const meta = legend.chart.getDatasetMeta(datasetIndex);
          meta.data[dataIndex].hidden = !meta.data[dataIndex].hidden;
          legend.chart.update();
        },
      },
      tooltip: {
        callbacks: {
          title: () => null,
          label: function (context) {
            const label =
              context.chart.data.labels[
                context.dataIndex + context.datasetIndex * 2
              ] || '';
            return `${label}: ${context.formattedValue}`;
          },
        },
        bodyFont: {
          size: 16,
        },
        titleFont: {
          size: 18,
        },
        padding: 12,
      },
    },
  };
  createChart('pies-chart', 'doughnut', chartData, chartOptions);
}

function getMinAndMaxValues(data, key) {
  const values = data.map((item) => item[key]);
  return [Math.min(...values), Math.max(...values)];
}

function getRangeData(selectedkaiData, keys) {
  return keys.map((key) =>
    getMinAndMaxValues(selectedkaiData.kaiEvalData.data, key)
  );
}

function averageRangesChart(selectedDate) {
  selectedkaiData = kaiData.find((item) => item.date.includes(selectedDate));

  const keys = ['effectiveness', 'specificity', 'reasoning', 'competency'];
  const ranges = getRangeData(selectedkaiData, keys);

  const chartData = {
    labels: ['Effectiveness', 'Specificity', 'Reasoning', 'Competency'],
    datasets: [
      {
        label: 'Range',
        data: ranges,
        backgroundColor: [
          CHART_COLORS.blueTransparent,
          CHART_COLORS.redTransparent,
          CHART_COLORS.purpleTransparent,
          CHART_COLORS.yellowTransparent,
        ],
        borderColor: [
          CHART_COLORS.blue,
          CHART_COLORS.red,
          CHART_COLORS.purple,
          CHART_COLORS.yellow,
        ],
        borderWidth: 1,
        barThickness: 25,
        type: 'bar',
        base: ranges.map((range) => range[0]),
        order: 0,
      },
      {
        label: 'Average Value',
        data: [
          selectedkaiData.kaiEvalData['averageEffectiveness'],
          selectedkaiData.kaiEvalData['averageSpecificity'],
          selectedkaiData.kaiEvalData['averageReasoning'],
          selectedkaiData.kaiEvalData['averageCompetency'],
        ],
        borderColor: 'rgba(0, 0, 0, 1)',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        type: 'line',
        fill: false,
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(0, 0, 0, 1)',
        order: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: false,
      },
      y: {
        beginAtZero: true,
        suggestedMax: 12,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        bodyFont: {
          size: 16,
        },
        titleFont: {
          size: 18,
        },
        padding: 12,
        interaction: {
          mode: 'index',
          intersect: false,
        },
      },
    },
  };

  createChart('average-ranges-chart', 'bar', chartData, chartOptions);
}

function createChart(chartID, type, data, options) {
  const ctx = document.getElementById(chartID).getContext('2d');
  new Chart(ctx, {
    type: type,
    data: data,
    options: options,
  });
}

function initializeComponents() {
  addRangePicker();
  createDatePicker();
}

function initializeCharts() {
  kaiPerformanceChart(kaiData);
  pieCharts(kaiData[0].date);
  averageRangesChart(kaiData[0].date);
}

async function init() {
  await fetchJson();
  initializeComponents();
  initializeCharts();
}

init();
