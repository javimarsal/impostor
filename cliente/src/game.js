/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

function lanzarJuego() {
  cw.limpiar();
  game = new Phaser.Game(config);
}


const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game;
let cursors;
var player;
var jugadores = {}; // colección de jugadores remotos, el que crea la partida no se incluye
let showDebug = false;
let camera;
var worldLayer;
var capaTareas;
let map;
var crear;
var spawnPoint;
var recursos = [{frame:0, frameMuerto:0, sprite: "naruto"}, {frame:3, frameMuerto:3, sprite:"bulma"}, {frame:6, frameMuerto:6, sprite:"cormac"}, {frame:9, frameMuerto:9, sprite:"gandalf"}, {frame:48, frameMuerto:12, sprite:"abuelita"}, {frame:51, frameMuerto:15, sprite:"campanilla"}, {frame:54, frameMuerto:18, sprite:"piruja"}, {frame:57, frameMuerto:21, sprite:"baluba"}, {frame:96, frameMuerto:24, sprite:"sensei"}, {frame:99, frameMuerto:27, sprite:"colonia"}]; // datos del personaje si tenemos un sprite con muchos personajes
var remotos;
var muertos;
var teclaA;
var teclaV;
var teclaT;
var tareasOn = true;
var ataquesOn = true;
var final = false;


function preload() {
  this.load.image("tiles", "cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/tuxemon-town.json");

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  //this.load.atlas("atlas", "cliente/assets/atlas/atlas.png", "cliente/assets/atlas/atlas.json");
  this.load.spritesheet("gabe","cliente/assets/images/personajes.png",{frameWidth:32,frameHeight:32});
  // hoja para los muertos
  this.load.spritesheet("muertos","cliente/assets/images/muertos.png",{frameWidth:32,frameHeight:32});
  //repetir esto por cada personaje diferente
}

function create() {
  crear = this;
  map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
  worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  capaTareas = map.createStaticLayer("capaTareas", tileset, 0, 0);
  const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true }); // los sprites colisionan en esta capa
  capaTareas.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  
  let nombre = recursos[0].sprite;
  const anims1 = crear.anims;
    anims1.create({
      key: nombre+"-left-walk",
      frames: anims1.generateFrameNames("gabe", {
        start: 12,
        end: 14,
      }),
      repeat: -1
    });
    anims1.create({
      key: nombre+"-right-walk",
      frames: anims1.generateFrameNames("gabe", {
        start: 24,
        end: 26,
      }),
      repeat: -1
    });
    anims1.create({
      key: nombre+"-front-walk",
      frames: anims1.generateFrameNames("gabe", {
        start: 0,
        end: 2,
      }),
      repeat: -1
    });
    anims1.create({
      key: nombre+"-back-walk",
      frames: anims1.generateFrameNames("gabe", {
        start: 36,
        end: 38,
      }),
      repeat: -1
    });

  nombre = recursos[1].sprite;
  const anims2 = crear.anims;
    anims2.create({
      key: nombre+"-left-walk",
      frames: anims2.generateFrameNames("gabe", {
        start: 15,
        end: 17,
      }),
      repeat: -1
    });
    anims2.create({
      key: nombre+"-right-walk",
      frames: anims2.generateFrameNames("gabe", {
        start: 27,
        end: 29,
      }),
      repeat: -1
    });
    anims2.create({
      key: nombre+"-front-walk",
      frames: anims2.generateFrameNames("gabe", {
        start: 3,
        end: 5,
      }),
      repeat: -1
    });
    anims2.create({
      key: nombre+"-back-walk",
      frames: anims2.generateFrameNames("gabe", {
        start: 39,
        end: 41,
      }),
      repeat: -1
    });

  nombre = recursos[2].sprite;
  const anims3 = crear.anims;
    anims3.create({
      key: nombre+"-left-walk",
      frames: anims3.generateFrameNames("gabe", {
        start: 18,
        end: 20,
      }),
      repeat: -1
    });
    anims3.create({
      key: nombre+"-right-walk",
      frames: anims3.generateFrameNames("gabe", {
        start: 30,
        end: 32,
      }),
      repeat: -1
    });
    anims3.create({
      key: nombre+"-front-walk",
      frames: anims3.generateFrameNames("gabe", {
        start: 6,
        end: 8,
      }),
      repeat: -1
    });
    anims3.create({
      key: nombre+"-back-walk",
      frames: anims3.generateFrameNames("gabe", {
        start: 42,
        end: 44,
      }),
      repeat: -1
    });
  
  nombre = recursos[3].sprite;
  const anims4 = crear.anims;
    anims4.create({
      key: nombre+"-left-walk",
      frames: anims4.generateFrameNames("gabe", {
        start: 21,
        end: 23,
      }),
      repeat: -1
    });
    anims4.create({
      key: nombre+"-right-walk",
      frames: anims4.generateFrameNames("gabe", {
        start: 33,
        end: 35,
      }),
      repeat: -1
    });
    anims4.create({
      key: nombre+"-front-walk",
      frames: anims4.generateFrameNames("gabe", {
        start: 9,
        end: 11,
      }),
      repeat: -1
    });
    anims4.create({
      key: nombre+"-back-walk",
      frames: anims4.generateFrameNames("gabe", {
        start: 45,
        end: 47,
      }),
      repeat: -1
    });

  nombre = recursos[4].sprite;
  const anims5 = crear.anims;
    anims5.create({
      key: nombre+"-left-walk",
      frames: anims5.generateFrameNames("gabe", {
        start: 60,
        end: 62,
      }),
      repeat: -1
    });
    anims5.create({
      key: nombre+"-right-walk",
      frames: anims5.generateFrameNames("gabe", {
        start: 72,
        end: 74,
      }),
      repeat: -1
    });
    anims5.create({
      key: nombre+"-front-walk",
      frames: anims5.generateFrameNames("gabe", {
        start: 48,
        end: 50,
      }),
      repeat: -1
    });
    anims5.create({
      key: nombre+"-back-walk",
      frames: anims5.generateFrameNames("gabe", {
        start: 84,
        end: 86,
      }),
      repeat: -1
    });

  nombre = recursos[5].sprite;
  const anims6 = crear.anims;
    anims6.create({
      key: nombre+"-left-walk",
      frames: anims6.generateFrameNames("gabe", {
        start: 63,
        end: 65,
      }),
      repeat: -1
    });
    anims6.create({
      key: nombre+"-right-walk",
      frames: anims6.generateFrameNames("gabe", {
        start: 75,
        end: 77,
      }),
      repeat: -1
    });
    anims6.create({
      key: nombre+"-front-walk",
      frames: anims6.generateFrameNames("gabe", {
        start: 51,
        end: 53,
      }),
      repeat: -1
    });
    anims6.create({
      key: nombre+"-back-walk",
      frames: anims6.generateFrameNames("gabe", {
        start: 87,
        end: 89,
      }),
      repeat: -1
    });

  nombre = recursos[6].sprite;
  const anims7 = crear.anims;
    anims7.create({
      key: nombre+"-left-walk",
      frames: anims7.generateFrameNames("gabe", {
        start: 66,
        end: 68,
      }),
      repeat: -1
    });
    anims7.create({
      key: nombre+"-right-walk",
      frames: anims7.generateFrameNames("gabe", {
        start: 78,
        end: 80,
      }),
      repeat: -1
    });
    anims7.create({
      key: nombre+"-front-walk",
      frames: anims7.generateFrameNames("gabe", {
        start: 54,
        end: 56,
      }),
      repeat: -1
    });
    anims7.create({
      key: nombre+"-back-walk",
      frames: anims7.generateFrameNames("gabe", {
        start: 90,
        end: 92,
      }),
      repeat: -1
    });

  nombre = recursos[7].sprite;
  const anims8 = crear.anims;
    anims8.create({
      key: nombre+"-left-walk",
      frames: anims8.generateFrameNames("gabe", {
        start: 69,
        end: 71,
      }),
      repeat: -1
    });
    anims8.create({
      key: nombre+"-right-walk",
      frames: anims8.generateFrameNames("gabe", {
        start: 81,
        end: 83,
      }),
      repeat: -1
    });
    anims8.create({
      key: nombre+"-front-walk",
      frames: anims8.generateFrameNames("gabe", {
        start: 57,
        end: 59,
      }),
      repeat: -1
    });
    anims8.create({
      key: nombre+"-back-walk",
      frames: anims8.generateFrameNames("gabe", {
        start: 93,
        end: 95,
      }),
      repeat: -1
    });

  nombre = recursos[8].sprite;
  const anims9 = crear.anims;
    anims9.create({
      key: nombre+"-left-walk",
      frames: anims9.generateFrameNames("gabe", {
        start: 108,
        end: 110,
      }),
      repeat: -1
    });
    anims9.create({
      key: nombre+"-right-walk",
      frames: anims9.generateFrameNames("gabe", {
        start: 120,
        end: 122,
      }),
      repeat: -1
    });
    anims9.create({
      key: nombre+"-front-walk",
      frames: anims9.generateFrameNames("gabe", {
        start: 96,
        end: 98,
      }),
      repeat: -1
    });
    anims9.create({
      key: nombre+"-back-walk",
      frames: anims9.generateFrameNames("gabe", {
        start: 132,
        end: 134,
      }),
      repeat: -1
    });

  nombre = recursos[9].sprite;
  const anims10 = crear.anims;
    anims10.create({
      key: nombre+"-left-walk",
      frames: anims10.generateFrameNames("gabe", {
        start: 111,
        end: 113,
      }),
      repeat: -1
    });
    anims10.create({
      key: nombre+"-right-walk",
      frames: anims10.generateFrameNames("gabe", {
        start: 123,
        end: 125,
      }),
      repeat: -1
    });
    anims10.create({
      key: nombre+"-front-walk",
      frames: anims10.generateFrameNames("gabe", {
        start: 99,
        end: 101,
      }),
      repeat: -1
    });
    anims10.create({
      key: nombre+"-back-walk",
      frames: anims10.generateFrameNames("gabe", {
        start: 135,
        end: 137,
      }),
      repeat: -1
    });


  cursors = crear.input.keyboard.createCursorKeys(); // usa el teclado
  remotos = crear.add.group(); // grupo que tiene todos los usuarios remotos
  muertos = crear.add.group();
  teclaA = crear.input.keyboard.addKey('a');
  teclaV = crear.input.keyboard.addKey('v');
  teclaT = crear.input.keyboard.addKey('t');
  lanzarJugador(ws.nick, ws.numJugador);
  ws.estoyDentro();

}

function crearColision() {
  if(crear && ws.impostor) { // solo para el impostor
    crear.physics.add.overlap(player, remotos, kill, ()=>{return ataquesOn}); // player es el jugador local
  }
}

function kill(sprite, inocente) { //sprite es el impostor, inocente(igual se llama victima)
  // dibujar el inocente muerto
  // avisar del ataque
  var nick = inocente.nick;

  if(teclaA.isDown) {
    ataquesOn = false;
    ws.atacar(nick);
    //jugadores[nick].visible = false;
  }
}

function dibujarMuereInocente(inocente) {
  var x = jugadores[inocente].x;
  var y = jugadores[inocente].y;
  var numJugador = jugadores[inocente].numJugador;
  //dibujar el sprite tumbado o...
  var muerto = crear.physics.add.sprite(x, y, "muertos", recursos[numJugador].frameMuerto);
  //meter el sprite en el grupo muertos
  muertos.add(muerto); //se agrega el sprite muerto
  //crear la función que gestiona la colisión entre vivos y muertos
  crear.physics.add.overlap(player, muertos, votacion);
  jugadores[inocente].visible = false;
}

function visibleTrue(inocente) {
  jugadores[inocente].visible = true;
}

function visibleFalse(inocente) {
  jugadores[inocente].visible = false;
}

function votacion(sprite, muerto) {
  //comprobar si el jugador local pulsa "v" para empezar la votación
  //en ese caso, llamamos al servidor para lanzar votación
  if(teclaV.isDown) {
    ws.iniciarVotacion();
  }
}


function tareas(sprite, objeto) { // objeto, tarea con el que colisiona
  if(ws.encargo == objeto.properties.tarea && teclaT.isDown) {
    tareasOn = false; // Es como un semáforo. Para que cuando pulsemos la T muchas veces, no se habrán más modales
    // tareasOn, poner a true cuando acabe o al cerrar el modal de la tarea
    console.log("realizar tarea " + ws.encargo);
    ws.realizarTarea(); // o hacer la llamada desde cw, cuando se cierre el modal
    cw.mostrarModalTarea(ws.encargo);
    //var estadoPartida = juego.getEstadoPartida(ws.codigo);
  }

  
  /* if(estadoPartida.esFinal()) {
    juego.terminarPartida();
  } */
}


function lanzarJugador(nick, numJugador) {
  var x = spawnPoint.x + numJugador*32 + 2; // 32, ancho del sprite
  player = crear.physics.add.sprite(x, spawnPoint.y, "gabe", recursos[numJugador].frame);
  // Watch the player and worldLayer for collisions, for the duration of the scene:
  crear.physics.add.collider(player, worldLayer);
  crear.physics.add.collider(player, capaTareas, tareas, ()=>{return tareasOn});
  //crear.physics.add.collider(player2, worldLayer);
  jugadores[nick] = player;
  jugadores[nick].nick = nick;
  jugadores[nick].numJugador = numJugador;
  
  camera = crear.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  camera.setZoom(2.5);

}

function lanzarJugadorRemoto(nick, numJugador) {
  var x = spawnPoint.x + numJugador*32 + 2;
  var frame = recursos[numJugador].frame;
  jugadores[nick] = crear.physics.add.sprite(x+15*numJugador, spawnPoint.y, "gabe", frame);
  crear.physics.add.collider(jugadores[nick], worldLayer); // el sprite colisiona con la capa "worldLayer"
  jugadores[nick].nick = nick;
  jugadores[nick].numJugador = numJugador;
  remotos.add(jugadores[nick]);
}

function mover(datos) {
  var direccion = datos.direccion;
  var nick = datos.nick;
  var numJugador = datos.numJugador;
  var x = datos.x;
  var y = datos.y;
  
  if(jugadores[nick]) {
    jugadores[nick].visible = true;
  }
  
  var remoto  = jugadores[nick];
  
  const speed = 85;
  const nombre = recursos[numJugador].sprite;
 
  if(remoto && !final/* && datos.estado == "vivo"*/) {
    const prevVelocity = remoto.body.velocity.clone();
    remoto.body.setVelocity(0);
    remoto.setX(x);
    remoto.setY(y);
    remoto.body.velocity.normalize().scale(speed);
    if (direccion=="left") {
      remoto.anims.play(nombre+"-left-walk", true);
    } else if (direccion=="right") {
      remoto.anims.play(nombre+"-right-walk", true);
    } else if (direccion=="up") {
      remoto.anims.play(nombre+"-back-walk", true);
    } else if (direccion=="down") {
      remoto.anims.play(nombre+"-front-walk", true);
    } else {
      remoto.anims.stop();
    }
  }

}

function finPartida(data) {
  final = true;
  //remoto = undefined;
  cw.mostrarModalFinal(data + " Fin de la partida.");
}

function jugadorAbandona(nick) {
  cw.mostrarModalSimple("Jugador " + nick + " abandona.");
  if(jugadores[nick]) {
    jugadores[nick].destroy();
    delete jugadores[nick];
  }
  
}


function update(time, delta) {
  var direccion = "stop";
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  const nombre = recursos[ws.numJugador].sprite;
  if(!final) {
  
    // Stop any previous movement from the last frame
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
      player.body.setVelocityX(-speed);
      direccion = "left";
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(speed);
      direccion = "right";
    }

    // Vertical movement
    if (cursors.up.isDown) {
      player.body.setVelocityY(-speed);
      direccion = "up";
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(speed);
      direccion = "down";
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    ws.movimiento(direccion, player.x, player.y);
    // Update the animation last and give left/right animations precedence over up/down animations
    if (cursors.left.isDown) {
      player.anims.play(nombre + "-left-walk", true);
    } else if (cursors.right.isDown) {
      player.anims.play(nombre + "-right-walk", true);
    } else if (cursors.up.isDown) {
      player.anims.play(nombre + "-back-walk", true);
    } else if (cursors.down.isDown) {
      player.anims.play(nombre + "-front-walk", true);
    } else {
      player.anims.stop();

      
      // If we were moving, pick and idle frame to use
      /* if (prevVelocity.x < 0) player.setTexture("gabe", "gabe-left-walk");
      else if (prevVelocity.x > 0) player.setTexture("gabe", "gabe-right-walk");
      else if (prevVelocity.y < 0) player.setTexture("gabe", "gabe-back-walk");
      else if (prevVelocity.y > 0) player.setTexture("gabe", "gabe-front-walk"); */
    }
  }
}
