importScripts('./rational.js');
importScripts('./euclid.js');

onmessage = (e) => {
  let chains = {};
  const n = e.data;
  let y = 0;
  for (const x1 of fareySequence(n)) {
    let x = 0;
    for (const x2 of fareySequence(n)) {
      let xs = [x1, x2];
      let chain = backtrack(xs, chains);
      postMessage({x, y, chain});

      x++;
    }

    y++;
  }

  postMessage(null);
};
