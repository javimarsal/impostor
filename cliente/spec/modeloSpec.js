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
        var maximo;
        var minimo;

        beforeEach(function() {
            num = 4;
            codigo = usr.crearPartida(num);
            nick = "Javier";
            maximo = 10;
            minimo = 4;
        });
        
        it("Comprobar la partida", function() {
            expect(num >= juego.minimo && num <= juego.maximo).toBe(true);
            expect(codigo).not.toBe(undefined);
            expect(juego.partidas[codigo].maximo).toEqual(num);
            expect(juego.partidas[codigo].nickOwner).toEqual(usr.nick);
            expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);
            expect(Object.keys(juego.partidas[codigo].usuarios).length).toEqual(1);
        });
    
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

            var nImpostores = 0;
            for(i in juego.partidas[codigo].usuarios) {
                expect(juego.partidas[codigo].usuarios[i]).not.toEqual("ninguno");
                if(juego.partidas[codigo].usuarios[i].impostor == true) {
                    nImpostores++;
                }
            }

            expect(nImpostores == juego.partidas[codigo].numImpostores).toBe(true);

        });

        it("Pepe inicia la partida, pero ganarían los impostores", function() {
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

        xit("Todos abandonan la partida", function() {
            //ToDo
        });
    });

})