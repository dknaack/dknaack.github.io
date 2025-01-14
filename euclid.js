function selectPivot(xs) {
  let l = null;

  // Select the minimum fractional index
  for (let i = 0; i < xs.length; i++) {
    let f = xs[i].frac();
    if (f.isZero()) {
      continue;
    }

    if (l === null || xs[l].frac().lt(f)) {
      l = i;
    }
  }

  return l;
}

function pivot(xs, l) {
  if (l == null) {
    l = selectPivot(xs);
  }

  if (l == null) {
    return xs;
  }

  let ys = new Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    if (i == l) {
      ys[i] = xs[i].inv().frac();
    } else {
      ys[i] = xs[i].neg().div(xs[l]).frac();
    }
  }

  return ys;
}

function update(xs) {
  let result = [];

  while (!xs.every(x => x.frac().isZero())) {
    let l = selectPivot(xs);
    result.push({pivot: l, values: xs});
    let ys = pivot(xs, l);
    xs = ys;
  }

  result.push({pivot: null, values: xs});
  return result;
}

function backtrack(xs, mem) {
  const key = xs.toString();
  if (key in mem) {
    return mem[xs];
  } else {
    mem[key] = [];
    const ys = pivot(xs);
    const chain = backtrack(ys, mem);
    return mem[key] = [xs, ...chain];
  }
}

