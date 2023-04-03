const axios = require("axios");
const utils = require("./lib/fecr/utils.js");

const provinces = [
  {text: "San josé", value: "1"},
  {text: "Alajuera", value: "2"},
  {text: "Cartago", value: "3"},
  {text: "Heredia", value: "4"},
  {text: "Guanacaste", value: "5"},
  {text: "Puntarenas", value: "6"},
  {text: "Limon", value: "7"},
];

const conties = {
  1: [
    {text: "Central", value: "1"},
    {text: "Escazú", value: "2"},
    {text: "Desamparados", value: "3"},
    {text: "Puriscal", value: "4"},
    {text: "Tarrazú", value: "5"},
    {text: "Aserrí", value: "6"},
    {text: "Mora", value: "7"},
    {text: "Goicoechea", value: "8"},
    {text: "Santa Ana", value: "9"},
    {text: "Alajuelita", value: "10"},
    {text: "Vázquez De Coronado", value: "11"},
    {text: "Acosta", value: "12"},
    {text: "Tibás", value: "13"},
    {text: "Moravia", value: "14"},
    {text: "Montes De Oca", value: "15"},
    {text: "Turrubares", value: "16"},
    {text: "Dota", value: "17"},
    {text: "Curridabat", value: "18"},
    {text: "Pérez Zeledón", value: "19"},
    {text: "León Cortés Castro", value: "20"},
  ],
  2: [
    {text: "Central", value: "1"},
    {text: "San Ramón", value: "2"},
    {text: "Grecia", value: "3"},
    {text: "San Mateo", value: "4"},
    {text: "Atenas", value: "5"},
    {text: "Naranjo", value: "6"},
    {text: "Palmares", value: "7"},
    {text: "Poás", value: "8"},
    {text: "Orotina", value: "9"},
    {text: "San Carlos", value: "10"},
    {text: "Zarcero", value: "11"},
    {text: "Sarchí", value: "12"},
    {text: "Upala", value: "13"},
    {text: "Los Chiles", value: "14"},
    {text: "Guatuso", value: "15"},
    {text: "Río Cuarto", value: "16"},
  ],
  3: [
    {text: "Central", value: "1"},
    {text: "Paraíso", value: "2"},
    {text: "La Unión", value: "3"},
    {text: "Jiménez", value: "4"},
    {text: "Turrialba", value: "5"},
    {text: "Alvarado", value: "6"},
    {text: "Oreamuno", value: "7"},
    {text: "El Guarco", value: "8"},
  ],
  4: [
    {text: "Central", value: "1"},
    {text: "Barva", value: "2"},
    {text: "Santo Domingo", value: "3"},
    {text: "Santa Barbara", value: "4"},
    {text: "San Rafael", value: "5"},
    {text: "San Isidro", value: "6"},
    {text: "Belén", value: "7"},
    {text: "Flores", value: "8"},
    {text: "San Pablo", value: "9"},
    {text: "Sarapiquí", value: "10"},
  ],
  5: [
    {text: "Liberia", value: "1"},
    {text: "Nicoya", value: "2"},
    {text: "Santa Cruz", value: "3"},
    {text: "Bagaces", value: "4"},
    {text: "Carrillo", value: "5"},
    {text: "Cañas", value: "6"},
    {text: "Abangares", value: "7"},
    {text: "Tilarán", value: "8"},
    {text: "Nandayure", value: "9"},
    {text: "La Cruz", value: "10"},
    {text: "Hojancha", value: "11"},
  ],
  6: [
    {text: "Central", value: "1"},
    {text: "Esparza", value: "2"},
    {text: "Buenos Aires", value: "3"},
    {text: "Montes De Oro", value: "4"},
    {text: "Osa", value: "5"},
    {text: "Quepos", value: "6"},
    {text: "Golfito", value: "7"},
    {text: "Coto Brus", value: "8"},
    {text: "Parrita", value: "9"},
    {text: "Corredores", value: "10"},
    {text: "Garabito", value: "11"},
  ],
  7: [
    {text: "Central", value: "1"},
    {text: "Pococí", value: "2"},
    {text: "Siquirres", value: "3"},
    {text: "Talamanca", value: "4"},
    {text: "Matina", value: "5"},
    {text: "Guácimo", value: "6"},
  ],
};

provinces.forEach((province, i) => {
  conties[Number(province.value)].forEach(async (conty, i) => {
    const res = await axios.get("https://ubicaciones.paginasweb.cr/provincia/" + Number(province.value) + "/canton/" + Number(conty.value) + "/distritos.json");
    const items = Object.keys(res.data)
        .map((key) => ({text: res.data[key], value: key}));
    console.log(
        `${province.value}${utils.zfill(conty.value, 2)}: `,
        items,
        ",",
    );
  });
});
