importScripts('./rational.js');
importScripts('./euclid.js');

function backtrack(xs, mem) {
  const key = xs.toString();
  if (!(key in mem)) {
    const ys = pivot(xs);
    mem[key] = 1; // avoid infinite recursion
    mem[key] += backtrack(ys, mem);
  }

  return mem[key];
}

onmessage = (e) => {
  let chains = {};
  const n = e.data;
  let y = 0;
  for (const x1 of fareySequence(n)) {
    let x = 0;
    for (const x2 of fareySequence(n)) {
      const input = [x1, x2];
      const numSteps = backtrack(input, chains);
      postMessage({x, y, input, numSteps});

      x++;
    }

    y++;
  }

  // send null when finished
  postMessage(null);
};
