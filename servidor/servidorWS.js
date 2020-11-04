var modelo = require('./modelo.js');

function ServidorWS() {
    this.enviarRemitente = function(socket, mens, datos) {
        socket.emit(mens, datos);
    }

    this.enviarATodos = function(io, nombre, mens, datos) { //nombre, habitación de clientes
        io.sockets.in(nombre).emit(mens, datos);
    }
    
    this.enviarATodosMenosRemitente = function(socket, nombre, mens, datos) {
        socket.broadcast.to(nombre).emit(mens, datos);
    };

    
    this.lanzarSocketSrv = function(io, juego) {
        var cli = this;
		io.on('connection', function(socket){ // socket, el cliente que le llega
		    socket.on('crearPartida', function(nick, numero) {
		        console.log('usuario: ' + nick + " crea partida numero: " + numero);
		        var usr = new modelo.Usuario(nick);
                var codigo = juego.crearPartida(numero, usr);
                socket.join(codigo);
		       	cli.enviarRemitente(socket, "partidaCreada", {"codigo": codigo, "owner": nick});
            });
            
            socket.on('unirAPartida', function(codigo, nick) {
                // puede llegar un nick o codigo nulo
                console.log('usuario: ' + nick + ' se ha unido a la partida: ' + codigo)
                var res = juego.unirAPartida(codigo, nick);
                socket.join(codigo); // aislamos al cliente en la partida
                var owner = juego.partidas[codigo].nickOwner;
                cli.enviarRemitente(socket, "unidoAPartida", {"codigo": codigo, "owner": owner})
                cli.enviarATodosMenosRemitente(socket, codigo, "nuevoJugador", nick)
            });

            socket.on('iniciarPartida', function(nick, codigo) {
                // ToDo
                // controlar si nick es el owner en modelo.js
                // contestar a todos
                var fase = juego.partidas[codigo].fase;
                cli.enviarATodos(socket, codigo, "partidaIniciar", fase);
            });
		});
    }
}

module.exports.ServidorWS = ServidorWS;