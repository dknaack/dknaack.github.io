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

  const table = document.getElementById('search-results');
  table.innerHTML = '';

  const maxSteps = {};
  const thead = table.createTHead().insertRow();
  const tbody = table.createTBody();
  const info = document.getElementById('new-chain-info');
  thead.appendChild(document.createElement('th')); // First cell is empty (diagonal)

  worker = new Worker('./brute-force.js');
  worker.onmessage = (e) => {
    if (!e.data) {
      info.innerHTML = "";
      console.log(maxSteps);
      return;
    }

    const {x, y, chain} = e.data;
    const numSteps = chain.length;
    const input = [
      Object.setPrototypeOf(chain[0][0], Rational.prototype),
      Object.setPrototypeOf(chain[0][1], Rational.prototype),
    ];

    const inputCost = cost(input);
    let isOptimal = false;
    if (!(inputCost in maxSteps) || maxSteps[inputCost] < numSteps) {
      maxSteps[inputCost] = numSteps;
      isOptimal = true;
    }

    // insert enough rows in the table
    while (y >= tbody.rows.length) {
      tbody.insertRow();
    }

    // insert enough cells in the header
    while (x + 1 >= thead.cells.length) {
      const th = document.createElement('th');
      th.scope = 'col';
      thead.appendChild(th);
    }

    // insert the column header
    thead.cells[1 + x].innerHTML = input[1].toHTML();

    // insert the row header
    const row = tbody.rows[y];
    if (row.cells.length == 0) {
      const th = document.createElement('th');
      th.innerHTML = input[0].toHTML();
      th.scope = 'row';
      row.insertBefore(th, row.firstChild);
    }

    // insert enough cells in the current row
    while (x + 1 >= row.cells.length) {
      row.insertCell();
    }

    row.cells[1 + x].textContent = numSteps;
  };

  const n = Math.floor(e.target.denom.value);
  console.log(n);
  worker.postMessage(n);
});

document.getElementById('brute-force-stop').addEventListener('click', (e) => {
  e.preventDefault();

  if (worker === null) {
    return;
  }

  worker.terminate();
  worker = null;
});
