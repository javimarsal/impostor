function ClienteRest() {
  this.crearPartida = function(nick, num, callback) {
		$.getJSON("/crearPartida/" + nick + "/" + num, function(data) {
      console.log(data);
      callback(data); // podría ser los métodos de la función pruebas()
		});
  }
    
  this.unirAPartida = function(codigo, nick) {
    $.getJSON("/unirAPartida/" + codigo + "/" + nick, function(data) {    
    	console.log(data);
		});
  }

  this.listaPartidas = function() {
    $.getJSON("/listaPartidas", function(lista) {    
      console.log(lista);
    });
  }

  this.iniciarPartida = function(codigo, nick) {
    $.getJSON("/iniciarPartida/" + codigo + "/" + nick, function(data) {    
      console.log(data);
    });
  }

}

// Arreglar lo que devuelve cuando se unen
function pruebas(){
  var codigo = undefined;
	rest.crearPartida("pepe", 3, function(data) {
    codigo = data.codigo;		
  });
  
	rest.crearPartida("pepe", 4, function(data) {
		codigo = data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
		rest.unirAPartida("juanma",codigo);
  });
  
	rest.crearPartida("pepe", 5, function(data) {
		codigo = data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
		rest.unirAPartida("juanma",codigo);
  });
  
  rest.crearPartida("pepe", 6, function(data) {
		codigo = data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juaaannn", codigo);
  });
  
  rest.crearPartida("pepe", 7, function(data) {
		codigo = data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
		rest.unirAPartida("juanma",codigo);
  });
  
  rest.crearPartida("pepe", 8, function(data) {
		codigo = data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
  });
  
  rest.crearPartida("pepe", 9, function(data) {
		codigo = data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
  });

  rest.crearPartida("pepe", 10, function(data) {
		codigo = data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
    rest.unirAPartida("juanma",codigo);
  });

//agregar otras partidas de 6, 7… hasta 10 jugadores
}
