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

let prev = {};
let worker = null;
document.getElementById('brute-force-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (worker !== null) {
    return;
  }

  const table = document.getElementById('search-results');

  const inputTable = {};
  const maxSteps = {};
  const thead = table.tHead.rows[0];
  const tbody = table.tBodies[0];
  const info = document.getElementById('new-chain-info');

  // Reset table
  thead.innerHTML = '';
  thead.appendChild(document.createElement('th')); // First cell is empty (diagonal)
  while (tbody.rows.length > 0) {
    tbody.deleteRow(-1);
  }

  worker = new Worker('./worker.js');
  worker.onmessage = (e) => {
    if (!e.data) {
      info.innerHTML = "";
      console.log(maxSteps);
      return;
    }

    const {x, y, input, numSteps} = e.data;
    input[0] = Object.setPrototypeOf(input[0], Rational.prototype);
    input[1] = Object.setPrototypeOf(input[1], Rational.prototype);
    inputTable[input.toString()] = { numSteps, x, y, };

    // Check if input is worst-case for the number of steps
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

    const cell = row.cells[1 + x];
    cell.textContent = numSteps;

    // Get inputs after pivoting
    const prev = new Set();
    for (let i = 0; i < 2; i++) {
      if (!(input[i].isZero())) {
        prev.add(pivot(input, i));
      }
    }

    cell.addEventListener('click', (event) => {
      const arrows = [
        document.getElementById('arrow0'),
        document.getElementById('arrow1'),
      ];

      const entries = prev.entries();
      for (let i = 0; i < 2; i++) {
        arrows[i].style.opacity = 0;
      }

      let i = 0;
      for (const value of prev) {
        if (!(value in inputTable)) {
          continue;
        }

        const {x: prevX, y: prevY, numSteps: prevSteps} = inputTable[value];
        const prevCell = tbody.rows[1 + prevY].cells[1 + prevX];
        const prevRect = {
          min: {
            x: prevCell.offsetLeft,
            y: prevCell.offsetTop,
          },
          max: {
            x: prevCell.offsetLeft + prevCell.offsetWidth,
            y: prevCell.offsetTop + prevCell.offsetHeight,
          }
        };

        const prevPos = {
          x: 0.5 * (prevRect.min.x + prevRect.max.x),
          y: 0.5 * (prevRect.min.y + prevRect.max.y),
        };

        const inputRect = {
          min: {
            x: cell.offsetLeft,
            y: cell.offsetTop,
          },
          max: {
            x: cell.offsetLeft + cell.offsetWidth,
            y: cell.offsetTop + cell.offsetHeight,
          },
        };

        const inputPos = {
          x: 0.5 * (inputRect.min.x + inputRect.max.x),
          y: 0.5 * (inputRect.min.y + inputRect.max.y),
        };

        const minX = Math.min(inputRect.min.x, prevRect.min.x);
        const minY = Math.min(inputRect.min.y, prevRect.min.y);
        const maxX = Math.max(inputRect.max.x, prevRect.max.x);
        const maxY = Math.max(inputRect.max.y, prevRect.max.y);

        arrows[i].style.opacity = '1';
        arrows[i].style.left = minX + 'px';
        arrows[i].style.top = minY + 'px';
        arrows[i].width = maxX - minX;
        arrows[i].height = maxY - minY;

        console.log(minX, minY, maxX, maxY);

        const ctx = arrows[i].getContext('2d');
        ctx.lineWidth = 15;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(inputPos.x - minX, inputPos.y - minY);
        ctx.lineTo(prevPos.x - minX, prevPos.y - minY);
        ctx.stroke();
        ctx.clearRect(inputRect.min.x - minX, inputRect.min.y - minY, cell.offsetWidth, cell.offsetHeight);
        ctx.clearRect(prevRect.min.x - minX, prevRect.min.y - minY, prevCell.offsetWidth, prevCell.offsetHeight);

        i++;
      }
    });
  };

  const n = Math.floor(e.target.denom.value);
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
