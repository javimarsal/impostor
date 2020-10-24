describe("El juego del impostor", function() {
    var juego;
    var usr;
  
    beforeEach(function() {
      juego = new Juego();
      usr = new Usuario("Pepe", juego);
    });

    it("Comprueba valores iniciales del juego", function() {
        expect(Object.keys(juego.partidas).length).toEqual(0);
        expect(usr.nick).toEqual("Pepe");
        expect(usr.juego).not.toBe(undefined);
    });


    describe("El usuario Pepe crea una partida de 4 jugadores", function() {
        var num;
        var codigo;
        var nick;

        beforeEach(function() {
            num = 4;
            codigo = usr.crearPartida(num);
            nick = "Javier";
        });
        
        it("Comprobar la partida", function() {
            expect(num >= juego.minimo && num <= juego.maximo).toBe(true);
            expect(codigo).not.toBe(undefined);
            expect(juego.partidas[codigo].maximo).toEqual(num);
            expect(juego.partidas[codigo].nickOwner).toEqual(usr.nick);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);
            expect(Object.keys(juego.partidas[codigo].usuarios).length).toEqual(1);
        });

        it("No se puede crear partida si el num no está entre los límites", function() {
            // Menor que el mínimo
            var codigo = juego.crearPartida(3, usr);
            expect(codigo).toBe(undefined);
            
            // Mayor que el máximo
            var codigo = juego.crearPartida(11, usr);
            expect(codigo).toBe(undefined);
        })
    
        it("Varios usuarios se unen a la partida", function() {
            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);
            
            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);

            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase instanceof Completado).toBe(true);
        });
    
        it("Pepe inicia la partida", function() {
            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);
            
            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);

            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase instanceof Completado).toBe(true);

            usr.iniciarPartida();
            expect(juego.partidas[codigo].fase instanceof Jugando).toBe(true);

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

            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);
            
            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);

            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase instanceof Completado).toBe(true);

            usr.iniciarPartida();
            expect(juego.partidas[codigo].fase instanceof Completado).toBe(true);
        });

        it("Todos abandonan la partida", function() {
            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(2);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);
            
            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(3);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);

            juego.unirAPartida(codigo, nick);
            var nUsr = Object.keys(juego.partidas[codigo].usuarios).length;
            expect(nUsr).toEqual(4);
            expect(juego.partidas[codigo].fase instanceof Completado).toBe(true);
            
            // Revisar (funciona)
            var partida = juego.partidas[codigo];
            juego.abandonarPartida(codigo, "Javier");
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);

            juego.abandonarPartida(codigo, "Javier1");
            juego.abandonarPartida(codigo, "Javier2");
            juego.abandonarPartida(codigo, "Pepe");
            expect(partida.numJugadores() == 0).toBe(true);
            expect(juego.partidas[codigo]).toBe(undefined);
        });

        describe("Pepe inicia la partida de 4 jugadores, y se llena", function() {
            var num;
            var codigo;
            var nick;
            var nickImpostor;
            var nickTripulante;

            beforeEach(function() {
                num = 4;
                codigo = usr.crearPartida(num);
                nick = "Javier";

                juego.unirAPartida(codigo, nick);
                juego.unirAPartida(codigo, nick);
                juego.unirAPartida(codigo, nick);

                usr.iniciarPartida();
                
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
                juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                expect(juego.partidas[codigo].fase instanceof Votando).toBe(true);

                // votación
                // un usuario vota a otro que no está en la partida
                juego.partidas[codigo].usuarios["Javier"].votar("Luis");
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(false);
                
                // votan al impostor
                juego.partidas[codigo].usuarios["Javier"].votar(nickImpostor);
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Javier1"].votar(nickImpostor);
                expect(juego.partidas[codigo].usuarios["Javier1"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Javier2"].votar(nickImpostor);
                expect(juego.partidas[codigo].usuarios["Javier2"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Pepe"].votar(nickImpostor);
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).toBe(true);

                // comprobar votos del impostor
                expect(juego.partidas[codigo].usuarios[nickImpostor].votos).toEqual(num);
                expect(juego.partidas[codigo].masVotado() === juego.partidas[codigo].usuarios[nickImpostor]).toBe(true);
                
                // se ha hechado al impostor, termina la partida
                juego.partidas[codigo].finalizarVotacion();
                expect(juego.partidas[codigo].usuarios[nickImpostor].estado instanceof Muerto).toBe(true);
                expect(juego.partidas[codigo].fase instanceof Final).toBe(true);
            });

            xit("Se hecha a tripulantes (votación) y ganan los impostores", function() {
                /* juego.partidas[codigo].usuarios[nickImpostor].atacar();
                expect(juego.partidas[codigo].numTripulantesVivos()).toBe(2);

                juego.partidas[codigo].usuarios[nickImpostor].iniciarVotacion();
                expect(juego.partidas[codigo].fase instanceof Votando).toBe(true);

                juego.partidas[codigo].usuarios[nickImpostor].votar(juego.partidas[codigo].elegirTripulanteVivo().nick);
                juego.partidas[codigo].usuarios[juego.partidas[codigo].elegirTripulanteVivo().nick].votar(juego.partidas[codigo].elegirTripulanteVivo().nick);
                juego.partidas[codigo].usuarios[juego.partidas[codigo].elegirTripulanteVivo().nick].votar(juego.partidas[codigo].elegirTripulanteVivo().nick);

                juego.partidas[codigo].finalizarVotacion();
                expect(juego.partidas[codigo].fase instanceof Final).toBe(true); */
                
            })

            it("Se vota a un tripulante, es eyectado, y sigue la partida", function() {
                juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                expect(juego.partidas[codigo].fase instanceof Votando).toBe(true);

                juego.partidas[codigo].usuarios["Javier"].votar(nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Javier1"].votar(nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier1"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Javier2"].votar(nickTripulante);
                expect(juego.partidas[codigo].usuarios["Javier2"].haVotado).toBe(true);
                juego.partidas[codigo].usuarios["Pepe"].votar(nickTripulante);
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).toBe(true);

                // Comprobar votos del tripulante
                expect(juego.partidas[codigo].usuarios[nickTripulante].votos).toEqual(num);
                expect(juego.partidas[codigo].masVotado() === juego.partidas[codigo].usuarios[nickTripulante]).toBe(true);

                juego.partidas[codigo].finalizarVotacion();
                expect(juego.partidas[codigo].usuarios[nickTripulante].estado instanceof Muerto).toBe(true);
                expect(juego.partidas[codigo].fase instanceof Jugando).toBe(true);
            });

            it("Votación con empate, nadie es eyectado y sigue la partida", function() {
                juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                expect(juego.partidas[codigo].fase instanceof Votando).toBe(true);

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
                expect(juego.partidas[codigo].usuarios[nickTripulante].estado instanceof Vivo).toBe(true);
                expect(juego.partidas[codigo].usuarios[nickImpostor].estado instanceof Vivo).toBe(true);
                expect(juego.partidas[codigo].fase instanceof Jugando).toBe(true);
            });

            it("Votación, todos skipean, nadie es eyectado y sigue la partida", function() {
                // comprobar que los que no voten, al finalizar votación, su voto es skip y haVotado==true
                juego.partidas[codigo].usuarios["Javier"].iniciarVotacion();
                expect(juego.partidas[codigo].fase instanceof Votando).toBe(true);

                juego.partidas[codigo].usuarios["Javier"].votar();
                expect(juego.partidas[codigo].usuarios["Javier"].haVotado).toBe(true);
                expect(juego.partidas[codigo].usuarios["Javier"].skip).toBe(true);
                juego.partidas[codigo].usuarios["Javier1"].votar();
                expect(juego.partidas[codigo].usuarios["Javier1"].haVotado).toBe(true);
                expect(juego.partidas[codigo].usuarios["Javier1"].skip).toBe(true);
                juego.partidas[codigo].usuarios["Javier2"].votar();
                expect(juego.partidas[codigo].usuarios["Javier2"].haVotado).toBe(true);
                expect(juego.partidas[codigo].usuarios["Javier2"].skip).toBe(true);
  
                // A Pepe se le olvida votar
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).not.toBe(true);
                expect(juego.partidas[codigo].usuarios["Pepe"].skip).not.toBe(true);

                // Comprobar votos
                expect(juego.partidas[codigo].masVotado()).toBe(undefined);
                juego.partidas[codigo].comprobarVotacion();
                expect(juego.partidas[codigo].usuarios["Pepe"].skip).toBe(true);
                expect(juego.partidas[codigo].usuarios["Pepe"].haVotado).toBe(true);

                // Comprobar que todos siguen vivos y que seguimos jugando
                juego.partidas[codigo].finalizarVotacion();
                for(key in juego.partidas[codigo].usuarios) {
                    expect(juego.partidas[codigo].usuarios[key].estado instanceof Vivo).toBe(true);
                }
                expect(juego.partidas[codigo].fase instanceof Jugando).toBe(true);
            });
    
            it("El impostor mata hasta ganar la partida", function() {
                juego.partidas[codigo].usuarios[nickImpostor].atacar();
                expect(juego.partidas[codigo].numTripulantesVivos()).toBe(2);
                juego.partidas[codigo].usuarios[nickImpostor].atacar();
                expect(juego.partidas[codigo].numTripulantesVivos()).toBe(1);

                expect(juego.partidas[codigo].fase instanceof Final).toBe(true);
            });

        });

    });

})