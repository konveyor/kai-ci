let KAIData = []
let JsonDates = []

const CHART_COLORS = {
    // Colors for Line Elements (Cool and Vivid)
    blue: 'rgb(54, 162, 235)',
    green: 'rgb(48, 217, 87)',
    red: 'rgb(255, 102, 102)',
    purple: 'rgb(153, 102, 255)',
    cyan: 'rgb(176, 58, 111)',
    darkBlue: 'rgb(0, 0, 139)',

    // Colors for Bar Elements (Warm and Muted/Pastel)
    lightOrange: 'rgb(255, 200, 112)',
    lightRed: 'rgb(255, 150, 150)',
    lightBlue: 'rgb(122, 213, 255)',
    lightBrown: 'rgb(210, 180, 140)',
    lightPurple: 'rgb(199, 171, 255)',

    // Additional Colors
    yellow: 'rgb(255, 205, 86)',
    orange: 'rgb(255, 159, 64)',
    grey: 'rgb(201, 203, 207)',
    pink: 'rgb(255, 182, 193)',

    // Transparent versions
    redTransparent: 'rgba(255, 99, 132, 0.5)',
    orangeTransparent: 'rgba(255, 159, 64, 0.5)',
    yellowTransparent: 'rgba(255, 205, 86, 0.5)',
    greenTransparent: 'rgba(75, 192, 192, 0.5)',
    blueTransparent: 'rgba(54, 162, 235, 0.5)',
    purpleTransparent: 'rgba(153, 102, 255, 0.5)',
    greyTransparent: 'rgba(201, 203, 207, 0.5)',
    lightBlueTransparent: 'rgb(122, 213, 255, 0.5)',
    lightPurpleTransparent: 'rgb(199, 171, 255, 0.5)',
};

// todo: Update to correct path or env variable
const gistURL = "https://gist.githubusercontent.com/midays/c6e40aac77cbecf8b9a92849bd3393ca/raw/20e8598d34ce1f31160a5c08e96d1d8976d8f66f/newData"

function createDatePicker() {
    const datePicker = document.getElementById('date-picker');

    const minDate = JsonDates[0];
    const maxDate = JsonDates[JsonDates.length - 1];
    datePicker.min = minDate;
    datePicker.max = maxDate;

    datePicker.addEventListener('change', (event) => {
        const selectedDate = event.target.value;
        if (JsonDates.includes(selectedDate)) {

            document.getElementById('pies-chart').remove();
            const validCodeCanvas = document.createElement('canvas');
            validCodeCanvas.id = 'pies-chart';

            document.getElementById('average-ranges-chart').remove();
            const averageRangesCanvas = document.createElement('canvas');
            averageRangesCanvas.id = 'average-ranges-chart';

            document.getElementById('single-performace-charts').appendChild(validCodeCanvas);
            document.getElementById('single-performace-charts').appendChild(averageRangesCanvas);

            pieCharts(selectedDate);
            averageRangesChart(selectedDate);
        }
    });
}

function formatDatesToLabels(dates) {

    const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return dates.map(dateStr => {
        const date = new Date(dateStr);
        const monthName = months[date.getMonth()];
        const day = date.getDate();
        return `${monthName} ${day}`;
    });
}

function addRangePicker() {
    flatpickr("#date-range-input", {
        mode: "range",
        dateFormat: "Y-m-d",
        onClose: function (selectedDates) {
            if (selectedDates.length === 2) {
                const startDate = selectedDates[0];
                const endDate = selectedDates[1];

                const filteredData = KAIData.filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate >= startDate && itemDate <= endDate;
                });

                document.getElementById('kai-performance-chart').remove();
                const canvasContainer = document.createElement('canvas');
                canvasContainer.id = 'kai-performance-chart';
                document.getElementById('history-performance').appendChild(canvasContainer);

                kaiPerformanceChart(filteredData);
            }
        }
    });
}

async function fetchJson() {
    const retries = 3;
    while (retries > 0) {
        try {
            const response = await fetch(gistURL);
            if (!response.ok) {
                throw new Error('Network Error, failed to fetch the evaluation data file');
            }
            KAIData = await response.json();
            JsonDates = KAIData.map(obj => obj.date.split(" ")[0]);
            JsonDates.sort();
            break;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            retries -= 1;
            if (retries === 0) {
                console.error('All retries failed. Please check your network connection or the URL.');
            } else {
                console.log(`Retrying... (${3 - retries} attempts left)`);
            }
        }
    }
}

function getMinAndMaxValues(data, key) {
    const values = data.map(item => item[key]);
    return [Math.min(...values), Math.max(...values)];
}

function kaiPerformanceChart(filteredData) {

    const ctx = document.getElementById('kai-performance-chart').getContext('2d');

    formattedDates = formatDatesToLabels(filteredData.map(item => item.date))

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedDates,
            datasets: [
                {
                    label: 'Total Incidents',
                    data: filteredData.map(item => item.KaiEvalData.TotalIncidents),
                    borderColor: CHART_COLORS.red,
                    backgroundColor: CHART_COLORS.red,
                    borderWidth: 4,
                    tension: 0.4,
                    order: 0
                },
                {
                    label: 'Average Score',
                    data: filteredData.map(item => item.KaiEvalData["Average Score"]),
                    borderColor: CHART_COLORS.blue,
                    backgroundColor: CHART_COLORS.blue,
                    borderWidth: 4,
                    tension: 0.4,
                    order: 0
                },
                {
                    label: 'Average Effectiveness',
                    data: filteredData.map(item => item.KaiEvalData["Average Effectiveness"]),
                    borderColor: CHART_COLORS.green,
                    backgroundColor: CHART_COLORS.green,
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Average Specificity',
                    data: filteredData.map(item => item.KaiEvalData["Average Specificity"]),
                    borderColor: CHART_COLORS.cyan,
                    backgroundColor: CHART_COLORS.cyan,
                    borderWidth: 2,
                    tension: 0.4,
                    order: 0
                },
                {
                    label: 'Average Reasoning',
                    data: filteredData.map(item => item.KaiEvalData["Average Reasoning"]),
                    borderColor: CHART_COLORS.darkBlue,
                    backgroundColor: CHART_COLORS.darkBlue,
                    borderWidth: 2,
                    tension: 0.4,
                    order: 0
                },
                {
                    label: 'Average Competency',
                    data: filteredData.map(item => item.KaiEvalData["Average Competency"]),
                    borderColor: CHART_COLORS.purple,
                    backgroundColor: CHART_COLORS.purple,
                    borderWidth: 2,
                    tension: 0.4,
                    order: 0
                },
                {
                    label: 'Valid Code True',
                    data: filteredData.map(obj => {
                        const totalCount = obj.KaiEvalData.data.reduce((count, data) => {
                            return data["Valid Code"] === "True" ? count + 1 : count;
                        }, 0);
                        return totalCount;
                    }),
                    backgroundColor: CHART_COLORS.redTransparent,
                    borderColor: CHART_COLORS.red,
                    type: 'bar',
                    order: 1,
                    stack: "stack1",
                    barPercentage: 0.2,
                    borderWidth: 1
                },
                {
                    label: 'Valid Code False',
                    data: filteredData.map(obj => {
                        const totalCount = obj.KaiEvalData.data.reduce((count, data) => {
                            return data["Valid Code"] === "False" ? count + 1 : count;
                        }, 0);
                        return totalCount;
                    }),
                    backgroundColor: CHART_COLORS.lightBlueTransparent,
                    borderColor: CHART_COLORS.blue,
                    type: 'bar',
                    order: 1,
                    stack: "stack1",
                    barPercentage: 0.2,
                    borderWidth: 1
                },
                {
                    label: 'Unnecessary Changes True',
                    data: filteredData.map(obj => {
                        const totalCount = obj.KaiEvalData.data.reduce((count, data) => {
                            return data["Unnecessary Changes"] === "True" ? count + 1 : count;
                        }, 0);
                        return totalCount;
                    }),
                    backgroundColor: CHART_COLORS.orangeTransparent,
                    borderColor: CHART_COLORS.orange,
                    type: 'bar',
                    order: 1,
                    stack: "stack2",
                    barPercentage: 0.2,
                    borderWidth: 1
                },
                {
                    label: 'Unnecessary Changes False',
                    data: filteredData.map(obj => {
                        const totalCount = obj.KaiEvalData.data.reduce((count, data) => {
                            return data["Unnecessary Changes"] === "False" ? count + 1 : count;
                        }, 0);
                        return totalCount;
                    }),
                    backgroundColor: CHART_COLORS.lightPurpleTransparent,
                    borderColor: CHART_COLORS.lightPurple,
                    type: 'bar',
                    order: 1,
                    stack: "stack2",
                    borderWidth: 1,
                    barPercentage: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    barPercentage: 0.1
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 12,
                }
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
                    padding: 12
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
        }
    });
}

function pieCharts(selectedDate) {

    SelectedKaiData = KAIData.find(item => item.date.includes(selectedDate))

    const [validCodeTrueCount, validCodeFalseCount, unnecessaryChangesCount, necessaryChangesCount] = SelectedKaiData.KaiEvalData.data.reduce(
        ([codeTrueCount, codeFalseCount, changesTrueCount, changesFalseCount], item) => [
            codeTrueCount + (item["Valid Code"] === "True" ? 1 : 0),
            codeFalseCount + (item["Valid Code"] === "False" ? 1 : 0),
            changesTrueCount + (item["Unnecessary Changes"] === "True" ? 1 : 0),
            changesFalseCount + (item["Unnecessary Changes"] === "False" ? 1 : 0)

        ], [0, 0, 0, 0]
    );

    const ctx = document.getElementById('pies-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Valid Code', 'Invalid Code', 'Unnecessary Changes', 'Necessary Changes'],
            datasets: [
                {
                    data: [validCodeTrueCount, validCodeFalseCount],
                    backgroundColor: [
                        CHART_COLORS.lightOrange,
                        CHART_COLORS.orange
                    ],
                },
                {
                    data: [unnecessaryChangesCount, necessaryChangesCount],
                    backgroundColor: [
                        CHART_COLORS.blue,
                        CHART_COLORS.lightBlue,
                    ],
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            let resultLabels = [];

                            datasets.forEach((dataset, datasetIndex) => {
                                dataset.data.forEach((dataPoint, dataIndex) => {
                                    resultLabels.push({
                                        text: `${chart.data.labels[dataIndex + (datasetIndex * 2)]}`,
                                        fillStyle: dataset.backgroundColor[dataIndex],
                                        hidden: chart.getDatasetMeta(datasetIndex).data[dataIndex].hidden || false,
                                        datasetIndex: datasetIndex,
                                        index: dataIndex
                                    });
                                });
                            });

                            return resultLabels;
                        }
                    },
                    onClick: function(mouseEvent, legendItem, legend) {
                        const datasetIndex = legendItem.datasetIndex;
                        const dataIndex = legendItem.index;
                        const meta = legend.chart.getDatasetMeta(datasetIndex);
                        meta.data[dataIndex].hidden = !meta.data[dataIndex].hidden;
                        legend.chart.update();
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label || '';
                            const label = context.chart.data.labels[context.dataIndex + (context.datasetIndex * 2)] || '';
                            return `${label}: ${context.formattedValue}`;
                        }
                    },
                    bodyFont: {
                        size: 16,
                    },
                    titleFont: {
                        size: 18,
                    },
                    padding: 12
                },
                
            }
        }
    });
}

function averageRangesChart(selectedDate) {

    SelectedKaiData = KAIData.find(item => item.date.includes(selectedDate))

    const effectivenessRange = getMinAndMaxValues(SelectedKaiData.KaiEvalData.data, 'Effectiveness');
    const specificityRange = getMinAndMaxValues(SelectedKaiData.KaiEvalData.data, 'Specificity');
    const reasoningRange = getMinAndMaxValues(SelectedKaiData.KaiEvalData.data, 'Reasoning');
    const competencyRange = getMinAndMaxValues(SelectedKaiData.KaiEvalData.data, 'Competency');

    const ctx = document.getElementById('average-ranges-chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Effectiveness', 'Specificity', 'Reasoning', 'Competency'],
            datasets: [
                {
                    label: 'Range',
                    data: [
                        effectivenessRange,
                        specificityRange,
                        reasoningRange,
                        competencyRange
                    ],
                    backgroundColor: [
                        CHART_COLORS.blueTransparent,
                        CHART_COLORS.redTransparent,
                        CHART_COLORS.purpleTransparent,
                        CHART_COLORS.yellowTransparent
                    ],
                    borderColor: [
                        CHART_COLORS.blue,
                        CHART_COLORS.red,
                        CHART_COLORS.purple,
                        CHART_COLORS.yellow
                    ],
                    borderWidth: 1,
                    barThickness: 25,
                    type: 'bar',
                    base: [
                        effectivenessRange.min,
                        specificityRange.min,
                        reasoningRange.min,
                        competencyRange.min
                    ],
                    order: 0
                },
                {
                    label: 'Average Value',
                    data: [
                        SelectedKaiData.KaiEvalData["Average Effectiveness"],
                        SelectedKaiData.KaiEvalData["Average Specificity"],
                        SelectedKaiData.KaiEvalData["Average Reasoning"],
                        SelectedKaiData.KaiEvalData["Average Competency"]
                    ],
                    borderColor: 'rgba(0, 0, 0, 1)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    type: 'line',
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(0, 0, 0, 1)',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: false,
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 12
                }
            },
            plugins: {
                legend: {
                    position: 'top'
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
                        intersect: false
                    },
                }
            }
        }
    });

}

async function init() {
    await fetchJson();
    addRangePicker();
    createDatePicker();
    kaiPerformanceChart(KAIData);
    pieCharts(KAIData[0].date);
    averageRangesChart(KAIData[0].date);
}

init();

