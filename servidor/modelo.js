function Juego(min) {
    this.minimo = min;
    this.maximo = 10;
    this.partidas = {}; // Diccionario (array asociativo)

    this.crearPartida = function(num, owner) { // número de Jugadores máximo y propietario
        let codigo = "fallo";
        
        if(num != undefined && owner != undefined) {
            // comprobar que el código no está en uso y que el está entre los límites
            if (!this.partidas[codigo] && this.numeroValido(num)) {
                // generar un código de 6 letras aleatorio
                codigo = this.obtenerCodigo();

                // crear el objeto partida
                this.partidas[codigo] = new Partida(num, owner, codigo, this.minimo);
                //owner.partida = this.partidas[codigo];
            }
            else {
                console.log("Has excedido los límites del número de participantes.");
            }
        }

        return codigo;
    }

    this.numeroValido = function(num) {
        return num >= this.minimo && num <= this.maximo;
    }

    this.obtenerOwner = function(codigo) {
        let owner = "fallo";

        if(codigo != undefined && this.partidas[codigo]) {
            owner = this.partidas[codigo].nickOwner;
        }

        return owner;
    }

    this.listaPartidasDisponibles = function() {
        let lista = [];
        let huecos = 0;

        for(key in this.partidas) {
            let partida = this.partidas[key];
            huecos = partida.numHuecos();
            let maximo = partida.maximo;
            
            if(huecos>0) {
                lista.push({"codigo": key, "huecos": huecos, "maximo": maximo});
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

    this.listaJugadores = function(codigo) {
        let lista = [];
        let partida = this.partidas[codigo];
        for(nick in partida.usuarios) {
            //let nickJugador = partida.usuarios[key];
            let numJugador = partida.usuarios[nick].numJugador;
            lista.push({"nickJugador": nick, "numJugador": numJugador});
        }
        
        return lista;
    }
    
    this.unirAPartida = function(codigo, nick) {
        let nickJugador = undefined;
        
        if(this.partidas[codigo] && codigo != undefined && nick != undefined) {
            nickJugador = this.partidas[codigo].agregarUsuario(nick);
        }

        return nickJugador;
    }

    this.abandonarPartida = function(nick, codigo) {
        let partida = this.partidas[codigo];
        if(partida) {
            return partida.usuarios[nick].abandonarPartida();
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

    this.eliminarPartida = function(codigo) {
        //let codigo = this.obtenerCodigoDePartida(this.partidas, partida);
        delete this.partidas[codigo];
    }

    this.iniciarPartida = function(nick, codigo) {
        resultado = false;
        var owner = this.partidas[codigo].nickOwner;
        if (nick == owner) {
            this.partidas[codigo].iniciarPartida();
        }
        else {
            console.log("No puedes iniciar la partida porque no eres el propietario.");
        }

    }

    this.iniciarVotacion = function(nick, codigo) {
        let usr = this.partidas[codigo].usuarios[nick];
        return usr.iniciarVotacion();
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

    this.atacar = function(nick, codigo, victima) {
        let usr = this.partidas[codigo].usuarios[nick];
        usr.atacar(victima);
    }

    this.realizarTarea = function(datos) {
        let nick = datos.nick;
        let codigo = datos.codigo;

        let partida = this.partidas[codigo];
        partida.realizarTarea(nick);
    }

    this.getEstadoPartida = function(codigo) {
        let partida = this.partidas[codigo];
        let fase = partida.getEstadoPartida();
        
        return fase;
    }
}

function Partida(num, owner, codigo, minimo) {
    this.maximo = num; // número max de usuarios
    this.minimo = minimo;
    this.nickOwner = owner;
    this.fase = new Inicial();
    this.usuarios = {}; // Diccionario para el control de nombres
    this.numImpostores = 1;
    this.codigo = codigo;
    this.elegido = "Nadie elegido";
    this.encargos = ["jardin", "tuberias", "electricidad", "oxigeno", "asteroides"];


    this.obtenerListaJugadoresVivos = function() {
        var lista = [];
        for(var nick in this.usuarios) {
            if(this.usuarios[nick].estado.esVivo()) {
                var numero = this.usuarios[nick].numJugador;
                lista.push({nick:nick, numJugador:numero});
            }
        }
        return lista;
    }

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
        this.usuarios[nuevo].numJugador = this.numJugadores() - 1;

        if(this.comprobarMinimo()) {
            this.fase = new Completado();
        }

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
        this.asignarEncargos(this.encargos);

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
            let impostor = this.usuarios[nickImpostor];
            impostor.asignarImpostor();
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

    this.abandonarPartida = function(nick) {
        return this.fase.abandonarPartida(nick, this);
    }

    this.puedeAbandonarPartida = function(nick) {
        let resultado = {};
        let finalPartida = false;
        let mensaje = "Nada que decir.";
        this.eliminarUsuario(nick);

        // Si estábamos en fase completado
        if(!this.comprobarMinimo()) {
            this.fase = new Inicial();
        }

        // comprobar si no quedan usuarios, eliminar partida
        if(this.numJugadores() <= 0) {
            this.terminarPartida();
        }

        // Si abandona el propietario se termina la partida (fase final)
        if(this.nickOwner == nick) {
            this.terminarPartida();
        }

        // Si estamos jugando, comprobar si termina la partida
        if(this.fase.esJugando()) {
            resultado = this.comprobarFinal();
            finalPartida = resultado.finalPartida;
            mensaje = resultado.mensaje;
        }

        return {mensaje:mensaje, finalPartida:finalPartida, nick:nick};
    }

    this.eliminarUsuario = function(nick) {
        // falta completar las tareas del usuario que vamos a eliminar
        delete this.usuarios[nick];
    }

    this.atacar = function(victima) {
        this.fase.atacar(this, victima);
    }

    this.puedeAtacar = function(victima) {
        // Ataca a alguien al azar usando esAtacado() del usuario atacado
        //let victima = this.elegirTripulanteVivo();
        
        let jugadorAtacado = this.usuarios[victima];
        jugadorAtacado.esAtacado();
        // Comprobar si termina la partida
        let resultado = this.comprobarFinal()
        let finalPartida = resultado.finalPartida;
        
        if(finalPartida) {
            console.log("La partida ha terminado.");
        }
    }

    // VOTACIONES //
    this.iniciarVotacion = function() {
        return this.fase.iniciarVotacion(this);
    }

    this.puedeIniciarVotacion = function() {
        this.fase = new Votando();
        return true;
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

    this.numTripulantes = function() {
        let num = 0;

        for(nick in this.usuarios) {
            if(!this.usuarios[nick].impostor) {
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
        let finalPartida = false;
        let mensaje = "Seguimos jugando.";
        let resultado = {};

        if(this.gananImpostores()) {
            this.fase = new Final();
            mensaje = "Los impostores han ganado.";
            finalPartida = true;
        }
        else if(this.gananTripulantes()) {
            this.fase = new Final();
            mensaje = "Los tripulantes han ganado.";
            finalPartida = true;
        }

        console.log(mensaje);

        resultado = {mensaje:mensaje, finalPartida:finalPartida};
        return resultado;
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
        let mensaje = "";
        let resultado = {};

        // Poner a los que no han votado, el skip y haVotado a true
        for(key in this.usuarios) {
            if(this.usuarios[key].estado.esVivo() && !this.usuarios[key].haVotado) {
                this.usuarios[key].skip = true;
                this.usuarios[key].haVotado = true;
            }
        }

        // elegido puede ser undefined
        if(elegido && elegido.votos > this.numeroSkips()) {
            elegido.esAtacado();
            this.elegido = elegido.nick;
            mensaje = elegido.nick + " fue eyectado.";
        }
        else {
            mensaje = "Nadie fue eyectado.";
        }

        console.log(mensaje);
        
        resultado = {mensaje: mensaje, elegido: this.elegido};
        return resultado;

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
        let datosVotacion = this.comprobarVotacion(); // tiene mensaje: es una cadena, y elegido:obj Usuario
        let mensajeVotacion = datosVotacion.mensaje;
        let elegido = datosVotacion.elegido;

        let estadoPartida = this.comprobarFinal();
        let finalPartida = estadoPartida.finalPartida;
        let mensajeEstadoPartida = estadoPartida.mensaje;
        
        let resultado = {mensajeVotacion:mensajeVotacion, elegido:elegido, finalPartida:finalPartida, mensajeEstadoPartida:mensajeEstadoPartida};
        this.reiniciarVotos();
        
        if(!finalPartida) {
            this.fase = new Jugando();
        }
        
        return resultado;
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

    // realizar Tareas
    this.realizarTarea = function(nick) {
        this.fase.realizarTarea(nick, this);
    }

    this.puedeRealizarTarea = function(nick) {
        let usuario = this.usuarios[nick];
        usuario.realizarTarea();
    }

    this.tareaTerminada = function() {
        if(this.comprobarTareasCompletadas()) {
            this.terminarPartida();
        }
    }

    this.comprobarTareasCompletadas = function() {
        let resultado = true;
        for(nick in this.usuarios) {
            if(this.usuarios[nick].estadoTarea != "completada") {
                resultado = false;
                break;
            }
        }
        
        return resultado;
    }

    this.terminarPartida = function() {
        this.fase = new Final();
        console.log("La partida ha terminado.");
    }

    this.obtenerPercentTarea = function(nick) {
        return this.usuarios[nick].obtenerPercentTarea();
    }

    this.obtenerPercentGlobal = function() {
        var total = 0;
        for(nick in this.usuarios) {
            if (!this.usuarios[nick].impostor) {
                total = total + this.obtenerPercentTarea(nick);
            }  
        }

        total = total/(this.numTripulantesVivos());
        return total;
    }

    this.getEstadoPartida = function() {
        return this.fase;
    }

    // Al crear la partida, el owner también se agrega a la lista de usuarios
    this.agregarUsuario(owner);

}

// Estados del juego (State)
function Inicial(){
    this.nombre = "inicial";

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
        var resultado = partida.puedeAgregarUsuario(nick);
        
        /* if(partida.comprobarMinimo()) {
            partida.fase = new Completado();
        } */

        return resultado;
    }
    
    this.iniciarPartida = function(partida) {
        console.log("Faltan jugadores.");
    }

    this.atacar = function(partida, victima) {
        console.log("La partida no ha empezado.");
    }

    this.iniciarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
        return false;
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("No puedes votar sin empezar la partida.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
    }

    this.realizarTarea = function(nick, partida) {
        console.log("Aun no ha empezado la partida.");
    }

    this.abandonarPartida = function(nick, partida){
        return partida.puedeAbandonarPartida(nick);
    }
}

// Hay un mínimo de jugadores para empezar la partida
function Completado(){
    this.nombre = "completado";

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
            return undefined;
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

    this.atacar = function(partida, victima) {
        console.log("La partida no ha empezado.");
    }

    this.iniciarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
        return false;
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("No puedes votar sin empezar la partida.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("Aun no ha empezado la partida.");
    }

    this.realizarTarea = function(nick, partida) {
        console.log("Aun no ha empezado la partida.");
    }

    this.abandonarPartida = function(nick, partida){
        return partida.puedeAbandonarPartida(nick);
    }
}

function Jugando(){
    this.nombre = "jugando";

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

    this.atacar = function(partida, victima) {
        partida.puedeAtacar(victima);
    }

    this.iniciarVotacion = function(partida) {
        console.log("Empieza la votación!");
        return partida.puedeIniciarVotacion();
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("No se ha iniciado ninguna votación.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("No se ha iniciado ninguna votación.");
    }

    this.realizarTarea = function(nick, partida) {
        partida.puedeRealizarTarea(nick);
    }

    this.abandonarPartida = function(nick, partida){
        return partida.puedeAbandonarPartida(nick);
    }
}

function Votando() {
    this.nombre = "votando";

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

    this.atacar = function(partida, victima) {}

    this.iniciarVotacion = function(partida) {
        console.log("No puedes iniciar una votación. Ya está en marcha.");
        return false;
    }

    this.votar = function(sospechoso, votante, partida) {
        partida.puedeVotar(sospechoso, votante);
    }

    this.finalizarVotacion = function(partida) {
        return partida.puedeFinalizarVotacion();
    }

    this.realizarTarea = function(nick, partida) {
        console.log("Estamos votando, no se pueden realizar tareas.");
    }

    this.abandonarPartida = function(nick, partida){
        console.log("Espera, se esta votando");
        return {mensaje:"no puedes abandonar partida", finalPartida:false};
    }
}

// Pantalla final? 2 opciones: salir de partida o volver a jugar
function Final(){
    this.nombre = "final";

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

    this.atacar = function(partida, victima) {
        console.log("La partida ya ha terminado.");
    }

    this.iniciarVotacion = function(partida) {
        console.log("La partida ya ha terminado.");
        return false;
    }

    this.votar = function(sospechoso, votante, partida) {
        console.log("La partida ya ha terminado.");
    }

    this.finalizarVotacion = function(partida) {
        console.log("La partida ya ha terminado.");
    }

    this.realizarTarea = function(nick, partida) {
        console.log("La partida ya ha terminado.");
    }

    this.abandonarPartida = function(nick, partida){
        console.log("La partida ya ha terminado.");
        return {mensaje:"no puedes abandonar partida", finalPartida:false};
    }
}

function Usuario(nick, juego) {
    this.nick = nick;
    this.numJugador;
    this.juego = juego;
    this.partida;
    this.impostor = false;
    this.estado = new Vivo();
    this.votos = 0;
    this.skip = false;
    this.haVotado = false;
    this.encargo = "ninguno";
    this.estadoTarea = "noCompletada";
    this.contadorTarea = 0;
    this.maximoContadorTarea = 10;

    this.crearPartida = function(num) {
        return this.juego.crearPartida(num, this);
    }
    
    this.iniciarPartida = function() {
        this.partida.iniciarPartida();
    }

    this.abandonarPartida = function() {
        return this.partida.abandonarPartida(this.nick);
    }

    this.atacar = function(victima) {
        if(this.estado.esVivo() && this.impostor) {
            this.partida.atacar(victima);
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
        return this.estado.iniciarVotacion(this);
    }

    this.puedeIniciarVotacion = function() {
        return this.partida.iniciarVotacion();
    }

    this.votar = function(sospechoso) {
        this.estado.votar(sospechoso, this)
    }

    this.puedeVotar = function(sospechoso) {
        this.partida.votar(sospechoso, this);
    }

    this.asignarImpostor = function() {
        this.impostor = true;
        this.estadoTarea = "completada"; // solución para comprobar tareas completadas
        this.contadorTarea = this.maximoContadorTarea;
    }

    this.realizarTarea = function() {
        if(!this.impostor) {
            this.contadorTarea++;

            //if(this.contadorTarea < this.maximoContadorTarea) {
                

            if(this.contadorTarea >= this.maximoContadorTarea) {
                this.estadoTarea = "completada";
                this.partida.tareaTerminada();
            }
            //}
        }
        console.log(this.nick + " realizar tarea " + this.encargo + " estado tarea " + this.estadoTarea);
    }

    this.obtenerPercentTarea = function() {
        return 100*(this.contadorTarea/this.maximoContadorTarea);
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
        return usuario.puedeIniciarVotacion();
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

    this.iniciarVotacion = function(usuario) {
        return false;
    }

    this.votar = function(sospechoso, votante) {}
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}



module.exports.Juego = Juego;
module.exports.Usuario = Usuario;