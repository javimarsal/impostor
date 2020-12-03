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
let cursors;
let player;
var jugadores = {}; // colección de jugadores remotos, el que crea la partida no se incluye
let showDebug = false;
var crear;
let camera;
var worldLayer;
let map;
var spawnPoint;
var recursos = [{frame:0, nombre: "ana"}, {frame:3, nombre:"pepe"}, {frame:6, nombre:"oliver"}, {frame:9, nombre:"chaman"}]; // datos del personaje si tenemos un sprite con muchos personajes

function preload() {
  this.load.image("tiles", "cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/tuxemon-town.json");

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  //this.load.atlas("atlas", "cliente/assets/atlas/atlas.png", "cliente/assets/atlas/atlas.json");
  this.load.spritesheet("gabe","cliente/assets/images/Male1.png",{frameWidth:32,frameHeight:32});
  this.load.spritesheet("gabe1","cliente/assets/images/Male2.png",{frameWidth:32,frameHeight:32});
  this.load.spritesheet("gabe2","cliente/assets/images/Male3.png",{frameWidth:32,frameHeight:32});
  this.load.spritesheet("gabe3","cliente/assets/images/Male4.png",{frameWidth:32,frameHeight:32});
  //repetir esto por cada personaje diferente
}

function create() {
  const map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  // player con atlas
  //player = this.physics.add
    //.sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    //.setSize(30, 40)
    //.setOffset(0, 24);
  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "gabe", recursos[0].frame); // si tenemos un sprite con muchos jugadores

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);

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
  let nombre = recursos[0].nombre;
  const anims1 = this.anims;
    anims1.create({
      //key: nombre+"left-walk",
      key: "gabe-left-walk",
      frames: anims1.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 3,
        end: 5,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims1.create({
      key: "gabe-right-walk",
      frames: anims1.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 6,
        end: 8,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims1.create({
      key: "gabe-front-walk",
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
      key: "gabe-back-walk",
      frames: anims1.generateFrameNames("gabe", {
        //prefix: "misa-left-walk.",
        start: 9,
        end: 11,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });

  const anims2 = this.anims;
    anims2.create({
      //key: nombre+"left-walk",
      key: "gabe1-left-walk",
      frames: anims2.generateFrameNames("gabe1", {
        //prefix: "misa-left-walk.",
        start: 3,
        end: 5,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims2.create({
      key: "gabe1-right-walk",
      frames: anims2.generateFrameNames("gabe1", {
        //prefix: "misa-left-walk.",
        start: 6,
        end: 8,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims2.create({
      key: "gabe1-front-walk",
      frames: anims2.generateFrameNames("gabe1", {
        //prefix: "misa-left-walk.",
        start: 0,
        end: 2,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims2.create({
      key: "gabe1-back-walk",
      frames: anims2.generateFrameNames("gabe1", {
        //prefix: "misa-left-walk.",
        start: 9,
        end: 11,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });

  const anims3 = this.anims;
    anims3.create({
      //key: nombre+"left-walk",
      key: "gabe2-left-walk",
      frames: anims3.generateFrameNames("gabe2", {
        //prefix: "misa-left-walk.",
        start: 3,
        end: 5,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims3.create({
      key: "gabe2-right-walk",
      frames: anims3.generateFrameNames("gabe2", {
        //prefix: "misa-left-walk.",
        start: 6,
        end: 8,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims3.create({
      key: "gabe2-front-walk",
      frames: anims3.generateFrameNames("gabe2", {
        //prefix: "misa-left-walk.",
        start: 0,
        end: 2,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims3.create({
      key: "gabe2-back-walk",
      frames: anims3.generateFrameNames("gabe2", {
        //prefix: "misa-left-walk.",
        start: 9,
        end: 11,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });

  const anims4 = this.anims;
    anims4.create({
      //key: nombre+"left-walk",
      key: "gabe3-left-walk",
      frames: anims4.generateFrameNames("gabe3", {
        //prefix: "misa-left-walk.",
        start: 3,
        end: 5,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims4.create({
      key: "gabe3-right-walk",
      frames: anims4.generateFrameNames("gabe3", {
        //prefix: "misa-left-walk.",
        start: 6,
        end: 8,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims4.create({
      key: "gabe3-front-walk",
      frames: anims4.generateFrameNames("gabe3", {
        //prefix: "misa-left-walk.",
        start: 0,
        end: 2,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });
    anims4.create({
      key: "gabe3-back-walk",
      frames: anims4.generateFrameNames("gabe3", {
        //prefix: "misa-left-walk.",
        start: 9,
        end: 11,
        //zeroPad: 3
      }),
      //frameRate: 10,
      repeat: -1
    });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys(); // usa el teclado
  lanzarJugador(ws.numJugador);
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

function lanzarJugador(numJugador) {
  player = crear.physics.add.sprite(spawnPoint.x, spawnPoint.y, "varios", recursos[numJugador].frame);    
  // Watch the player and worldLayer for collisions, for the duration of the scene:
  crear.physics.add.collider(player, worldLayer);
  //crear.physics.add.collider(player2, worldLayer);
  camera = crear.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

}

function lanzarJugadorRemoto(nick, numJugador) {
  var frame = recursos[numJugador].frame;
  jugadores[nick] = crear.physics.add.sprite(spawnPoint.x+15*numJugador, spawnPoint.y, "varios", frame);
  crear.physics.add.collider(jugadores[nick], worldLayer);
}

function mover(nick, x, y) {
  var remoto = jugadores[nick];
  if(remoto) {
    remoto.setX(x);
    remoto.setY(y);
  }
}

function moverRemoto(direccion, nick, numJugador) {
  var remoto = jugadores[nick];
  const speed = 175;
  const prevVelocity = remoto.body.velocity.clone();

  const nombre = recursos[numJugador].sprite;

  // Stop any previous movement from the last frame
  remoto.body.setVelocity(0);

  // Horizontal movement
  if (direccion.left.isDown) {
    remoto.body.setVelocityX(-speed);
    //ws.movimiento("left");
  } else if (direccion.right.isDown) {
    remoto.body.setVelocityX(speed);
    //ws.movimiento("right");
  }

  // Vertical movement
  if (direccion.up.isDown) {
    remoto.body.setVelocityY(-speed);
    //ws.movimiento("up");
  } else if (direccion.down.isDown) {
    remoto.body.setVelocityY(speed);
    //ws.movimiento("down");
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  remoto.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (direccion.left.isDown) {
    remoto.anims.play(nombre + "-left-walk", true);
  } else if (direccion.right.isDown) {
    remoto.anims.play(nombre + "-right-walk", true);
  } else if (direccion.up.isDown) {
    remoto.anims.play(nombre + "-back-walk", true);
  } else if (direccion.down.isDown) {
    remoto.anims.play(nombre + "-front-walk", true);
  } else {
    remoto.anims.stop();
  }
}

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  const nombre = recursos[ws.numJugador].sprite;

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
    ws.movimiento("left");
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
    ws.movimiento("right");
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
    ws.movimiento("up");
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
    ws.movimiento("down");
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

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

    ws.movimiento(player.body.x, player.body.y);
    // If we were moving, pick and idle frame to use
    /* if (prevVelocity.x < 0) player.setTexture("gabe", "gabe-left-walk");
    else if (prevVelocity.x > 0) player.setTexture("gabe", "gabe-right-walk");
    else if (prevVelocity.y < 0) player.setTexture("gabe", "gabe-back-walk");
    else if (prevVelocity.y > 0) player.setTexture("gabe", "gabe-front-walk"); */
  }
}
