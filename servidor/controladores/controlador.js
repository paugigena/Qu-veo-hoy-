var connection = require("../lib/conexionbd");

var mostrarPeliculas = function (req, res) {
  var anio = req.query.anio;
  var titulo = req.query.titulo;
  var genero = req.query.genero;
  var orden = req.query.columna_orden;
  var tipo_orden = req.query.tipo_orden;
  var query;
  var queryFilters = [];
  var queryFiltersDB = [];

  var pagina = req.query.pagina;
  var cantidad = req.query.cantidad;

  if (titulo) {
    queryFilters.push("titulo");
    queryFiltersDB.push(titulo);
  }
  if (genero) {
    queryFilters.push("genero_id");
    queryFiltersDB.push(genero);
  }
  if (anio) {
    queryFilters.push("anio");
    queryFiltersDB.push(anio);
  }

  switch (queryFilters.length) {
    case 0:
      queryFilters = "";
      break;
    case 1:
      queryFilters = `WHERE ${queryFilters[0]} like '%${queryFiltersDB[0]}%'`;
      break;
    case 2:
      queryFilters = `WHERE ${queryFilters[0]} like '%${queryFiltersDB[0]}%' AND ${queryFilters[1]} like '%${queryFiltersDB[1]}%'`;
      break;
    case 3:
      queryFilters = `WHERE ${queryFilters[0]} like '%${queryFiltersDB[0]}%' AND ${queryFilters[1]} like '%${queryFiltersDB[1]}%' AND ${queryFilters[2]} like '%${queryFiltersDB[2]}%'`;
      break;
  }

  query = `SELECT * FROM pelicula ${queryFilters} order by ${orden} ${tipo_orden} limit ${
    (pagina - 1) * cantidad
  },${cantidad}`;

  var query2 = `SELECT count(*) as cantidad FROM pelicula ${queryFilters}`;

  connection.query(query, function (error, results) {
    if (error) throw error;
    connection.query(query2, function (error, results2) {
      console.log(results2);
      if (error) throw error;
      var respuesta = { peliculas: results, total: results2[0].cantidad };
      res.send(JSON.stringify(respuesta));
    });
  });
};

function mostrarGenero(req, res) {
  var query = "SELECT * FROM genero";
  connection.query(query, function (error, results) {
    if (error) throw error;

    var respuesta = { generos: results };

    res.send(JSON.stringify(respuesta));
  });
}

function mostrarInformacion(req, res) {
  var idPelicula = req.params.id;
  var queryInfoPelicula = `SELECT pelicula.*, genero.nombre 
        FROM pelicula 
        LEFT JOIN genero ON (genero.id = pelicula.genero_id)
        WHERE pelicula.id =${idPelicula} `;
  var queryInfoActor = `SELECT actor_pelicula.*, actor.NOMBRE as nombre
        FROM actor_pelicula
        LEFT JOIN actor ON (actor.id = actor_pelicula.actor_id)
        WHERE pelicula_id = ${idPelicula} `;

  connection.query(queryInfoPelicula, function (error, results) {
    if (error) throw error;
    connection.query(queryInfoActor, function (error, results2) {
      if (error) throw error;
      var respuesta = {
        pelicula: results[0],
        actores: results2,
        genero: results,
      };
      res.send(JSON.stringify(respuesta));
    });
  });
}

function recomendarPelicula(req, res) {
  var genero = req.query.genero;
  var puntuacion = req.query.puntuacion;
  var anioInicio = req.query.anio_inicio;
  var anioFin = req.query.anio_fin;

  var query = `SELECT p.*, g.nombre FROM pelicula p LEFT JOIN genero g ON p.genero_id = g.id`;
  var queryAnios = `(anio BETWEEN  ${anioInicio} AND ${anioFin}) `;
  var queryGenero = `g.nombre = '${genero}' `;
  var queryPuntuacion = `puntuacion >= ${puntuacion} `;
  var queryFiltros;

  if (anioInicio && genero && !puntuacion) {
    queryFiltros = `WHERE ${queryAnios} AND ${queryGenero}`;
  } else if (puntuacion && genero && !anioInicio) {
    queryFiltros = `WHERE ${queryPuntuacion} AND ${queryGenero}`;
  } else if (genero && !anioInicio && !puntuacion) {
    queryFiltros = `WHERE ${queryGenero}`;
  } else if (puntuacion && !genero) {
    queryFiltros = `WHERE ${queryPuntuacion}`;
  } else if (anioInicio && !genero) {
    queryFiltros = `WHERE ${queryAnios}`;
  }

  var queryRecomendacion = `${query} ${queryFiltros}`;

  connection.query(queryRecomendacion, function (error, result) {
    if (error) {
      console.log("error!!", error);
      throw error;
    }

    var respuesta = {
      peliculas: result,
    };

    res.send(JSON.stringify(respuesta));
  });
}

module.exports = {
  mostrarPeliculas: mostrarPeliculas,
  mostrarGenero: mostrarGenero,
  mostrarInformacion: mostrarInformacion,
  recomendarPelicula: recomendarPelicula,
};
