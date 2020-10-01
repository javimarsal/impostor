function Juego() {
    this.partidas = {}; // Diccionario (array asociativo)
    this.crearPartida = function(num, owner) { // número de Jugadores y propietario
        // generar un código de 6 letras aleatorio
        let codigo = this.obtenerCodigo();
        
        // comprobar que el número no está en uso
        if(!this.partidas[codigo]) {
            // crear el objeto partida:num owner
            this.partidas[codigo] = new Partida(num, owner);
        }

    }
    
    this.unirAPartida = function(nick) {

    }

    this.obtenerCodigo = function() {
        let cadena = "ABCDEFGHIJKMNLOPQRSTUVWXYZ";
        let letras = cadena.split('');
        let codigo = [];
        for (i=0; i<6; i++) {
            codigo.push(letras[randomInt(1,26)-1]);
        }
        return codigo.join('');
        
    }
}

function Partida(num, owner) {
    this.maximo = num; // número max de usuarios
    this.owner = owner;
    this.usuarios = []; // El index 0 será el owner
    // this.usuarios = {}; //versión array asociativo
    this.agregarUsuario = function(nick) {
        // comprobar nick único
        // comprobar si el usuario num (máximo)
    }

    this.agregarUsuario(owner);
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}
