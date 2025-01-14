importScripts('rational.js');
importScripts('euclid.js');

onmessage = (e) => {
  let chains = {};
  const [max1, max2] = e.data;
  for (let denom1 = 2; denom1 < max1; denom1++) {
    for (let denom2 = 2; denom2 < max2; denom2++) {
      for (let num1 = 1; num1 < denom1; num1++) {
        for (let num2 = 1; num2 < denom2; num2++) {
          let xs = [new Rational(num1, denom1), new Rational(num2, denom2)];
          let chain = backtrack(xs, chains);
          postMessage(chain);
        }
      }
    }
  }

  postMessage(null);
};
