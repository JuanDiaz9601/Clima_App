require("dotenv").config();

const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquirer");
const { Busquedas } = require("./models/busquedas");

const main = async () => {
  const busqueda = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        //mostrar mensaje para que el us escriba
        const termino = await leerInput("Ciudad: ");

        //buscar los lugares
        const lugares = await busqueda.ciudad(termino);
        //console.log(lugares);

        //Seleccionar lugar
        const id = await listarLugares(lugares);

        //si lo que retorna listarLugares es igual a cero nos muestra de nuevo el menu
        if (id === "0") {
          continue;
        }
        //Seleccionar lugar
        const lugarSel = lugares.find((l) => l.id === id);

        //Guardar en DB
        busqueda.agregarHistorial(lugarSel.name);

        //Clima
        const clima = await busqueda.climaLugar(lugarSel.lat, lugarSel.lng);

        //mostrar resultados
        console.clear();
        console.log("\nInformacion de la ciudad\n".green);
        console.log("Ciudad:", lugarSel.name.green);
        console.log("Lat:", lugarSel.lat);
        console.log("Lng:", lugarSel.lng);
        console.log("Temperetura:", clima.temp);
        console.log("Minima:", clima.min);
        console.log("Maxima:", clima.max);
        console.log("Como está el clima:", clima.desc.green);
        break;

      case 2:
        busqueda.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}`.green;
          console.log(`${idx} ${lugar}`);
        });

        break;
    }

    if (opt !== 0) {
      await pausa();
    }
  } while (opt !== 0);
};

main();
