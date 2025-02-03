function selectPivot(xs) {
  let l = null;

  // Select the minimum fractional index
  for (let i = 0; i < xs.length; i++) {
    let f = xs[i].frac();
    if (f.isZero()) {
      continue;
    }

    if (l === null || f.lt(xs[l].frac())) {
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
      ys[i] = xs[i].div(xs[l]).frac();
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

function* fareySequence(n) {
  let a = 0, b = 1, c = 1, d = n;

  yield new Rational(a, b);

  while (c <= n) {
    yield new Rational(c, d);

    let k = Math.floor((n + b) / d);
    let nextC = k * c - a;
    let nextD = k * d - b;

    a = c;
    b = d;
    c = nextC;
    d = nextD;
  }
}
