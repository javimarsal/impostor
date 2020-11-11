var modelo = require('./modelo.js');

describe("El juego del impostor", function() {
    var juego;
    var nick;

    beforeEach(function() {
      juego = new modelo.Juego();
      nick = "Pepe";
    });

    it("Comprueba valores iniciales del juego", function() {
        expect(Object.keys(juego.partidas).length).toEqual(0);
        expect(nick).toEqual("Pepe");
        expect(juego).not.toBe(undefined);
    });


    describe("El usuario Pepe crea una partida de 4 jugadores", function() {
        var num;
        var codigo;
        var nick2;

        beforeEach(function() {
            num = 4;
            nick2 = "Javier";
            codigo = juego.crearPartida(num, nick);
        });
        
        it("Comprobar la partida", function() {
            expect(num >= juego.minimo && num <= juego.maximo).toBe(true);
            expect(codigo).not.toBe(undefined);
            expect(juego.partidas[codigo].maximo).toEqual(num);
            expect(juego.partidas[codigo].nickOwner).toEqual(nick);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);
            expect(Object.keys(juego.partidas[codigo].usuarios).length).toEqual(1);
        });

        it("No se puede crear partida si el num no está entre los límites", function() {
            // Menor que el mínimo
            var codigo = juego.crearPartida(3, nick);
            expect(codigo).toBe(undefined);
            
            // Mayor que el máximo
            var codigo = juego.crearPartida(11, nick);
            expect(codigo).toBe(undefined);
        })
    
        it("Varios usuarios se unen a la partida", function() {
            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);
            
            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);

            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase.esCompletado()).toBe(true);
        });
    
        it("Pepe inicia la partida", function() {
            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);
            
            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);

            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase.esCompletado()).toBe(true);

            juego.iniciarPartida(nick, codigo);
            expect(juego.partidas[codigo].fase.esJugando()).toBe(true);

            // Comprobar que tienen tareas y el número de impostores
            var nImpostores = 0;
            for(i in juego.partidas[codigo].usuarios) {
                expect(juego.partidas[codigo].usuarios[i].encargo).not.toEqual("ninguno");
                if(juego.partidas[codigo].usuarios[i].impostor == true) {
                    nImpostores++;
                }
            }

            expect(nImpostores == juego.partidas[codigo].numImpostores).toBe(true);

        });

        it("Pepe no puede iniciar la partida, porque ganarían los impostores", function() {
            juego.partidas[codigo].numImpostores = 2;

            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);
            
            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);

            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase.esCompletado()).toBe(true);

            juego.iniciarPartida(nick, codigo);
            expect(juego.partidas[codigo].fase.esCompletado()).toBe(true);
        });

        it("Todos abandonan la partida", function() {
            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);
            
            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);

            juego.unirAPartida(codigo, nick2);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase.esCompletado()).toBe(true);
            
            // Se salen de la partida
            var partida = juego.partidas[codigo];
            juego.abandonarPartida(codigo, "Javier");
            expect(juego.partidas[codigo].fase.esInicial()).toBe(true);

            juego.abandonarPartida(codigo, "Javier1");
            juego.abandonarPartida(codigo, "Javier2");
            juego.abandonarPartida(codigo, "Pepe");
            expect(partida.numJugadores() == 0).toBe(true);
            expect(juego.partidas[codigo]).toBe(undefined);
        });

        describe("Pepe inicia la partida de 4 jugadores, y se llena. Votaciones", function() {
            var num;
            var codigo;
            var nick2;
            var nickImpostor;
            var nickTripulante;

            beforeEach(function() {
                num = 4;
                codigo = juego.crearPartida(num, nick);
                nick2 = "Javier";

                juego.unirAPartida(codigo, nick2);
                juego.unirAPartida(codigo, nick2);
                juego.unirAPartida(codigo, nick2);

                //usr.iniciarPartida();
                juego.iniciarPartida(nick, codigo);
                
                // Buscamos al impostor
                for(key in juego.partidas[codigo].usuarios) {
                    if(juego.partidas[codigo].usuarios[key].impostor) {
                        nickImpostor = key;
                        break;
                    }
                }

                // Buscamos a un tripulante
                for(key in juego.partidas[codigo].usuarios) {
                    if(!juego.partidas[codigo].usuarios[key].impostor) {
                        nickTripulante = key;
                        break;
                    }
                }

            });

            it("Se hecha al impostor (votación) y ganan los tripulantes", function() {
                //juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                juego.iniciarVotacion(nick, codigo);
                expect(juego.partidas[codigo].fase.esVotando()).toBe(true);

                // votación
                // un usuario vota a otro que no está en la partida
                //juego.partidas[codigo].usuarios["Javier"].votar("Luis");
                juego.votar("Javier", codigo, "Luis");
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(false);
                
                // votan al impostor
                //juego.partidas[codigo].usuarios["Javier"].votar(nickImpostor);
                juego.votar("Javier", codigo, nickImpostor);
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(true);
                juego.votar("Javier1", codigo, nickImpostor);
                expect(juego.partidas[codigo].usuarios["Javier1"].haVotado).toBe(true);
                juego.votar("Javier2", codigo, nickImpostor);
                expect(juego.partidas[codigo].usuarios["Javier2"].haVotado).toBe(true);
                juego.votar("Pepe", codigo, nickImpostor);
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).toBe(true);

                // comprobar votos del impostor
                expect(juego.partidas[codigo].usuarios[nickImpostor].votos).toEqual(num);
                expect(juego.partidas[codigo].masVotado() === juego.partidas[codigo].usuarios[nickImpostor]).toBe(true);
                
                // se ha hechado al impostor, termina la partida
                juego.partidas[codigo].finalizarVotacion();
                expect(juego.partidas[codigo].usuarios[nickImpostor].estado.esMuerto()).toBe(true);
                expect(juego.partidas[codigo].fase.esFinal()).toBe(true);
            });

            xit("Se hecha a tripulantes (votación) y ganan los impostores", function() {
                /* juego.partidas[codigo].usuarios[nickImpostor].atacar();
                expect(juego.partidas[codigo].numTripulantesVivos()).toBe(2);

                juego.partidas[codigo].usuarios[nickImpostor].iniciarVotacion();
                expect(juego.partidas[codigo].fase.esVotando()).toBe(true);

                juego.partidas[codigo].usuarios[nickImpostor].votar(juego.partidas[codigo].elegirTripulanteVivo().nick);
                juego.partidas[codigo].usuarios[juego.partidas[codigo].elegirTripulanteVivo().nick].votar(juego.partidas[codigo].elegirTripulanteVivo().nick);
                juego.partidas[codigo].usuarios[juego.partidas[codigo].elegirTripulanteVivo().nick].votar(juego.partidas[codigo].elegirTripulanteVivo().nick);

                juego.partidas[codigo].finalizarVotacion();
                expect(juego.partidas[codigo].fase.esFinal()).toBe(true); */
                
            })

            it("Se vota a un tripulante, es eyectado, y sigue la partida", function() {
                //juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                juego.iniciarVotacion(nick, codigo);
                expect(juego.partidas[codigo].fase.esVotando()).toBe(true);

                //juego.partidas[codigo].usuarios["Javier"].votar(nickTripulante);
                juego.votar("Javier", codigo, nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(true);
                juego.votar("Javier1", codigo, nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier1"].haVotado).toBe(true);
                juego.votar("Javier2", codigo, nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier2"].haVotado).toBe(true);
                juego.votar("Pepe", codigo, nickTripulante);
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).toBe(true);

                // Comprobar votos del tripulante
                expect(juego.partidas[codigo].usuarios[nickTripulante].votos).toEqual(num);
                expect(juego.partidas[codigo].masVotado() === juego.partidas[codigo].usuarios[nickTripulante]).toBe(true);

                juego.partidas[codigo].finalizarVotacion();
                expect(juego.partidas[codigo].usuarios[nickTripulante].estado.esMuerto()).toBe(true);
                expect(juego.partidas[codigo].fase.esJugando()).toBe(true);
            });

            it("Votación con empate, nadie es eyectado y sigue la partida", function() {
                juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                expect(juego.partidas[codigo].fase.esVotando()).toBe(true);

                juego.partidas[codigo].usuarios["Javier"].votar(nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Javier1"].votar(nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier1"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Javier2"].votar(nickImpostor);
                expect(juego.partidas[codigo].usuarios["Javier2"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Pepe"].votar(nickImpostor);
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).toBe(true);

                // Comprobar votos
                expect(juego.partidas[codigo].usuarios[nickTripulante].votos).toEqual(2);
                expect(juego.partidas[codigo].usuarios[nickImpostor].votos).toEqual(2);
                expect(juego.partidas[codigo].masVotado()).toBe(undefined);

                juego.partidas[codigo].finalizarVotacion();
                expect(juego.partidas[codigo].usuarios[nickTripulante].estado.esVivo()).toBe(true);
                expect(juego.partidas[codigo].usuarios[nickImpostor].estado.esVivo()).toBe(true);
                expect(juego.partidas[codigo].fase.esJugando()).toBe(true);
            });

            it("Votación, todos skipean, nadie es eyectado y sigue la partida", function() {
                // comprobar que los que no voten, al finalizar votación, su voto es skip y haVotado==true
                //juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                juego.iniciarVotacion(nick, codigo);
                expect(juego.partidas[codigo].fase.esVotando()).toBe(true);

                //juego.partidas[codigo].usuarios["Javier"].votar();
                juego.votarSkip("Javier", codigo);
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(true);
                expect(juego.partidas[codigo].usuarios["Javier"].skip).toBe(true);
                juego.votarSkip("Javier1", codigo);
                expect(juego.partidas[codigo].usuarios["Javier1"].haVotado).toBe(true);
                expect(juego.partidas[codigo].usuarios["Javier1"].skip).toBe(true);
                juego.votarSkip("Javier2", codigo);
                expect(juego.partidas[codigo].usuarios["Javier2"].haVotado).toBe(true);
                expect(juego.partidas[codigo].usuarios["Javier2"].skip).toBe(true);
  
                // A Pepe se le olvida votar
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).not.toBe(true);
                expect(juego.partidas[codigo].usuarios["Pepe"].skip).not.toBe(true);

                expect(juego.partidas[codigo].fase.esVotando()).toBe(true);

                // Comprobar votos
                expect(juego.partidas[codigo].masVotado()).toBe(undefined);
                juego.partidas[codigo].comprobarVotacion();
                expect(juego.partidas[codigo].usuarios["Pepe"].skip).toBe(true);
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).toBe(true);

                // Comprobar que todos siguen vivos y que seguimos jugando
                juego.partidas[codigo].finalizarVotacion();
                for(key in juego.partidas[codigo].usuarios) {
                    expect(juego.partidas[codigo].usuarios[key].estado.esVivo()).toBe(true);
                }
                expect(juego.partidas[codigo].fase.esJugando()).toBe(true);
            });
    
            it("El impostor mata hasta ganar la partida", function() {
                juego.partidas[codigo].usuarios[nickImpostor].atacar();
                expect(juego.partidas[codigo].numTripulantesVivos()).toBe(2);
                juego.partidas[codigo].usuarios[nickImpostor].atacar();
                expect(juego.partidas[codigo].numTripulantesVivos()).toBe(1);

                expect(juego.partidas[codigo].fase.esFinal()).toBe(true);
            });

        });

    });

})