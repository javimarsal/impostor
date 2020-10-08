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
    
    this.unirAPartida = function(codigo, nick) {
        // ToDo
        if (this.partidas[codigo] /*&& Object.keys(this.partidas[codigo].usuarios).length < this.partidas.maximo*/) {
            this.partidas[codigo].agregarUsuario(nick);
        }
    }

    this.MaximoPartida = function(codigo) {
        Object.keys(this.partidas[codigo].usuarios).length;
    }

    this.obtenerCodigo = function() {
        let cadena = "ABCDEFGHIJKMNLOPQRSTUVWXYZ";
        let letras = cadena.split('');
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
    this.usuarios = {}; // El index 0 será el owner
    // this.usuarios = {}; //versión array asociativo

    this.agregarUsuario = function(nick){
        this.fase.puedeAgregarUsuario()
    }


    this.agregarUsuario = function(nick) {
        if(Object.keys(this.usuarios).length < this.maximo /* Probar a hacerlo en Juego */) {
        // comprobar nick único
        let cont = 1;
        let nuevo = nick;
        
        while (this.usuarios[nuevo]) {
            nuevo = nick + cont;
            cont = cont + 1;
        }

        this.usuarios[nuevo] = new Usuario(nuevo);

        /* if(this.usuarios[nick]) {
            this.usuarios[nick] = new Usuario(nick + repeticion.toString());
            repeticion ++;
        }
        else {
            this.usuarios[nick] = new Usuario(nick);
        } */
        // comprobar si el usuario num (máximo)
        }
    }

    this.agregarUsuario(owner);
}

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
    this.nick;
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}
