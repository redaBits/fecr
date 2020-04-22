module.exports = {
  round10(num, expr) {
    let value = num;
    let exp = expr;
    const type = 'round';
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (Number.isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(`${value[0]}e${value[1] ? (+value[1] - exp) : -exp}`));
    // Shift back
    value = value.toString().split('e');
    return +(`${value[0]}e${value[1] ? (+value[1] + exp) : exp}`);
  },
  zfill(number, width) {
    const numberOutput = Math.abs(number); /* Valor absoluto del número */
    const { length } = number.toString(); /* Largo del número */
    const zero = '0'; /* String de cero */

    if (width <= length) {
      if (number < 0) {
        return (`-${numberOutput.toString()}`);
      }
      return numberOutput.toString();
    }
    if (number < 0) {
      return (`-${zero.repeat(width - length)}${numberOutput.toString()}`);
    }
    return ((zero.repeat(width - length)) + numberOutput.toString());
  },
};
