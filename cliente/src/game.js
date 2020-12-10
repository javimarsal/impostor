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

//const game = new Phaser.Game(config);
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
var recursos = [{frame:0, sprite: "naruto"}, {frame:3, sprite:"bulma"}, {frame:6, sprite:"cormac"}, {frame:9, sprite:"gandalf"}]; // datos del personaje si tenemos un sprite con muchos personajes
var remotos;
var muertos;
var teclaA;
var teclaV;
var teclaT;

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

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  // player con atlas
  //player = this.physics.add
    //.sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    //.setSize(30, 40)
    //.setOffset(0, 24);
  // Comentado //player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "gabe", recursos[0].frame); // si tenemos un sprite con muchos jugadores

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  // Comentado //this.physics.add.collider(player, worldLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  /* const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-left-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-right-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-front-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-back-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  }); */
  let nombre = recursos[0].sprite;
  const anims1 = crear.anims;
    anims1.create({
      //key: nombre+"left-walk",
      key: nombre+"-left-walk",
      frames: anims1.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 12,
        end: 14,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims1.create({
      key: nombre+"-right-walk",
      frames: anims1.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 24,
        end: 26,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims1.create({
      key: nombre+"-front-walk",
      frames: anims1.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 0,
        end: 2,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims1.create({
      key: nombre+"-back-walk",
      frames: anims1.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 36,
        end: 38,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });

  nombre = recursos[1].sprite;
  const anims2 = crear.anims;
    anims2.create({
      //key: nombre+"left-walk",
      key: nombre+"-left-walk",
      frames: anims2.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 15,
        end: 17,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims2.create({
      key: nombre+"-right-walk",
      frames: anims2.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 27,
        end: 29,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims2.create({
      key: nombre+"-front-walk",
      frames: anims2.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 3,
        end: 5,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims2.create({
      key: nombre+"-back-walk",
      frames: anims2.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 39,
        end: 41,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });

  nombre = recursos[2].sprite;
  const anims3 = crear.anims;
    anims3.create({
      //key: nombre+"left-walk",
      key: nombre+"-left-walk",
      frames: anims3.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 18,
        end: 20,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims3.create({
      key: nombre+"-right-walk",
      frames: anims3.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 30,
        end: 32,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims3.create({
      key: nombre+"-front-walk",
      frames: anims3.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 6,
        end: 8,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims3.create({
      key: nombre+"-back-walk",
      frames: anims3.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 42,
        end: 44,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
  nombre = recursos[3].sprite;
  const anims4 = crear.anims;
    anims4.create({
      //key: nombre+"left-walk",
      key: nombre+"-left-walk",
      frames: anims4.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 21,
        end: 23,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims4.create({
      key: nombre+"-right-walk",
      frames: anims4.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 33,
        end: 35,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims4.create({
      key: nombre+"-front-walk",
      frames: anims4.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 9,
        end: 11,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims4.create({
      key: nombre+"-back-walk",
      frames: anims4.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 45,
        end: 47,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });

  //const camera = this.cameras.main;
  //camera.startFollow(player);
  //camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = crear.input.keyboard.createCursorKeys(); // usa el teclado
  remotos = crear.add.group(); // grupo que tiene todos los usuarios remotos
  muertos = crear.add.group();
  teclaA = crear.input.keyboard.addKey('a');
  teclaV = crear.input.keyboard.addKey('v');
  teclaT = crear.input.keyboard.addKey('t');
  lanzarJugador(ws.nick, ws.numJugador);
  ws.estoyDentro();

  // Help text that has a "fixed" position on the screen
  /* this.add
    .text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30); */

  // Debug graphics
  /* this.input.keyboard.once("keydown_D", event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  }); */
}

function crearColision() {
  if(crear && ws.impostor) { // solo para el impostor
    crear.physics.add.overlap(player, remotos, kill); // player es el jugador local
  }
}

function kill(sprite, inocente) { //sprite es el impostor
  // dibujar el inocente muerto
  // avisar del ataque
  var nick = inocente.nick;
  if(teclaA.isDown) {
    ws.atacar(nick);
  }
}

function dibujarMuereInocente(inocente) {
  var x = jugadores[inocente].x;
  var y = jugadores[inocente].y;
  var numJugador = jugadores[inocente].numJugador;

  //dibujar el sprite tumbado o...
  var muerto = crear.physics.add.sprite(x, y, "muertos", recursos[numJugador].frame);
  //meter el sprite en el grupo muertos
  muertos.add(muerto); //se agrega el sprite muerto
  
  //crear la función que gestiona la colisión entre vivos y muertos
  crear.physics.add.overlap(player, muertos, votacion);
}


function votacion(sprite, muerto) {
  //comprobar si el jugador local pulsa "v" para empezar la votación
  //en ese caso, llamamos al servidor para lanzar votación
  if(teclaV.isDown) {
    ws.iniciarVotacion();
  }
}


function tareas(sprite, tarea) { // objeto tarea con el que colisiona
  // ¿el jugador puede realizar la tarea?
  // en tal caso, permitir realizar la tarea
  // dibujar la tarea
  tarea.nombre = "jardines";
  if(ws.encargo == tarea.nombre) {
    console.log("realizar tarea " + ws.encargo);
    ws.realizarTarea();
  }
}


function lanzarJugador(nick, numJugador) {
  player = crear.physics.add.sprite(spawnPoint.x, spawnPoint.y, "gabe", recursos[numJugador].frame);
  // Watch the player and worldLayer for collisions, for the duration of the scene:
  crear.physics.add.collider(player, worldLayer);
  crear.physics.add.collider(player, capaTareas, tareas);
  //crear.physics.add.collider(player2, worldLayer);
  jugadores[nick] = player;
  jugadores[nick].nick = nick;
  jugadores[nick].numJugador = numJugador;
  
  camera = crear.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

}

function lanzarJugadorRemoto(nick, numJugador) {
  var frame = recursos[numJugador].frame;
  jugadores[nick] = crear.physics.add.sprite(spawnPoint.x+15*numJugador, spawnPoint.y, "gabe", frame);
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
  var remoto = jugadores[nick];
  const speed = 175;
  const nombre = recursos[numJugador].sprite;
  if(remoto) {
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



function update(time, delta) {
  var direccion = "stop";
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  const nombre = recursos[ws.numJugador].sprite;

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
