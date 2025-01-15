class Rational {
  constructor(num, denom = 1) {
    num = Math.floor(num);
    denom = Math.floor(denom);

    if (denom < 0) {
      denom = -denom;
      num = -num;
    }

    if (num == -0) {
      num = 0;
    }

    let common = gcd(Math.abs(num), denom);
    this.num = num / common;
    this.denom = denom / common;
  }

  static zero = new Rational(0, 1);
  static one  = new Rational(1, 1);

  add(other) {
    if (other instanceof Rational) {
      let num = this.num * other.denom + other.num * this.denom;
      let denom = this.denom * other.denom;
      return new Rational(num, denom);
    } else {
      return new Rational(this.num + other * this.denom, this.denom);
    }
  }

  neg() {
    return new Rational(-this.num, this.denom);
  }

  sub(other) {
    if (other instanceof Rational) {
      return this.add(other.neg());
    } else {
      return this.add(new Rational(-other));
    }
  }

  mul(other) {
    if (other instanceof Rational) {
      return new Rational(this.num * other.num, this.denom * other.denom);
    } else {
      return new Rational(this.num * other, this.denom);
    }
  }

  inv() {
    return new Rational(this.denom, this.num);
  }

  div(other) {
    if (other instanceof Rational) {
      return new Rational(this.num * other.denom, this.denom * other.num);
    } else {
      return new Rational(this.num, this.denom * other);
    }
  }

  gt(other) {
    return this.num * other.denom > other.num * this.denom;
  }

  lt(other) {
    return this.num * other.denom < other.num * this.denom;
  }

  geq(other) {
    return this.num * other.denom >= other.num * this.denom;
  }

  leq(other) {
    return this.num * other.denom <= other.num * this.denom;
  }

  equals(other) {
    return this.num * other.denom === other.num * this.denom;
  }

  isZero() {
    return this.equals(Rational.zero);
  }

  frac() {
    let num = this.num % this.denom;
    if (num < 0) {
      num += this.denom;
    }

    return new Rational(num, this.denom);
  }

  toString() {
    if (this.denom === 1) {
      return `${this.num}`;
    } else {
      return `${this.num}/${this.denom}`;
    }
  }

  toHTML() {
    if (this.denom === 1) {
      return `<span class="fraction">${this.num}</span>`;
    } else {
      return `<span class="fraction"><sup>${this.num}</sup>&frasl;<sub>${this.denom}</sub></span>`;
    }
  }

  toFloat() {
    return this.num / this.denom;
  }
}

function gcd(a, b) {
  if (isNaN(a) || isNaN(b)) {
    throw new Error("Inputs must be valid numbers.");
  }

  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return Math.abs(a);
}
