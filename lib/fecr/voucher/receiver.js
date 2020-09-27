class Receiver {
  constructor(receiver) {
    this.name = receiver.name;
    this.idType = receiver.idType;
    this.id = receiver.id;
    if (receiver.foreignId) { this.foreignId = receiver.foreignId; }
    if (receiver.comercialName) { this.comercialName = receiver.comercialName; }
    if (receiver.location) {
      this.location = receiver.location;
      this.province = receiver.location.province;
      this.county = receiver.location.county;
      this.district = receiver.location.district;
      this.others = receiver.location.others;
    }
    if (receiver.foreignOthers) { this.foreignOthers = receiver.foreignOthers; }
    if (receiver.phone) { this.phone = receiver.phone; }
    if (receiver.fax) { this.fax = receiver.fax; }
    if (receiver.email) { this.email = receiver.email; }
  }

  generate() {
    const obj = {};
    obj.Nombre = this.name;
    obj.Identificacion = { Tipo: this.idType, Numero: this.id };
    if (this.foreignId) { obj.IdentificacionExtranjero = this.foreignId; }
    if (this.comercialName) { obj.NombreComercial = this.comercialName; }
    if (this.location) {
      obj.Ubicacion = {
        Provincia: this.province,
        Canton: this.county,
        Distrito: this.district,
        OtrasSenas: this.others,
      };
    }
    if (this.foreignOthers) { obj.OtrasSenasExtranjero = this.foreignOthers; }
    if (this.phone) { obj.Telefono = { CodigoPais: '506', NumTelefono: this.phone }; }
    if (this.fax) { obj.Fax = { CodigoPais: '506', NumTelefono: this.fax }; }
    if (this.email) { obj.CorreoElectronico = this.email; }
    return obj;
  }
}

module.exports = Receiver;
