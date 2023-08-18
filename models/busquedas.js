const fs = require("fs");

const axios = require("axios");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    //TODO: leer BD si existe
    this.leerDB();
  }

  get historialCapitalizado() {
    //Cada inicial en mayuscula

    return this.historial.map((lugar) => {
      let palabra = lugar.split(" ");
      palabra = palabra.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabra.join(" ");
    });
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  get paramsWeather() {
    return {
      lang: "es",
      units: "metric",
      appid: process.env.OPENWEATHER_KEY,
    };
  }

  async ciudad(lugar = "") {
    try {
      //Peticion http
      const instace = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instace.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        name: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
      //retorna lugares
      //const resp = await axios.get(
      //  "https://api.mapbox.com/geocoding/v5/mapbox.places/madrid.json?limit=5&proximity=ip&types=poi%2Cregion%2Caddress%2Ccountry%2Cpostcode%2Cplace%2Cdistrict%2Cneighborhood%2Clocality&language=es&access_token=pk.eyJ1IjoiZGF2aWRkaWF6MDExMCIsImEiOiJjbGtraTV4OTEwNHhyM25yczRjYzNmemdpIn0.r7tIhM1WclLPdXOXcPVAAw"
      //);
    } catch (error) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      //intancia de axios
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWeather, lat, lon },
      });
      //resp.data
      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar = "") {
    //TODO: prevenir duplicados

    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.slice(0, 5);

    this.historial.unshift(lugar.toLocaleLowerCase());

    //Guardar DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    //guardando la informacion en un archivo json y no un
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }
  //Leer base de datos
  leerDB() {
    if (!fs.existsSync(this.dbPath)) {
      return;
    }
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = {
  Busquedas,
};
