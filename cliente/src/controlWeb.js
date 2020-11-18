function ControlWeb($) {
    this.mostrarCrearPartida = function() {
        var cadena = '<div id="mostrarCrearPartida">';
        cadena = cadena + '<div class="form-group">';
        cadena = cadena +    '<label for="nick">Nick:</label>';
        cadena = cadena +    '<input type="text" class="form-control" id="nick">';
        cadena = cadena + '</div>';
        cadena = cadena + '<div class="form-group">';
        cadena = cadena +    '<label for="num">Número:</label>';
        cadena = cadena +    '<input type="text" class="form-control" id="num">';
        cadena = cadena + '</div>';
        cadena = cadena + '<button type="button" class="btn btn-primary" id="btnCrearPartida">Crear Partida</button>';
        cadena = cadena + '</div>';

        $('#crearPartida').append(cadena);

        $('#btnCrearPartida').on('click', function() {
            var nick = $('#nick').val();
            var num = $('#num').val();
            $('#mostrarCrearPartida').remove();
            ws.crearPartida(nick, num);
            // controlar
            // mostrarEsperandoRival en clienteWS
        });
    }

    this.mostrarEsperandoRival = function() {
        $('#mER').remove();
        var cadena = '<div id="mER">';
        cadena = cadena + '<img src="cliente/img/tenor.gif">';
        cadena = cadena + '</div>';
        $('#esperando').append(cadena);
    }

    this.mostrarUnirAPartida = function(lista) {
        $('#mUAP').remove();
        var cadena = '<div id="mUAP">';
        cadena = cadena + '<div class="list-group">';
        for(var i=0; i<lista.length; i++) {
            cadena = cadena + '<a href="#" value="' + lista[i].codigo + '" class="list-group-item">' + lista[i].codigo + ' huecos: ' + lista[i].huecos + '</a>';
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
            $('#mUAP').remove();
            ws.unirAPartida(nick, codigo);
            // controlar
            // mostrarEsperandoRival en clienteWS
        });
    }
}