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

    it("El usuario Pepe crea una partida de 4 jugadores", function() {
        var num = 4;
        var codigo = usr.crearPartida(num);
        
        expect(codigo).not.toBe(undefined);
        expect(juego.partidas[codigo].maximo).toEqual(num);
        expect(juego.partidas[codigo].nickOwner).toEqual(usr.nick);
        expect(juego.partidas[codigo].fase instanceof Inicial).toBe(true);
        expect(Object.keys(juego.partidas[codigo].usuarios).length).toEqual(1);
    });

    it("Varios usuarios se unen a la partida", function() {
        var num = 4;
        var codigo = usr.crearPartida(num);
        var nick = "Javier";
        juego.unirAPartida(codigo, nick);
        expect(Object.keys(juego.partidas[codigo].usuarios).length).toEqual(2);
        // comprobar cada vez que se une uno el número de usuarios y la fase
    });

    xit("Pepe inicia la partida", function() {
        // Igual que arriba, se inicia la partida al final y se comprueba la fase
    });

})