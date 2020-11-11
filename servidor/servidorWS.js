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
		        //var usr = new modelo.Usuario(nick);
                var codigo = juego.crearPartida(numero, nick);
                socket.join(codigo);
		       	cli.enviarRemitente(socket, "partidaCreada", {"codigo": codigo, "owner": nick});
            });
            
            socket.on('unirAPartida', function(codigo, nick) {
                // puede llegar un nick o codigo nulo
                console.log('usuario: ' + nick + ' se ha unido a la partida: ' + codigo)
                var res = juego.unirAPartida(codigo, nick);
                socket.join(codigo); // aislamos al cliente en la partida
                var owner = juego.partidas[codigo].nickOwner;
                cli.enviarRemitente(socket, "unidoAPartida", {"codigo": codigo, "owner": owner});
                cli.enviarATodosMenosRemitente(socket, codigo, "nuevoJugador", nick);
            });

            socket.on('iniciarPartida', function(nick, codigo) {
                juego.iniciarPartida(nick, codigo);
                var fase = juego.partidas[codigo].fase;
                cli.enviarATodos(io, codigo, "partidaIniciar", fase);
            });

            socket.on('listaPartidasDisponibles', function() {
                var lista = juego.listaPartidasDisponibles();
                cli.enviarRemitente(socket, "recibirListaPartidasDisponibles", lista);
            });

            socket.on('listaPartidas', function() {
                var lista = juego.listaPartidas();
                cli.enviarRemitente(socket, "recibirListaPartidas", lista);
            });

            socket.on('iniciarVotacion', function(nick, codigo) {
                juego.iniciarVotacion(nick, codigo);
                var fase = juego.partidas[codigo].fase;
                cli.enviarATodos(io, codigo, 'votacionLanzada', fase);
            });

            socket.on('votarSkip', function(nick, codigo) {
                var partida = juego.partidas[codigo];
                juego.votarSkip(nick, codigo);

                if(partida.hanVotadoTodos()) {
                    //partida.finalizarVotacion();
                    var data = {"elegido": partida.elegido, "fase": partida.fase};
                    // enviar a todos el más votado
                    cli.enviarATodos(io, codigo, 'finalVotacion', data);
                }
                else {
                    // enviar la lista de los que han votado
                    cli.enviarATodos(io, codigo, 'haVotado', partida.listaHanVotado());
                }
            });

            socket.on('votar', function(nick, codigo, sospechoso) {
                var partida = juego.partidas[codigo];
                juego.votar(nick, codigo, sospechoso);

                if(partida.hanVotadoTodos()) {
                    //partida.finalizarVotacion();
                    var data = {"elegido": partida.elegido, "fase": partida.fase};
                    // enviar a todos el más votado
                    cli.enviarATodos(io, codigo, 'finalVotacion', data);
                }
                else {
                    // enviar la lista de los que han votado
                    cli.enviarATodos(io, codigo, 'haVotado', partida.listaHanVotado());
                }
            });

            socket.on('obtenerEncargo', function(nick, codigo) {
                var res = juego.obtenerEncargo(nick, codigo);
                cli.enviarRemitente(socket, "recibirEncargo", res);
            });
		});
    }
}

module.exports.ServidorWS = ServidorWS;