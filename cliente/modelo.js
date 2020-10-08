function Juego() {
    this.partidas = {}; // Diccionario (array asociativo)
    this.crearPartida = function(num, owner) { // número de Jugadores máximo y propietario
        // generar un código de 6 letras aleatorio
        let codigo = this.obtenerCodigo();
        
        // comprobar que el número no está en uso
        if(!this.partidas[codigo]) {
            // crear el objeto partida
            this.partidas[codigo] = new Partida(num, owner);
        }

    }
    
    this.unirAPartida = function(codigo, nick) {
        if (this.partidas[codigo] && this.puedeUnirse(codigo)) {
            this.partidas[codigo].agregarUsuario(nick);
        }
    }

    // Comprueba si se puede unir, compara el num de jugadores actual con el máximo de la partida
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

    this.agregarUsuario = function(nick){
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
        
    }

    // Al crear la partida, el owner también se agrega a la lista de usuarios
    this.agregarUsuario(owner);

}

// Estados del juego (State)
function Inicial(){
    this.agregarUsuario = function(nick, partida) {
        partida.puedeAgregarUsuario(nick);
    }
}

function Jugando(){
    this.agregarUsuario = function(nick, partida) {
        //partida.puedeAgregarUsuario(nick);
    }
}

function Final(){
    this.agregarUsuario = function(nick, partida) {
        //partida.puedeAgregarUsuario(nick);
    }
}

function Usuario(nick) {
    this.nick = nick;
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}
