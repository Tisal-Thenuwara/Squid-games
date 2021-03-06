//Creates a scene
const scene = new THREE.Scene();

//Creates a camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

//Adds it to our page
document.body.appendChild( renderer.domElement );

//adds background color
renderer.setClearColor( 0xb7c3f3, 1);

//Adds light to the scene since we cant see anything without light
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light )

//global variables
const start_position = 3;
const end_position = -start_position;
//manipulates the text
const text = document.querySelector(".text");
//time limit for the game
const TIMIT_LIMIT = 10;
//game status is handled here
let gamestat = "loading";
//this checks if the doll is looking back
let isLookingBackward = true;

//This function takes size, position, rotation and color
function createCube(size, positionX, rotY = 0, color = 0xfbc851)
{
    //Adds a cube to the scene
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d );
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube;
}

camera.position.z = 5;

//loads the doll file in models folder
const loader = new THREE.GLTFLoader()

//delays when called by specified amount
function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

//class called Doll to contain methods
class Doll
{
    //moved doll loader code here
    constructor()
    {
        loader.load("../models/scene.gltf", (gltf) =>
        {
            scene.add(gltf.scene);
            //scales the doll to a smaller size
            gltf.scene.scale.set(.4, .4, .4);
            //positions doll in center
            gltf.scene.position.set(0, -1, 0);
            this.doll = gltf.scene;
        })
    }

    //This will make the doll look back
    lookBackward()
    {
        // this.doll.rotation.y = -3.15;
        //using gsap to animate it smoothly
        gsap.to(this.doll.rotation, {y: -3.15, duration: .45})

        //doll is looking back
        setTimeout(() => isLookingBackward = true, 150)
    }

    //This will make the doll look forward
    lookForward()
    {
        // this.doll.rotation.y = 0;
        gsap.to(this.doll.rotation, {y: 0, duration: .45})

        // doll is looking forward
        setTimeout(() => isLookingBackward = false, 450)
    }

    //starts the doll
    async start()
    {
        //adding Math.random causes doll to glitch
        this.lookBackward()
        await delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await delay((Math.random() * 750) + 750)
        //This is a recursive function
        this.start();
    }
}

//This creates the track that players will have to cross
function createTrack()
{
    //3 cubes for the track
    createCube({w: start_position * 2 + .2, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1;
    createCube({w: .2, h: 1.5, d: 1}, start_position, -.35);
    createCube({w: .2, h: 1.5, d: 1}, end_position, .35);
    
}

createTrack();

//player class 
class Player
{
    constructor()
    {
        //uses a sphere instead of cube
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1;
        sphere.position.x = start_position;
        scene.add( sphere );
        this.player = sphere;
        this.playerInfo = 
        {
            positionX: start_position,
            velocity: 0
        }
    }

    //Increases velocity making player run
    run() 
    {
        this.playerInfo.velocity = .01
    }

    //Updates player info for the game
    update()
    {
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
        this.check();
    }

    //Decreses velocity making player stop
    stop()
    {
        // this.playerInfo.velocity = 0;
        gsap.to(this.playerInfo, {velocity: 0, duration: .1})
    }

    check()
    {
        if(this.playerInfo.velocity > 0 && !isLookingBackward)
        {
            // alert("you lost!")
            text.innerText = "You lose!"
            gamestat = "over"
        }

        if(this.playerInfo.positionX < end_position + .4)
        {
            // alert("you won!")
            text.innerText = "You win!"
            gamestat = "over"
        }
    }
}

//creates new player
const player = new Player()

//creates new doll
let doll = new Doll();

//initaites the game
async function init()
{
    await delay(500)
    //changes loading text
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "Gooo!!!!"
    //starts the game
    startgame()
    await delay(1000)
    text.innerText = "";
}

//calls the doll class and starts the game
function startgame()
{
    gamestat = "started";
    let progressBar = createCube({w: 5,h: .1, d: 1}, 0)
    progressBar.position.y = 3.35;
    gsap.to(progressBar.scale, {x: 0, duration: TIMIT_LIMIT, ease: "none"})
    doll.start()
    setTimeout(() => {
        if(gamestat != "over"){
            text.innerText = "You ran out"
            gamestat = "over"
        }
    }, TIMIT_LIMIT * 1000);
}

//calls to initiate the game
init()

//time passes first so doll can load
// setTimeout(() => 
// {
//     doll.start()
// }, 1000);
//This was moved to startgame()

//look back
//creates issue. looks back before doll is created.
// doll.lookBack();

//renderer.render(scene, camera);
//This adds the cube manually

//This function calls itself perpetually
function animate() {
	requestAnimationFrame( animate );
    if(gamestat == "over") return

    //Adds rotation animation to the cube
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // cube.rotation.z += 0.01;

	renderer.render( scene, camera );
    player.update();
}
animate();

//resizes canvas when needed
window.addEventListener('resize', onwindowResize, false);

function onwindowResize()
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight)
    }

//Listner to call run() when key pressed
window.addEventListener('keydown', (e) => 
{
    if(gamestat != "started") return
    if(e.key == "ArrowUp")
    {
        player.run();
    }
    // alert(e.key)f
})

//Listner to call stop() when key released
window.addEventListener('keyup', (e) => 
{
    if (e.key == "ArrowUp")
    {
        player.stop();
    }
})