
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xff0000 );
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.0001, 1000 );

var clock = new THREE.Clock();


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

scene.add(camera);

function vecMulAndAdd(target,delta,factor){
    target.x+=delta.x*factor;
    target.y+=delta.y*factor;
    target.z+=delta.z*factor;
}

class LineSegment extends THREE.Curve{
    constructor(start,end) {
        super();
        this.start = start.clone();
        this.end = end.clone();
        this.difference = end.clone();
        this.difference.sub(start);
    }
    getPoint(t){
        var start = this.start.clone();
        var displacement = this.difference.clone();
        displacement.multiplyScalar(t);
        var result = start.add(displacement);
        return result;
    }
}

function shootLaser(start,end,color) {
    var lineSegment = new LineSegment(start,end);
    var geometry = new THREE.TubeGeometry( lineSegment, 20, 0.001, 8, true );
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);
    setTimeout(function () {
        scene.remove(mesh);
    },200);
}

var hitTargets = [];

var cornellBox = null;
var sphere = null;
var cube = null;
var jet = null;
var crosshair = null;



var movingForward = false;
var movingBackward = false;
var movingLeft = false;
var movingRight = false;

var clicked = false;

var onKeyDown = function ( event ) {
    event.preventDefault();

    switch ( event.key ) {
        case "w": // w
            movingForward = true;
            break;

        case "a": // a
            movingLeft = true;
            break;

        case "s": // s
            movingBackward = true;
            break;

        case "d": // d
            movingRight = true;
            break;

    }

};

var onKeyUp = function ( event ) {

    switch( event.key ) {

        case "w": // w
            movingForward = false;
            break;

        case "a": // a
            movingLeft = false;
            break;

        case "s": // s
            movingBackward = false;
            break;

        case "d": // d
            movingRight = false;
            break;
    }
};
function onMouseMove( event ) {
    if(!clicked) return;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;


    var factor = 0.0005;

    var up = camera.up.clone();
    up.applyQuaternion(camera.quaternion)

    var front = new THREE.Vector3();
    camera.getWorldDirection( front );
    var right = new THREE.Vector3();
    right.crossVectors(front,up);

    var newQuatY = new THREE.Quaternion();
    newQuatY.setFromAxisAngle(right,movementY* -factor);
    newQuatY.multiply(camera.quaternion);
    camera.quaternion.copy(newQuatY);

    var newQuatX = new THREE.Quaternion();
    newQuatX.setFromAxisAngle(up,movementX* -factor);
    newQuatX.multiply(camera.quaternion);
    camera.quaternion.copy(newQuatX);

    if(jet){
        var jetFactor = factor*5;
        jet.rotation.x =movementY * -jetFactor + 0.2;
        jet.rotation.z =movementX * -jetFactor;
    }
}

function onMouseDown( event ) {
    if(!clicked && event.button===0){
        document.body.requestPointerLock();
    }
    else {
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2(0,0);
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( hitTargets,true );
        if(intersects.length>0){
            console.log(intersects);
            var firstHit = intersects[0].object.parent;
            var hitPosition = new THREE.Vector3();
            hitPosition.setFromMatrixPosition(firstHit.matrixWorld);
            var firePosition = new THREE.Vector3();
            firePosition.setFromMatrixPosition(jet.matrixWorld);
            if(event.button === 0){
                shootLaser(firePosition,hitPosition,0xff0000);
                firstHit.scale.multiplyScalar(1.1);
            }
            else if(event.button === 2){
                shootLaser(firePosition,hitPosition,0x00ff00);
                firstHit.scale.multiplyScalar(0.9);
            }
        }
    }
}
function onPointerLockChange( event ) {
    clicked = !clicked;
}

document.addEventListener( 'pointerlockchange', onPointerLockChange, false );

document.addEventListener( 'mousemove', onMouseMove, false );
document.addEventListener( 'mousedown', onMouseDown, false );
document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

function randomVec3(){
    var x = Math.random()*2-1;
    var y = Math.random()*2-1;
    var z = Math.random()*2-1;
    return new THREE.Vector3(x,y,z);
}

new THREE.MTLLoader()
    .setPath("assets/")
    .load( 'CornellBox.mtl', function ( materials ) {
        materials.preload();
        new THREE.OBJLoader()
            .setPath("assets/")
            .setMaterials( materials )
            .load( 'CornellBox.obj',
            function ( object ) {
                scene.add( object );
                cornellBox = object;
                //cornellBox.scale.set(100,100,100)
            },
            );
    } );
new THREE.MTLLoader()
    .setPath("assets/sphere/")
    .load( 'sphere.mtl', function ( materials ) {
        materials.preload();
        new THREE.OBJLoader()
            .setPath("assets/sphere/")
            .setMaterials( materials )
            .load( 'sphere.obj',
                function ( object ) {
                    for(var i = 0;i<20;++i){
                        sphere = object.clone();
                        sphere.scale.set(0.1,0.1,0.1);
                        sphere.position.copy(randomVec3());
                        scene.add(sphere);
                        hitTargets.push(sphere);
                    }

                },
            );
    } );
new THREE.MTLLoader()
    .setPath("assets/cube/")
    .load( 'cube.mtl', function ( materials ) {
        materials.preload();
        new THREE.OBJLoader()
            .setPath("assets/cube/")
            .setMaterials( materials )
            .load( 'cube.obj',
                function ( object ) {
                    for(var i = 0;i<20;++i){
                        cube = object.clone();
                        cube.scale.set(0.1,0.1,0.1);
                        cube.position.copy(randomVec3());
                        scene.add(cube);
                        hitTargets.push(cube);
                    }

                },
            );
    } );
new THREE.MTLLoader()
    .setPath("assets/fighter/")
    .load( 'fighter.mtl', function ( materials ) {
        materials.preload();
        new THREE.OBJLoader()
            .setPath("assets/fighter/")
            .setMaterials( materials )
            .load( 'fighter.obj',
                function ( object ) {
                    scene.add( object );
                    jet = object;
                    jet.rotation.x=0.2;
                    jet.scale.set(0.005,0.005,0.005);
                    jet.position.set(0,-0.02,-0.1);
                    camera.add(jet);
                    //sphere.position.set(0,1,0);
                },
            );
    } );

new THREE.MTLLoader()
    .setPath("assets/crosshair/")
    .load( 'crosshair.mtl', function ( materials ) {
        materials.preload();
        new THREE.OBJLoader()
            .setPath("assets/crosshair/")
            .setMaterials( materials )
            .load( 'crosshair.obj',
                function ( object ) {
                    scene.add( object );
                    crosshair = object;
                    crosshair.scale.set(0.0005,0.0005,0.0005);
                    crosshair.position.set(0,0,-0.01);
                    camera.add(crosshair);
                    //sphere.position.set(0,1,0);
                },
            );
    } );



var ambientLight = new THREE.AmbientLight(0xFFFFFF,0.1);
scene.add(ambientLight);

var mainLight = new THREE.PointLight(0xFFFFFF,1);
mainLight.position.set(0, 0.95, 0);
mainLight.lookAt( 0, 0, 0 );
mainLight.castShadow = true;
scene.add(mainLight);


var spotLight = new THREE.SpotLight(0xFFFFFF,1,0.5,Math.PI/8,0.3);
spotLight.target.position.set(0, 0, -1);
camera.add(spotLight.target);
scene.add(spotLight);





function animate() {
    if(clicked){
        var front = new THREE.Vector3();
        camera.getWorldDirection( front );

        var speed = 0.005;
        if(movingForward){
            vecMulAndAdd(camera.position,front,speed);
        }
        if(movingBackward){
            //vecMulAndAdd(camera.position,front,-speed);
        }
        var roll = 0;
        if(movingRight){
            roll+=speed;
        }
        if(movingLeft){
            roll-=speed;
        }
        var newQuat = new THREE.Quaternion();
        newQuat.setFromAxisAngle(front,roll);
        newQuat.multiply(camera.quaternion);
        camera.quaternion.copy(newQuat);
    }

    spotLight.position.copy(camera.position);

    requestAnimationFrame( animate );
    renderer.clear();
    renderer.render( scene, camera );
}
animate();