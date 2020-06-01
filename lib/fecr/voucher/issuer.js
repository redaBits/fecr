class Issuer {
  constructor(issuer) {
    this.name = issuer.name;
    this.idType = issuer.idType;
    this.id = issuer.id;
    this.comercialName = issuer.comercialName;
    this.province = issuer.location.province;
    this.county = issuer.location.county;
    this.district = issuer.location.district;
    this.others = issuer.location.others;
    this.phone = issuer.phone;
    this.fax = issuer.fax;
    this.email = issuer.email;
  }

  generate() {
    const obj = {};
    obj.Nombre = this.name;
    obj.Identificacion = { Tipo: this.idType, Numero: this.id };
    if (this.comercialName) { obj.NombreComercial = this.comercialName; }
    obj.Ubicacion = {
      Provincia: this.province,
      Canton: this.county,
      Distrito:
      this.district,
      OtrasSenas: this.others,
    };
    obj.Telefono = {
      CodigoPais: '506',
      NumTelefono: this.phone,
    };
    if (this.fax) { obj.Fax = { CodigoPais: '506', NumTelefono: this.fax }; }
    obj.CorreoElectronico = this.email;
    return obj;
  }
}

module.exports = Issuer;
