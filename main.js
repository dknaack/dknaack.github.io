function parse(input) {
  let words = input.split(',');
  let result = Array(words.length);
  for (let i = 0; i < words.length; i++) {
    let parts = words[i].split('/');
    if (parts.length == 1) {
      result[i] = new Rational(+parts[0].trim());
    } else {
      result[i] = new Rational(+parts[0].trim(), +parts[1].trim());
    }
  }

  return result;
}

function cost(input) {
  return Math.max(...input.map(x => x.denom));
}

const resultDiv = document.getElementById('results');

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  let query = e.target.query.value;
  let input = parse(query);
  let result = update(input);

  let table = document.createElement('table');

  const header = table.createTHead();
  const tr = header.insertRow();
  for (let j = 0; j <= result[0].values.length; j++) {
    const td = tr.insertCell();
    if (j == 0) {
      td.innerHTML = 'n';
    } else if (j <= result[0].values.length) {
      td.innerHTML = `x<sub>${j}</sub>`;
    }
  }

  const body = table.createTBody();
  for (let i = 0; i < result.length; i++) {
    const tr = body.insertRow();

    const td = tr.insertCell();
    td.appendChild(document.createTextNode(i + '.'));

    let pivot = result[i].pivot;
    for (let j = 0; j < result[i].values.length; j++) {
      const td = tr.insertCell();
      if (j == pivot) {
        td.className = 'pivot';
      }

      td.innerHTML = result[i].values[j].toHTML() + ' = ' + Math.round(result[i].values[j].toFloat() * 100) / 100;
    }
  }

  resultDiv.replaceChildren(table);
});

let worker = null;

document.getElementById('brute-force-form').addEventListener('submit', (e) => {
  e.preventDefault();

  if (worker !== null) {
    return;
  }
  let bestInput = {};
  worker = new Worker('./brute-force.js');

  const numRows = e.target.denom1.value;
  const numCols = e.target.denom2.value;

  const table = document.getElementById('search-results');
  table.innerHTML = '';

  const thead = table.createTHead();
  const tr = thead.insertRow();
  tr.insertCell();
  for (let j = 2; j < numCols; j++) {
    const td = tr.insertCell();
    td.textContent = j.toString();
  }

  const cells = Array(numRows);
  const tbody = table.createTBody();
  for (let i = 0; i < numRows - 2; i++) {
    const tr = tbody.insertRow();
    cells[i] = Array(numCols);

    tr.insertCell().textContent = (i + 2).toString();
    for (let j = 0; j < numCols - 2; j++) {
      cells[i][j] = tr.insertCell();
    }
  }

  const info = document.getElementById('new-chain-info');
  worker.onmessage = (e) => {
    if (!e.data) {
      info.innerHTML = "";
      for (const cost in bestInput) {
        const inputs = bestInput[cost];
        for (const [a, b] of inputs.slice(0, 2)) {
          info.innerHTML += `${cost}: ${a.num}/${a.denom}, ${b.num}/${b.denom}, `;
        }
      }

      return;
    }

    const chain = e.data;
    info.innerHTML = chain.map(values => {
      let valueStrings = values.map(x => Rational.prototype.toString.call(x));
      return '(' + valueStrings.join(', ') + ')';
    }).join(' &rarr; ');

    let isOptimal = false;
    let otherInputs = [];

    const input = chain[0];
    const inputCost = cost(input);
    const numSteps = chain.length;
    if (numSteps in bestInput) {
      otherInputs = bestInput[numSteps];
      const otherCost = cost(otherInputs[0]);
      const inputCost = cost(input);
      if (inputCost < otherCost) {
        bestInput[numSteps] = [input];
        isOptimal = true;
      } else if (inputCost == otherCost) {
        bestInput[numSteps].push(input);
        isOptimal = true;
      }
    } else {
      bestInput[numSteps] = [input];
      isOptimal = true;
    }

    if (isOptimal) {
      for (const input of otherInputs) {
        const cell = cells[input[0].denom - 2][input[1].denom - 2];
        cell.classList.remove('optimal');
      }

      const cell = cells[input[0].denom - 2][input[1].denom - 2];
      cell.textContent = `${input[0].num}/${input[0].denom}, ${input[1].num}/${input[1].denom}`;
      cell.classList.add('optimal');
    }
  };

  worker.postMessage([numRows, numCols]);
});

document.getElementById('brute-force-stop').addEventListener('click', (e) => {
  e.preventDefault();

  if (worker === null) {
    return;
  }

  worker.terminate();
  worker = null;
});
