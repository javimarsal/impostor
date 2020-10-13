function Juego() {
    this.partidas = {}; // Diccionario (array asociativo)
    this.crearPartida = function(num, owner) { // número de Jugadores máximo y propietario
        // generar un código de 6 letras aleatorio
        let codigo = this.obtenerCodigo();
        
        // comprobar que el número no está en uso
        if(!this.partidas[codigo]) {
            // crear el objeto partida
            this.partidas[codigo] = new Partida(num, owner.nick);
            owner.partida = this.partidas[codigo];
        }
    }
    
    this.unirAPartida = function(codigo, nick) {
        if (this.partidas[codigo] && this.puedeUnirse(codigo)) {
            this.partidas[codigo].agregarUsuario(nick);
        }
    }

    // Comprueba si se puede unir, compara el num de jugadores actual con el máximo de la partida
    // Quitar en un futuro
    // Ya se controla con la fase "Completado"
    this.puedeUnirse = function(codigo) {
        return Object.keys(this.partidas[codigo].usuarios).length < this.partidas[codigo].maximo;
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
}

function Partida(num, owner) {
    this.maximo = num; // número max de usuarios
    this.nickOwner = owner;
    this.fase = new Inicial();
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

        this.usuarios[nuevo] = new Usuario(nuevo);
        
        if (Object.keys(this.usuarios).length >= this.maximo) {
            this.fase = new Completado();
        }
    }

    this.iniciarPartida = function() {
        this.fase.iniciarPartida(this);
    }

    // Al crear la partida, el owner también se agrega a la lista de usuarios
    this.agregarUsuario(owner);

}

// Estados del juego (State)
function Inicial(){
    this.agregarUsuario = function(nick, partida) {
        partida.puedeAgregarUsuario(nick);
    }
    
    this.iniciarPartida = function(partida) {
        console.log("Faltan jugadores.");
    }
}

function Completado(){
    this.agregarUsuario = function(nick, partida) {
        console.log("Se ha alcanzado el número máximo de jugadores.");
    }
    
    this.iniciarPartida = function(partida) {
        partida.fase = new Jugando();
    }
}

function Jugando(){
    this.agregarUsuario = function(nick, partida) {
        console.log("La partida ya ha comenzado.");
    }

    this.iniciarPartida = function(partida) {}
}

function Final(){
    this.agregarUsuario = function(nick, partida) {
        console.log("La partida ya ha terminado");
    }

    this.iniciarPartida = function(partida) {}
}

function Usuario(nick, juego) {
    this.nick = nick;
    this.juego = juego;
    this.partida;
    
    this.crearPartida = function(num) {
        this.juego.crearPartida(num, this);
    }
    
    this.iniciarPartida = function() {
        this.partida.iniciarPartida();
    }
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}