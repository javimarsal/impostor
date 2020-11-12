function Juego() {
    this.minimo = 4;
    this.maximo = 10;
    this.partidas = {}; // Diccionario (array asociativo)

    this.crearPartida = function(num, owner) { // número de Jugadores máximo y propietario
        // comprobar los límites de num (entre 4 y 10)
        let codigo = undefined;
        if (num >= this.minimo && num <= this.maximo) {
            // generar un código de 6 letras aleatorio
            let codigo = this.obtenerCodigo();
        
            // comprobar que el número no está en uso
            if(!this.partidas[codigo]) {
                // crear el objeto partida
                this.partidas[codigo] = new Partida(num, owner, codigo);
                //owner.partida = this.partidas[codigo];
            }

            // Para las pruebas
            return codigo;
        }
        else {
            console.log("Has excedido los límites del número de participantes.");
        }
    }

    this.listaPartidasDisponibles = function() {
        let lista = [];
        let huecos = 0;

        for(key in this.partidas) {
            let partida = this.partidas[key];
            huecos = partida.numHuecos();
            
            if(huecos>0) {
                lista.push({"codigo": key, "huecos": huecos});
            }
        }
        
        return lista;
    }

    this.listaPartidas = function() {
        let lista = [];
        let huecos = 0;

        for(key in this.partidas) {
            let partida = this.partidas[key];
            let owner = partida.nickOwner;
            lista.push({"codigo": key, "owner": owner});
        }
        
        return lista;
    }
    
    this.unirAPartida = function(codigo, nick) {
        if(this.partidas[codigo]) {
            resultado = this.partidas[codigo].agregarUsuario(nick);
            return resultado;
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

    this.iniciarPartida = function(nick, codigo) {
        var owner = this.partidas[codigo].nickOwner;
        if (nick == owner) {
            this.partidas[codigo].iniciarPartida();
        }
    }

    this.iniciarVotacion = function(nick, codigo) {
        let usr = this.partidas[codigo].usuarios[nick];
        usr.iniciarVotacion();
    }

    this.votarSkip = function(nick, codigo) {
        let usr = this.partidas[codigo].usuarios[nick];
        usr.votar();
    }

    this.votar = function(nick, codigo, sospechoso) {
        let usr = this.partidas[codigo].usuarios[nick];
        usr.votar(sospechoso);
    }

    this.obtenerEncargo = function(nick, codigo) {
        var resultado = {};
        var encargo = this.partidas[codigo].usuarios[nick].encargo;
        var impostor = this.partidas[codigo].usuarios[nick].impostor;

        resultado = {"encargo": encargo, "impostor": impostor};
        return resultado;
    }

    this.atacar = function(nick, codigo) {
        let usr = this.partidas[codigo].usuarios[nick];
        return usr.atacar();
    }
}

function Partida(num, owner, codigo) {
    this.maximo = num; // número max de usuarios
    this.minimo = 4;
    this.nickOwner = owner;
    this.fase = new Inicial();
    this.usuarios = {}; // Diccionario para el control de nombres
    this.numImpostores = 1;
    this.codigo = codigo;
    this.elegido = "Nadie elegido";

    this.agregarUsuario = function(nick) {
        return this.fase.agregarUsuario(nick, this);
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

        return nuevo;
    }

    this.iniciarPartida = function() {
        this.fase.iniciarPartida(this);
    }

    this.puedeIniciarPartida = function() {
        // cambiar fase a Jugando
        this.restablecerUsuarios();
        this.fase = new Jugando();
        
        // Asignar encargos: secuencialmente a todos los usuarios
        let encargos = ["jardin", "tuberias", "electricidad", "oxigeno", "asteroides"];
        this.asignarEncargos(encargos);

        // Asignar impostor: dado el array usuario (Object.keys)
        this.asignarImpostor();
    }

    // Restablecer todos los valores del usuario, menos lo relacionado con votar
    this.restablecerUsuarios = function() {
        for(key in this.usuarios) {
            this.usuarios[key].impostor = false;
            this.usuarios[key].encargo = "ninguno";
            this.usuarios[key].estado = new Vivo();
        }
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
            usuarios.splice(num, 1);    // elimina "1" el objeto en la posición "num" de usuarios
        }
    }

    this.asignarEncargos = function(encargos) {
        let cont = 0;
        
        for(key in this.usuarios) {
            this.usuarios[key].encargo = encargos[cont];
            cont++;

            if(cont == encargos.length) {
                cont = 0;
            }
        }
    }

    this.abandonarPartida = function(nick, juego) {
        this.fase.abandonarPartida(nick, this, juego);
    }

    this.puedeAbandonarPartida = function(nick, juego) {
        delete this.usuarios[nick];

        if(!this.comprobarMinimo()) {
            this.fase = new Inicial();
        }

        // comprobar si no quedan usuarios, eliminar partida
        if(this.numJugadores() <= 0) {
            juego.eliminarPartida(this);
        }
    }

    this.atacar = function(usuario) {
        return this.fase.atacar(this, usuario);
    }

    this.puedeAtacar = function() {
        // Ataca a alguien al azar usando esAtacado() del usuario atacado
        let victima = this.elegirTripulanteVivo();
        victima.esAtacado();
        // Comprobar si termina la partida
        if(this.comprobarFinal()) {
            console.log("La partida ha terminado.");
        }

        return victima.nick;
    }

    // VOTACIONES //
    this.iniciarVotacion = function() {
        this.fase.iniciarVotacion(this);
    }

    this.puedeIniciarVotacion = function() {
        this.fase = new Votando();
    }
    
    this.votar = function(sospechoso, votante) {
        this.fase.votar(sospechoso, votante, this);
    }

    this.puedeVotar = function(sospechoso, votante) {
        // console.log("Has votado a", sospechoso.nick);
        if(this.usuarios[sospechoso] && this.usuarios[sospechoso].estado.esVivo() && !votante.haVotado) {
            this.usuarios[sospechoso].votos++;
            votante.haVotado = true;
            console.log(votante.nick, "ha votado.");
        }
        else if((sospechoso == "skip" || sospechoso == undefined) && !votante.haVotado) {
            votante.skip = true;
            votante.haVotado = true;
            console.log(votante.nick, "ha votado.");
        }
        else if(votante.haVotado) {
            console.log("Ya has votado, solo puedes votar 1 vez.");
        }
    }

    // método que devuelva el número de impostores vivos
    this.numImpostoresVivos = function() {
        let num = 0;

        // i recibe una string
        for(key in this.usuarios) {
            if(this.usuarios[key].impostor && (this.usuarios[key].estado.esVivo())) {
                num++;
            }
        }
        return num;
    }

    // método que devuelva el número de tripulantes inocentes vivos
    this.numTripulantesVivos = function() {
        let num = 0;

        // i recibe una string
        for(key in this.usuarios) {
            if(!this.usuarios[key].impostor && (this.usuarios[key].estado.esVivo())) {
                num++;
            }
        }
        return num;
    }

    this.gananImpostores = function() {
        return this.numTripulantesVivos() <= this.numImpostoresVivos();
    }

    this.gananTripulantes = function() {
        return this.numImpostoresVivos() == 0; /*|| todas las tareas completadas*/
    }

    this.comprobarFinal = function() {
        if(this.gananImpostores()) {
            this.fase = new Final();
            console.log("Los impostores han ganado.");
            return true;
        }
        else if(this.gananTripulantes()) {
            this.fase = new Final();
            console.log("Los tripulantes han ganado.");
            return true;
        }
    }

    this.masVotado = function() {
        let max = 0;
        let usr = undefined;
        let votos;
        
        for(key in this.usuarios) {
            votos = this.usuarios[key].votos;
            if(votos > max) {
                max = votos;
                usr = this.usuarios[key];
            }
        }

        // Comprobamos si hay empate de votos con el más votado
        // mirar si hay algún voto igual a max, sin contar el de usr
        for(key in this.usuarios) {
            votos = this.usuarios[key].votos;
            if(votos == max && !(this.usuarios[key] === usr)) {
                usr = undefined;
                break;
            }
        }

        return usr; // usr puede ser undefined (todos votan skip)
    }

    this.numeroSkips = function() {
        let numSkips = 0;
        
        for(key in this.usuarios) {
            if(this.usuarios[key].skip) {
                numSkips++;
            }
        }
        return numSkips;
    }

    this.reiniciarVotos = function() {
        for(key in this.usuarios) {
            this.usuarios[key].votos = 0;
            this.usuarios[key].skip = false;
            this.usuarios[key].haVotado = false;
        }

        this.elegido = "Nadie elegido";
    }

    this.comprobarVotacion = function() {
        let elegido = this.masVotado();

        // Poner a los que no han votado, el skip y haVotado a true
        for(key in this.usuarios) {
            if(this.usuarios[key].estado.esVivo() && !this.usuarios[key].haVotado) {
                this.usuarios[key].skip = true;
                this.usuarios[key].haVotado = true;
            }
        }

        if(elegido && elegido.votos > this.numeroSkips()) {
            elegido.esAtacado();
            this.elegido = elegido.nick;
            console.log(elegido.nick, "fue eyectado.");
        }
        else {
            console.log("Nadie fue eyectado.");
        }

        return this.elegido;

    }

    this.hanVotadoTodos = function() {
        let resultado = true;

        for(key in this.usuarios) {
            if(this.usuarios[key].estado.esVivo() && !this.usuarios[key].haVotado) {
                resultado = false;
                break;
            }
        }

        return resultado;
    }

    this.listaHanVotado = function() {
        var lista = [];
        for(key in this.usuarios) {
            if(this.usuarios[key].estado.esVivo() && this.usuarios[key].haVotado) {
                lista.push(key);
            }
        }

        return lista;
    }

    this.finalizarVotacion = function() {
        return this.fase.finalizarVotacion(this);
    }

    this.puedeFinalizarVotacion = function() {
        let elegido = this.comprobarVotacion();
        this.reiniciarVotos();
        if(!this.comprobarFinal()) {
            this.fase = new Jugando();
        }

        return elegido;
    }

    // TERMINA VOTACIONES //


    // Elegir un usuario vivo para atacarlo
    this.elegirTripulanteVivo = function() {
        let usuarios = [];

        // Se guarda en usuarios los usuarios vivos que no son impostores
        for(key in this.usuarios) {
            if((this.usuarios[key].estado.esVivo()) && !this.usuarios[key].impostor) {
                usuarios.push(key);
            }
        }
        
        let num = randomInt(0, usuarios.length);
        let nick = usuarios[num];
        return this.usuarios[nick];
    }

    this.numJugadores = function() {
        return Object.keys(this.usuarios).length;
    }

    this.numHuecos = function() {
        return this.maximo - this.numJugadores();
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
    nombre = "inicial";

    this.esInicial = function() {
        return true;
    }

    this.esCompletado = function() {
        return false;
    }

    this.esJugando = function() {
        return false;
    }

    this.esVotando = function() {
        return false;
    }

    this.esFinal = function() {
        return false;
    }

    this.agregarUsuario = function(nick, partida) {
        resultado = partida.puedeAgregarUsuario(nick);
        
        if(partida.comprobarMinimo()) {
            partida.fase = new Completado();
        }

        return resultado;
    }
    
    this.iniciarPartida = function(partida) {
        console.log("Faltan jugadores.");
    }

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick, juego);
    }

    this.atacar = function(partida, usuario) {
        console.log("La partida no ha empezado.");
    }

    this.iniciarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("No puedes votar sin empezar la partida.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
    }
}

// Hay un mínimo de jugadores para empezar la partida
function Completado(){
    nombre = "completado";

    this.esInicial = function() {
        return false;
    }

    this.esCompletado = function() {
        return true;
    }

    this.esJugando = function() {
        return false;
    }

    this.esVotando = function() {
        return false;
    }

    this.esFinal = function() {
        return false;
    }

    this.agregarUsuario = function(nick, partida) {
        if(partida.comprobarMaximo()) {
            return partida.puedeAgregarUsuario(nick);
        }
        else {
            console.log("Se ha alcanzado el número máximo de jugadores en la partida.");
        }
    }
    
    this.iniciarPartida = function(partida) {
        if((partida.numJugadores() - partida.numImpostores) > partida.numImpostores) {
            partida.puedeIniciarPartida();
        }
        else {
            console.log("No se puede iniciar partida. Los impostores ganan.");
        }
    }

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick);
    }

    this.atacar = function(partida, usuario) {
        console.log("La partida no ha empezado.");
    }

    this.iniciarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("No puedes votar sin empezar la partida.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
    }
}

function Jugando(){
    nombre = "jugando";

    this.esInicial = function() {
        return false;
    }

    this.esCompletado = function() {
        return false;
    }

    this.esJugando = function() {
        return true;
    }

    this.esVotando = function() {
        return false;
    }

    this.esFinal = function() {
        return false;
    }

    this.agregarUsuario = function(nick, partida) {
        console.log("La partida ya ha comenzado.");
    }

    this.iniciarPartida = function(partida) {}

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick);
        // comprobar si termina la partida (más impostores o más tripulantes)
    }

    this.atacar = function(partida, usuario) {
        return partida.puedeAtacar(usuario);
    }

    this.iniciarVotacion = function(partida) {
        partida.puedeIniciarVotacion();
        console.log("Empieza la votación!");
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("No se ha iniciado ninguna votación.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("No se ha iniciado ninguna votación.");
    }
}

function Votando() {
    nombre = "votando";

    this.esInicial = function() {
        return false;
    }

    this.esCompletado = function() {
        return false;
    }

    this.esJugando = function() {
        return false;
    }

    this.esVotando = function() {
        return true;
    }

    this.esFinal = function() {
        return false;
    }

    this.agregarUsuario = function(nick, partida) {}

    this.iniciarPartida = function(partida) {}

    this.abandonarPartida = function(nick, partida, juego) {}

    this.atacar = function(partida, usuario) {}

    this.iniciarVotacion = function(partida) {
        console.log("No puedes iniciar una votación. Ya está en marcha.");
    }

    this.votar = function(sospechoso, votante, partida) {
        partida.puedeVotar(sospechoso, votante);
    }

    this.finalizarVotacion = function(partida) {
        return partida.puedeFinalizarVotacion();
    }
}

// Pantalla final? 2 opciones: salir de partida o volver a jugar
function Final(){
    nombre = "final";

    this.esInicial = function() {
        return false;
    }

    this.esCompletado = function() {
        return false;
    }

    this.esJugando = function() {
        return false;
    }

    this.esVotando = function() {
        return false;
    }

    this.esFinal = function() {
        return true;
    }

    this.agregarUsuario = function(nick, partida) {
        console.log("La partida ya ha terminado.");
    }

    this.iniciarPartida = function(partida) {}

    this.abandonarPartida = function(nick, partida, juego) {
        partida.puedeAbandonarPartida(nick);
    }

    this.atacar = function(partida, usuario) {
        console.log("La partida ya ha terminado.");
    }

    this.iniciarVotacion = function(partida) {
        console.log("La partida ya ha terminado.");
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("La partida ya ha terminado.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("La partida ya ha terminado.");
    }
}

function Usuario(nick, juego) {
    this.nick = nick;
    this.juego = juego;
    this.partida;
    this.impostor = false;
    this.encargo = "ninguno";
    this.estado = new Vivo();
    this.votos = 0;
    this.skip = false;
    this.haVotado = false;
    
    this.crearPartida = function(num) {
        return this.juego.crearPartida(num, this);
    }
    
    this.iniciarPartida = function() {
        this.partida.iniciarPartida();
    }

    this.abandonarPartida = function() {
        this.partida.abandonarPartida(this.nick);
    }

    this.atacar = function() {
        if(this.estado.esVivo() && this.impostor) {
            return this.partida.atacar(this);
        }
        else {
            console.log("No eres impostor, no puedes atacar.");
        }
    }

    this.esAtacado = function() {
        this.estado.esAtacado(this);
    }

    this.puedeSerAtacado = function() {
        this.estado = new Muerto();
    }

    this.iniciarVotacion = function() {
        this.estado.iniciarVotacion(this);
    }

    this.puedeIniciarVotacion = function() {
        this.partida.iniciarVotacion();
    }

    this.votar = function(sospechoso) {
        this.estado.votar(sospechoso, this)
    }

    this.puedeVotar = function(sospechoso) {
        this.partida.votar(sospechoso, this);
    }

}

function Vivo() {
    this.esVivo = function() {
        return true;
    }

    this.esMuerto = function() {
        return false;
    }

    this.esAtacado = function(usuario) {
        usuario.puedeSerAtacado();
    }

    this.iniciarVotacion = function(usuario) {
        usuario.puedeIniciarVotacion();
    }

    this.votar = function(sospechoso, votante) {
        votante.puedeVotar(sospechoso);
    }
}

function Muerto() {
    this.esVivo = function() {
        return false;
    }

    this.esMuerto = function() {
        return true;
    }

    this.esAtacado = function(usuario) {
        console.log("Ya estás muerto, no te pueden matar otra vez.");
    }

    this.iniciarVotacion = function(usuario) {}

    this.votar = function(sospechoso, votante) {}
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}



module.exports.Juego = Juego;
module.exports.Usuario = Usuario;