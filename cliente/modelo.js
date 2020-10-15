function Juego() {
    this.partidas = {}; // Diccionario (array asociativo)
    
    this.crearPartida = function(num, owner) { // número de Jugadores máximo y propietario
        // generar un código de 6 letras aleatorio
        let codigo = this.obtenerCodigo();
        
        // comprobar que el número no está en uso
        if(!this.partidas[codigo]) {
            // crear el objeto partida
            this.partidas[codigo] = new Partida(num, owner.nick, this);
            owner.partida = this.partidas[codigo];
        }

        // Para las pruebas
        return codigo;
    }
    
    this.unirAPartida = function(codigo, nick) {
        if(this.partidas[codigo]) {
            this.partidas[codigo].agregarUsuario(nick);
        }
    }

    this.abandonarPartida = function(codigo, nick) {
        if(this.partidas[codigo]) {
            this.partidas[codigo].abandonarPartida(nick);
        }
    }

    this.obtenerCodigo = function() {
        let cadena = "ABCDEFGHIJKMNLOPQRSTUVWXYZ";
        let letras = cadena.split('');  // convierte cadena en un vector
        let maxCadena = cadena.length;
        let codigo = [];
        
        for (i=0; i<6; i++) {
            codigo.push(letras[randomInt(1, maxCadena) - 1]);
        }
        
        return codigo.join('');
    }

    this.obtenerCodigoDePartida = function(partidas, p) {
        return Object.keys(partidas).find(codigo => partidas[codigo] === p);
    }

    this.eliminarPartida = function(partida) {
        let codigo = this.obtenerCodigoDePartida(this.partidas, partida);
        delete this.partidas[codigo];
    }
}

function Partida(num, owner, juego) {
    this.maximo = num; // número max de usuarios
    this.minimo = 4;
    this.nickOwner = owner;
    this.fase = new Inicial();
    this.juego = juego;
    this.usuarios = {}; // Diccionario para el control de nombres

    this.agregarUsuario = function(nick) {
        this.fase.agregarUsuario(nick, this)
    }

    this.puedeAgregarUsuario = function(nick) {
        // comprobar nick único
        let cont = 1;
        let nuevo = nick;
        
        while (this.usuarios[nuevo]) {
            nuevo = nick + cont;
            cont = cont + 1;
        }

        this.usuarios[nuevo] = new Usuario(nuevo, this.juego);
    }

    this.iniciarPartida = function() {
        this.fase.iniciarPartida(this);
    }

    this.abandonarPartida = function(nick) {
        this.fase.abandonarPartida(nick, this);
    }

    this.eliminarUsuario = function(nick) {
        delete this.usuarios[nick];
    }

    this.numJugadores = function() {
        return Object.keys(this.usuarios).length;
    } 

    this.comprobarMinimo = function() {
        return this.numJugadores() >= this.minimo;
    }

    this.comprobarMaximo = function() {
        return this.numJugadores() < this.maximo;
    }

    // Al crear la partida, el owner también se agrega a la lista de usuarios
    this.agregarUsuario(owner);

}

// Estados del juego (State)
function Inicial(){
    this.agregarUsuario = function(nick, partida) {
        partida.puedeAgregarUsuario(nick);
        
        if(partida.comprobarMinimo()) {
            partida.fase = new Completado();
        }
    }
    
    this.iniciarPartida = function(partida) {
        console.log("Faltan jugadores.");
    }

    this.abandonarPartida = function(nick, partida) {
        partida.eliminarUsuario(nick);
        //let usr = partida.usuarios[nick];

        // comprobar si no quedan usuarios
        if(partida.numJugadores() <= 0) {
            partida.juego.eliminarPartida(partida);
        }
    }
}

// Hay un mínimo de jugadores para empezar la partida
function Completado(){
    this.agregarUsuario = function(nick, partida) {
        if(partida.comprobarMaximo()) {
            partida.puedeAgregarUsuario(nick);
        }
        else {
            console.log("Se ha alcanzado el número máximo de jugadores en la partida");
        }
    }
    
    this.iniciarPartida = function(partida) {
        partida.fase = new Jugando();
    }

    this.abandonarPartida = function(nick, partida) {
        partida.eliminarUsuario(nick);
        
        if(!partida.comprobarMinimo()) {
            partida.fase = new Inicial();
        }
    }
}

function Jugando(){
    this.agregarUsuario = function(nick, partida) {
        console.log("La partida ya ha comenzado.");
    }

    this.iniciarPartida = function(partida) {}

    this.abandonarPartida = function(nick, partida) {
        partida.eliminarUsuario(nick);
        // comprobar si termina la partida (más impostores o más tripulantes)
    }
}

function Final(){
    this.agregarUsuario = function(nick, partida) {
        console.log("La partida ya ha terminado");
    }

    this.iniciarPartida = function(partida) {}

    this.abandonarPartida = function(nick, partida) {
        // esto es absurdo
    }
}

function Usuario(nick, juego) {
    this.nick = nick;
    this.juego = juego;
    this.partida;
    
    this.crearPartida = function(num) {
        return this.juego.crearPartida(num, this);
    }
    
    this.iniciarPartida = function() {
        this.partida.iniciarPartida();
    }

    this.abandonarPartida = function() {
        this.partida.abandonarPartida(this.nick);
    }
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}