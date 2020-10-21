function Juego() {
    this.minimo = 4;
    this.maximo = 10;
    this.partidas = {}; // Diccionario (array asociativo)

    this.crearPartida = function(num, owner) { // número de Jugadores máximo y propietario
        // comprobar los límites de num (entre 4 y 10)
        if (num >= this.minimo && num <= this.maximo) {
            // generar un código de 6 letras aleatorio
            let codigo = this.obtenerCodigo();
        
            // comprobar que el número no está en uso
            if(!this.partidas[codigo]) {
                // crear el objeto partida
                this.partidas[codigo] = new Partida(num, owner.nick);
                owner.partida = this.partidas[codigo];
            }

            // Para las pruebas
            return codigo;
        }
        else {
            console.log("Has excedido los límites del número de participantes.");
        }
    }
    
    this.unirAPartida = function(codigo, nick) {
        if(this.partidas[codigo]) {
            this.partidas[codigo].agregarUsuario(nick);
        }
    }

    this.abandonarPartida = function(codigo, nick) {
        if(this.partidas[codigo]) {
            this.partidas[codigo].abandonarPartida(nick, this);
            // pasamos this por si hay que eliminar la partida
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

function Partida(num, owner) {
    this.maximo = num; // número max de usuarios
    this.minimo = 4;
    this.nickOwner = owner;
    this.fase = new Inicial();
    this.usuarios = {}; // Diccionario para el control de nombres
    this.numImpostores = 1;

    this.agregarUsuario = function(nick) {
        this.fase.agregarUsuario(nick, this);
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
        this.usuarios[nuevo].partida = this;
    }

    this.iniciarPartida = function() {
        this.fase.iniciarPartida(this);
    }

    this.puedeIniciarPartida = function() {
        // cambiar fase a Jugando
        this.fase = new Jugando();
        
        // Asignar encargos: secuencialmente a todos los usuarios
        let encargos = ["jardin", "tuberias", "electricidad", "oxigeno", "asteroides"];
        this.asignarEncargos(encargos);

        // Asignar impostor: dado el array usuario (Object.keys)
        this.asignarImpostor();
    }

    this.asignarImpostor = function() {
        // Devuelve las keys de usuarios en un array normal
        // [0: "Pepe", 1: "Luis", 2: "Jose", ...]
        let usuarios = Object.keys(this.usuarios);
        
        for(i=0; i<this.numImpostores; i++) {
            let maxCadena = usuarios.length;
            let num = randomInt(0, maxCadena);
            let nickImpostor = usuarios[num];
            this.usuarios[nickImpostor].impostor = true;
            // Eliminamos el que ya es impostor para que no lo vuelva a elegir
            usuarios.splice(num, 1);    // elimina "1" el objeto en la posición num de usuarios
        }
    }

    this.asignarEncargos = function(encargos) {
        let cont = 0;
        
        for(i in this.usuarios) {
            this.usuarios[i].encargo = encargos[cont];
            cont++;

            if(cont == encargos.length) {
                cont = 0;
            }
        }
    }

    this.abandonarPartida = function(nick, juego) {
        this.fase.abandonarPartida(nick, this, juego);
    }

    this.puedeAbandonarPartida = function(nick) {
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

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick);

        // comprobar si no quedan usuarios
        if(partida.numJugadores() <= 0) {
            juego.eliminarPartida(partida);
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
        if((partida.numJugadores() - partida.numImpostores) > partida.numImpostores) {
            partida.puedeIniciarPartida();
        }
        else {
            console.log("No se puede iniciar partida. Los impostores ganan");
        }
    }

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick);
        
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

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick);
        // comprobar si termina la partida (más impostores o más tripulantes)
    }
}

// Pantalla final? 2 opciones: salir de partida o volver a jugar
function Final(){
    this.agregarUsuario = function(nick, partida) {
        console.log("La partida ya ha terminado");
    }

    this.iniciarPartida = function(partida) {}

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick);
    }
}

function Usuario(nick, juego) {
    this.nick = nick;
    this.juego = juego;
    this.partida;
    this.impostor = false;
    this.encargo = "ninguno";
    
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

function inicio() {
    juego = new Juego();
    var usr = new Usuario("Pepe", juego);
    var codigo = usr.crearPartida(4);

    juego.unirAPartida(codigo, "Luis");
    juego.unirAPartida(codigo, "Luisa");
    juego.unirAPartida(codigo, "Luiiiis");

    usr.iniciarPartida();
}