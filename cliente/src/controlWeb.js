function ControlWeb($) {
    this.mostrarCrearPartida = function() {
        var cadena = '<div id="mostrarCrearPartida">';
        cadena = cadena + '<div class="form-group">';
        cadena = cadena +    '<label for="nick">Nick:</label>';
        cadena = cadena +    '<input type="text" class="form-control" id="nick">';
        cadena = cadena + '</div>';
        cadena = cadena + '<div class="form-group">';
        cadena = cadena +    '<label for="num">Número:</label>';
        cadena = cadena +    '<input type="number" min="2" max="10" value="2" class="form-control" id="num">';
        cadena = cadena + '</div>';
        cadena = cadena + '<button type="button" class="btn btn-success" id="btnCrearPartida">Crear Partida</button>';
        cadena = cadena + '</div>';

        $('#crearPartida').append(cadena);

        $('#btnCrearPartida').on('click', function() {
            var nick = $('#nick').val();
            var num = $('#num').val();
            // controlar
            if(nick != "" && num != "") {
                // limpiar();
                $('#mUAP').remove();
                $('#mostrarCrearPartida').remove();
                ws.crearPartida(nick, num);
                // mostrarEsperandoRival en clienteWS
            }

        });

        
    }

    this.limpiar = function() {
        $('#mER').remove();
        //$('mostrarCP').remove(); //crear partida
        $('#mUAP').remove();
    }

    this.mostrarEsperandoRival = function(lista) {
        $('#mER').remove();
        var cadena = '<div id="mER">';
        cadena = cadena + '<h3>Esperando jugadores</h3>'
        cadena = cadena + '<img src="cliente/img/among_esperando.gif">';
        if(ws.owner) {
            cadena = cadena + '<div>';
            cadena = cadena + '<button type="button" class="btn btn-primary" id="btnIniciarPartida">Iniciar Partida</button>';
            cadena = cadena + '</div>';
        }
        cadena = cadena + '</div>';

        $('#esperando').append(cadena); // siempre delante de los botones

        $('#btnIniciarPartida').on('click', function() {
            $('#nuevosJugadores').remove();
            nick = ws.nick;
            codigo = ws.codigo;
            ws.iniciarPartida(nick, codigo);
            // se limpiar al lanzarJuego()
        });

        // Mostrar lista de jugadores Arreglar.
        // tomar el codigo que tiene el cliente ws, para acceder a la partida
        // ws.codigo
        /* var cadena = cadena + '<div id="mLJ" class="col-md-6">';
        cadena = cadena + '<ul class="list-group">';
        if(lista) {
            for(var i=0; i<lista.length; i++) {
                cadena = cadena + '<li class="list-group-item">' + lista[i].nickJugador + '</li>';
            }
            cadena = cadena + '</ul>';
            cadena = cadena + '</div>';
        } */
        

    }

    this.mostrarAvisoNuevoJugador = function(nick) {
        cadena = '<li class="list-group-item">' + nick + ' se ha unido</li>';
        $('#nuevosJugadores').append(cadena);

        $("li").on('click', function() {
            $(this).hide();
        });
    }

    this.mostrarUnirAPartida = function(lista) {
        $('#mUAP').remove();
        var cadena = '<div id="mUAP">';
        cadena = cadena + '<div class="list-group">';

        // muestra la lista de partidas creadas
        for(var i=0; i<lista.length; i++) {
            cadena = cadena + '<a href="#" value="' + lista[i].codigo + '" class="list-group-item">' + lista[i].codigo + ' <span class="badge badge-primary">' + lista[i].huecos + '/' + lista[i].maximo + '</span> </a>';
        }
        cadena = cadena + '</div>';
        cadena = cadena + '<button type="button" class="btn btn-primary" id="btnUnir">Unir a Partida</button>';
        cadena = cadena + '</div>';
        $('#unirAPartida').append(cadena);

        var StoreValue = [];
        $(".list-group a").click(function(){ // elementos del list-group en el que ha hecho click
            StoreValue = []; //clear array
            StoreValue.push($(this).attr("value")); // add text to array
        });

        $('#btnUnir').on('click', function() {
            var nick = $('#nick').val();
            var codigo = StoreValue[0];
            // controlar
            if(nick != "" && codigo != null) {
                $('#mUAP').remove();
                $('#mostrarCrearPartida').remove();
            }
            
            ws.unirAPartida(nick, codigo);
            // mostrarEsperandoRival en clienteWS
        });
    }
}