function ClienteWS() {
    this.socket = undefined;
    this.nick = undefined;
    this.codigo = undefined;
    
    this.ini = function() {
    	this.socket = io.connect();
    	this.lanzarSocketSrv();
    }

    this.crearPartida = function(nick, numero) {
        this.nick = nick;
        this.socket.emit("crearPartida", nick, numero); // crearPartida, es un mensaje, tiene que ser igual que el del servidor
        //this.socket.emit("crearPartida", {"nick": nick, "numero": numero});
    }

    this.unirAPartida = function(codigo, nick) {
        //this.nick = nick;
        this.socket.emit("unirAPartida", codigo, nick); // unirAPartida, es un mensaje, tiene que ser igual que el del servidor
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

    this.atacar = function() {
        this.socket.emit("atacar", this.nick, this.codigo);
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
        this.socket.emit("obtenerEncargo", this.nick, this.codigo)
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
            //pruebasWS(codigo);
        });

        this.socket.on('unidoAPartida', function(data) {
            cli.codigo = data.codigo;
            cli.nick = data.nickJugador;
            console.log(data);
        });

        this.socket.on('nuevoJugador', function(nick) {
            console.log(nick + " se une a la partida");
            //cli.iniciarPartida();
        });

        this.socket.on('partidaIniciar', function(data) {
            console.log(data);
        });

        this.socket.on('recibirListaPartidasDisponibles', function(lista) {
            console.log(lista);
        });

        this.socket.on('recibirListaPartidas', function(lista) {
            console.log(lista);
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