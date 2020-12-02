function ClienteWS() {
    this.socket = undefined;
    this.nick = undefined;
    this.codigo = undefined;
    this.owner = false;
    this.numJugador = undefined;
    
    this.ini = function() {
    	this.socket = io.connect();
    	this.lanzarSocketSrv();
    }

    this.crearPartida = function(nick, numero) {
        this.nick = nick;
        this.socket.emit("crearPartida", nick, numero); // crearPartida, es un mensaje, tiene que ser igual que el del servidor
        //this.socket.emit("crearPartida", {"nick": nick, "numero": numero});
    }

    this.unirAPartida = function(nick, codigo) {
        //this.nick = nick;
        this.socket.emit("unirAPartida", nick, codigo); // unirAPartida, es un mensaje, tiene que ser igual que el del servidor
    }

    this.iniciarPartida = function() {
        this.socket.emit("iniciarPartida", this.nick, this.codigo) //, nick, codigo);
    }

    this.listaPartidasDisponibles = function() {
        this.socket.emit("listaPartidasDisponibles");
    }
    
    this.listaPartidas = function() {
        this.socket.emit("listaPartidas");
    }

    this.listaJugadores = function() {
        this.socket.emit("listaJugadores", this.codigo);
    }

    this.atacar = function(victima) {
        this.socket.emit("atacar", this.nick, this.codigo, victima);
    }

    this.iniciarVotacion = function() {
        this.socket.emit("iniciarVotacion", this.nick, this.codigo);
    }

    this.votar = function(sospechoso) {
        this.socket.emit("votar", this.nick, this.codigo, sospechoso);
    }

    this.votarSkip = function() {
        this.socket.emit("votarSkip", this.nick, this.codigo);
    }

    this.abandonarPartida = function() {
    }

    this.obtenerEncargo = function() {
        this.socket.emit("obtenerEncargo", this.nick, this.codigo);
    }

    this.estoyDentro = function() {
        this.socket.emit("estoyDentro", this.nick, this.codigo);
    }

    this.movimiento = function(direccion) {
        this.socket.emit("movimiento", this.nick, this.codigo, this.numJugador, direccion);
    }
	

    // servidor WS dentro del cliente
    this.lanzarSocketSrv = function() {
        var cli = this;

        this.socket.on('connect', function() { // Respuesta al connect()	
		    console.log("conectado al servidor de Ws");
        });
        
        this.socket.on('partidaCreada', function(data) { //data, es el código que se devuelve
            //console.log("codigo partida:" + data.codigo);
            //console.log("propietario:" + data.owner);
            cli.codigo = data.codigo;
            console.log(data);
            if(data.codigo != "fallo") {
                cli.owner = true;
                cli.numJugador = 0;
                cw.mostrarEsperandoRival();
            }

            //pruebasWS(codigo);
        });

        this.socket.on('unidoAPartida', function(data) {
            cli.codigo = data.codigo;
            cli.nick = data.nickJugador;
            cli.numJugador = data.numJugador;
            console.log(data);
            
            if(data.nickJugador != "fallo" && data.codigo != null) {
                cw.mostrarEsperandoRival();
            }
            
        });

        this.socket.on('nuevoJugador', function(nick) {
            console.log(nick + " se une a la partida");
            cw.mostrarAvisoNuevoJugador(nick);
        });

        this.socket.on('esperando', function(fase) {
            console.log('esperando: ' + fase); // no se imprime
        });

        this.socket.on('partidaIniciada', function(fase) {
            cli.obtenerEncargo();
            console.log("Partida en fase: " + fase); // no se imprime
            lanzarJuego();
        });

        this.socket.on('recibirListaPartidasDisponibles', function(lista) {
            console.log(lista);
            if(!cli.codigo) { // ni se ha unido, ni ha creado partida, codigo = undefined
                cw.mostrarUnirAPartida(lista);
            }
            
        });

        this.socket.on('recibirListaPartidas', function(lista) {
            console.log(lista);
        });

        this.socket.on('recibirListaJugadores', function(lista) {
            console.log(lista);
            //cw.mostrarEsperandoRival(lista);
            // Parecido a la lista de partidas
            // llamar a: cw.mostrarListaJugadores(lista);
        });

        this.socket.on('hasAtacado', function(data) {
            console.log(data);
        });

        this.socket.on('votacionLanzada', function(data) {
            console.log(data);
        });

        this.socket.on('finalVotacion', function(data) {
            console.log(data);
        });

        this.socket.on('haVotado', function(data) {
            console.log(data);
        });

        this.socket.on('recibirEncargo', function(data) {
            console.log(data);
        });

        this.socket.on('dibujarRemoto', function(lista) {
            console.log(lista);
            for(var i=0; i<lista.length; i++) {
                if(lista[i].nick!=cli.nick) {
                    lanzarJugadorRemoto(lista[i].nick, lista[i].numJugador);
                }
            }
            
        });

        this.socket.on('moverRemoto', function(datos) {
            moverRemoto(datos.direccion, datos.nick, datos.numJugador);
        });
    }

    this.ini();

}

var ws, ws2, ws3, ws4
function pruebasWS(/*codigo*/) {
    ws = new ClienteWS();
    ws2 = new ClienteWS();
    ws3 = new ClienteWS();
    ws4 = new ClienteWS();
    var codigo = ws.codigo;

    ws2.unirAPartida("Juani", codigo);
    ws3.unirAPartida("Juana", codigo);
    ws4.unirAPartida("Juanan", codigo);

    ws.iniciarPartida();
}