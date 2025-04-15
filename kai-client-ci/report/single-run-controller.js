function createSingleRunDetails(singleNightRuns) {
  // TODO support multiple runs a day
  // TODO include version
  const data = singleNightRuns[0];
  console.log(data);
  const insightsGrid = document.getElementById('insights-grid');
  insightsGrid.appendChild(createCard('Model', data.model));
  insightsGrid.appendChild(
    createCard('Average Competency', data.averageCompetency.toFixed(2))
  );
  insightsGrid.appendChild(
    createCard('Average Effectiveness', data.averageEffectiveness.toFixed(2))
  );
  insightsGrid.appendChild(
    createCard('Average Specificity', data.averageSpecificity.toFixed(2))
  );
  insightsGrid.appendChild(
    createCard('Average Score', data.averageScore.toFixed(2))
  );
  insightsGrid.appendChild(createCard('Total Files', data.totalFiles));
  createFileEvaluationsTable(data.fileEvaluationResults);
  createErrorsList(data.errors);
  const container = document.getElementById('single-run-overview');
  container.style.display = 'block';
}

function createFileEvaluationsTable(fileEvaluations) {
  const tbody = document.getElementById('file-evaluations-table-body');
  fileEvaluations.forEach((fileEvaluation) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fileEvaluation.file}</td>
      <td>${fileEvaluation.competency}</td>
      <td>${fileEvaluation.effectiveness}</td>
      <td>${fileEvaluation.specificity}</td>
      <td>${fileEvaluation.averageScore.toFixed(2)}</td>
      <td>${fileEvaluation.validCode ? '✅' : '❌'}</td>
      <td>${fileEvaluation.unnecessaryChanges ? '⚠️' : 'No'}</td>
    `;
    const btn = document.createElement('button');
    const td = document.createElement('td');
    btn.innerText = '👁️';
    btn.onclick = () =>
      Swal.fire({
        title: 'Evaluation Detailed Notes',
        text: fileEvaluation.detailedNotes,
        draggable: true,
      });
    td.appendChild(btn);
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
}

function createErrorsList(errors) {
  const list = document.getElementById('file-evaluations-errors-list');
  list.innerHTML = '';
  errors.forEach((error) => {
    const li = document.createElement('li');
    li.innerText = error;
    list.appendChild(li);
  });
}

function createCard(title, value) {
  const container = document.createElement('div');
  const span = document.createElement('span');
  span.innerText = title;
  container.appendChild(span);
  const h2 = document.createElement('h2');
  h2.innerText = value;
  container.appendChild(h2);
  return container;
}
