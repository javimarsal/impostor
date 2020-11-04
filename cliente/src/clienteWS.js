function ClienteWS() {
    this.socket;
    
    this.crearPartida = function(nick, numero) {
        this.socket.emit("crearPartida", nick, numero); // crearPartida, es un mensaje, tiene que ser igual que el del servidor
        //this.socket.emit("crearPartida", {"nick": nick, "numero": numero});
    }

    this.unirAPartida = function(codigo, nick) {
        this.socket.emit("unirAPartida", codigo, nick); // crearPartida, es un mensaje, tiene que ser igual que el del servidor
        //this.socket.emit("crearPartida", {"nick": nick, "numero": numero});
    }

    this.iniciarPartida = function(nick, codigo) {
        this.socket.emit("iniciarPartida", nick, codigo);
    }
	
    this.ini = function() {
    	this.socket = io.connect();
    	this.lanzarSocketSrv();
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
            console.log(data);
        });

        this.socket.on('unidoAPartida', function(data) {
            console.log(data);
        });

        this.socket.on('nuevoJugador', function(nick) {
            console.log(nick + " se une a la partida");
        });

        this.socket.on('partidaIniciar', function(data) {
            console.log(data);
        });
    }

    this.ini();

}