var modelo = require('./modelo.js');

function ServidorWS() {
    this.enviarRemitente = function(socket, mens, datos) {
        socket.emit(mens, datos);
    }

    this.enviarATodos = function(io, nombre, mens, datos) { //nombre, habitación de clientes
        io.sockets.in(nombre).emit(mens, datos);
    }
    
    this.enviarATodosMenosRemitente = function(socket, nombre, mens, datos) {
        socket.broadcast.to(nombre).emit(mens, datos); // nombre es la habitación
    }

    this.enviarGlobal = function(socket, mens, datos) { // antes de unirte a ninguna partida
        socket.broadcast.emit(mens, datos);
    }

    
    
    this.lanzarSocketSrv = function(io, juego) {
        var cli = this;
		io.on('connection', function(socket){ // socket, el cliente que le llega
		    socket.on('crearPartida', function(nick, numero) {
		        console.log('usuario: ' + nick + " crea partida numero: " + numero);
		        //var usr = new modelo.Usuario(nick);
                var codigo = juego.crearPartida(numero, nick);
                socket.join(codigo);
                cli.enviarRemitente(socket, "partidaCreada", {"codigo": codigo, "owner": nick});
                // enviar a todos los clientes la lista de partidas
                var lista = juego.listaPartidasDisponibles();
                cli.enviarGlobal(socket, "recibirListaPartidasDisponibles", lista);
            });
            
            socket.on('unirAPartida', function(nick, codigo) {
                // puede llegar un nick o codigo nulo
                var nickJugador = juego.unirAPartida(codigo, nick);
                console.log('usuario: ' + nickJugador + ' se ha unido a la partida: ' + codigo)
                socket.join(codigo); // aislamos al cliente en la partida
                var owner = juego.obtenerOwner(codigo);
                var numJugador = juego.partidas[codigo].usuarios[nickJugador].numJugador;
                cli.enviarRemitente(socket, "unidoAPartida", {"codigo": codigo, "owner": owner, "nickJugador": nickJugador, "numJugador": numJugador});
                cli.enviarATodosMenosRemitente(socket, codigo, "nuevoJugador", nickJugador);
            });

            socket.on('iniciarPartida', function(nick, codigo) {
                juego.iniciarPartida(nick, codigo);
                var fase = juego.partidas[codigo].fase;
                if (fase.esJugando()) {
                    cli.enviarATodos(io, codigo, "partidaIniciada", fase.nombre);
                }
                else {
                    cli.enviarRemitente(socket, "esperando", fase.nombre);
                }
            });

            socket.on('listaPartidasDisponibles', function() {
                var lista = juego.listaPartidasDisponibles();
                cli.enviarRemitente(socket, "recibirListaPartidasDisponibles", lista);
            });

            socket.on('listaPartidas', function() {
                var lista = juego.listaPartidas();
                cli.enviarRemitente(socket, "recibirListaPartidas", lista);
            });

            socket.on('listaJugadores', function(codigo) {
                var lista = juego.listaJugadores(codigo);
                cli.enviarRemitente(socket, "recibirListaJugadores", lista);
            });

            socket.on('atacar', function(nick, codigo, victima) {
                var victima = juego.atacar(nick, codigo, victima);
                var partida = juego.partidas[codigo];
                var fase = partida.fase.nombre;
                cli.enviarATodos(io, codigo, 'muereInocente', victima);
                cli.enviarRemitente(socket, 'hasAtacado', fase);
                if(fase == "final") {
                    cli.enviarATodos(io, codigo, 'final', "Ganan los impostores.");
                }
                
            });

            socket.on('iniciarVotacion', function(nick, codigo) {
                var puedeIniciarVotacion = juego.iniciarVotacion(nick, codigo);
                if(puedeIniciarVotacion) {
                    var partida = juego.partidas[codigo];
                    var lista = partida.obtenerListaJugadoresVivos();
                    cli.enviarATodos(io, codigo, 'votacionLanzada', lista);
                }
            });

            socket.on('votarSkip', function(nick, codigo) {
                var partida = juego.partidas[codigo];
                juego.votarSkip(nick, codigo);

                if(partida.hanVotadoTodos()) {
                    // mensajeVotacion, elegido (obj Usuario), finalPartida (booleano), mensajeEstadoPartida
                    var resultado = partida.finalizarVotacion();
                    
                    var elegido = resultado.elegido; // elegido es un obj Usuario
                    var mensajeVotacion = resultado.mensajeVotacion;
                    var mensajeEstadoPartida = resultado.mensajeEstadoPartida;
                    var finalPartida = resultado.finalPartida;
                    var mensaje = mensajeVotacion + " " + mensajeEstadoPartida;
                    
                    var data = {"elegido": elegido, "fase": partida.fase.nombre, "mensaje": mensaje, "finalPartida": finalPartida};
                    // enviar a todos el más votado y la fase
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
                    // mensajeVotacion, elegido (obj Usuario), finalPartida (booleano), mensajeEstadoPartida
                    var resultado = partida.finalizarVotacion();
                    
                    var elegido = resultado.elegido; // elegido es un obj Usuario
                    var mensajeVotacion = resultado.mensajeVotacion;
                    var mensajeEstadoPartida = resultado.mensajeEstadoPartida;
                    var finalPartida = resultado.finalPartida;
                    var mensaje = mensajeVotacion + " " + mensajeEstadoPartida;
                    
                    var data = {"elegido": elegido, "fase": partida.fase.nombre, "mensaje": mensaje, "finalPartida": finalPartida};
                    
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

            socket.on('estoyDentro', function(nick, codigo) {
                //var usr = juego.obtenerJugador(nick, codigo);
                /* var num = juego.partidas[codigo].usuarios[nick].numJugador;
                var datos = {nick: nick, numJugador: num};
                cli.enviarATodosMenosRemitente(socket, codigo, "dibujarRemoto", datos); */
                var lista = juego.listaJugadores(codigo);
                cli.enviarRemitente(socket, "dibujarRemoto", lista);
            });

            socket.on('movimiento', function(datos) {
                cli.enviarATodosMenosRemitente(socket, datos.codigo, "moverRemoto", datos);
            });

            socket.on('realizarTarea', function(datos) {
                var nick = datos.nick;
                var codigo = datos.codigo;
                var partida = juego.partidas[codigo];
                juego.realizarTarea(datos);
                var fasePartida = juego.getEstadoPartida(codigo); // el objeto
                var percent = partida.obtenerPercentTarea(nick);
                var global = partida.obtenerPercentGlobal();
                cli.enviarRemitente(socket, "tareaRealizada", {"percent": percent, "global": global});
                //cli.enviarRemitente(/* fasePartida? */);
                if(fasePartida.esFinal()) {
                    cli.enviarATodos(io, codigo, "final", "Ganan los tripulates");
                }
                
            });
		});
    }
}

module.exports.ServidorWS = ServidorWS;