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

const resultDiv = document.getElementById('results');

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  let query = e.target.query.value;
  let input = parse(query);
  let result = update(input);

  let table = document.createElement('table');

  const header = table.createTHead();
  const tr = header.insertRow();
  for (let j = 0; j <= result[0].values.length + 1; j++) {
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
    td.appendChild(document.createTextNode((i + 1) + '.'));

    let pivot = result[i].pivot;
    for (let j = 0; j < result[i].values.length; j++) {
      const td = tr.insertCell();
      if (j == pivot) {
        td.className = 'pivot';
      }

      td.innerHTML = result[i].values[j].toHTML();
    }

    tr.insertCell();
  }

  resultDiv.replaceChildren(table);
});

let worker = null;
let bestInput = {};

document.getElementById('brute-force-form').addEventListener('submit', (e) => {
  e.preventDefault();

  if (worker === null) {
    worker = new Worker('/brute-force.js');

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
    tr.insertCell();

    const cells = Array(numRows);
    const tbody = table.createTBody();
    for (let i = 0; i < numRows - 2; i++) {
      const tr = tbody.insertRow();
      cells[i] = Array(numCols);

      tr.insertCell().textContent = (i + 2).toString();
      for (let j = 0; j < numCols - 2; j++) {
        cells[i][j] = tr.insertCell();
      }
      tr.insertCell();
    }

    const newChainInfo = document.getElementById('new-chain-info');
    worker.onmessage = (e) => {
      if (!e.data) {
        return;
      }

      const chain = e.data;
      newChainInfo.innerHTML = chain.map(values => {
        let valueStrings = values.map(x => Rational.prototype.toString.call(x));
        return '(' + valueStrings.join(', ') + ')';
      }).join(' &rarr; ');

      const input = chain[0];
      const x = input[0].denom;
      const y = input[1].denom;
      const cell = cells[y - 2][x - 2];

      let value = cell.textContent;
      if (!value) {
        value = chain.length;
      } else if (+cell.textContent > chain.length) {
        if (cell.classList.contains('optimal')) {
          cell.classList.remove('optimal');
          delete bestInput[value];
        }

        value = chain.length;
      }

      cell.textContent = value;

      // Update the number of steps per the input size/cost
      const cost = Math.max(x, y);
      if (value in bestInput) {
        const [otherX, otherY] = bestInput[value];
        const otherCost = Math.max(otherX, otherY);
        if (otherCost > cost) {
          const otherCell = cells[otherY - 2][otherX - 2];
          otherCell.classList.remove('optimal');
          bestInput[value] = [x, y];
          cell.classList.add('optimal');
        }
      } else {
        bestInput[value] = [x, y];
        cell.classList.add('optimal');
      }
    };

    worker.postMessage([numRows, numCols]);
  }
});

document.getElementById('brute-force-stop').addEventListener('click', (e) => {
  if (worker !== null) {
    worker.terminate();
    worker = null;
  }
});
