class Others {
  constructor(others) {
    this.text = others.text;
  }

  generate() {
    const obj = {};
    obj.OtroTexto = this.text;
    return obj;
  }
}

module.exports = Others;
