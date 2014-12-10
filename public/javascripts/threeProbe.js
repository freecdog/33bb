/**
 * Created by jaric on 09.12.2014.
 */

// http://threejs.org/docs/#Reference/Core/BufferGeometry — most useful link
// http://stackoverflow.com/questions/10330342/threejs-assign-different-colors-to-each-vertex-in-a-geometry
// http://www.smartjava.org/content/all-109-examples-my-book-threejs-threejs-version-r63

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {

        var threeProbe = {};

        function start(){
            var BB = require('BB');
            var data = new BB.Datatone();

            var THREE = require('THREE');
            var Stats = require('Stats');
            var dat = require('dat');   // dat.GUI

            if (!THREE) {
                console.error('there is no three.js: ', THREE);
            }

            console.log('have THREE:', THREE, BB, data);

            var stats = initStats();

            var scene = new THREE.Scene();
            var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000); //PerspectiveCamera( 75, 400.0 / 300.0, 0.1, 1000 );
            //var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
            camera.position.z = 10;

            var renderer = new THREE.WebGLRenderer();
            renderer.setSize( 400, 300 );
            //renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );

            var geometry = new THREE.BufferGeometry();
            var vertexPositions = [
                [ 0.0, 0.0,  1.0],
                [ 0.5, -0.50,  1.0],
                [ -0.5, -0.5,  1.0]
            ];
//            var vertexPositions = [
//                [-1.0, -1.0,  1.0],
//                [ 1.0, -1.0,  1.0],
//                [ 1.0,  1.0,  1.0],
//
//                [ 1.0,  1.0,  1.0],
//                [-1.0,  1.0,  1.0],
//                [-1.0, -1.0,  1.0]
//            ];
            var vertices = new Float32Array( vertexPositions.length * 3 ); // three components per vertex
            var colors = new Float32Array( vertexPositions.length * 3 );

            for ( var i = 0; i < vertexPositions.length; i++ )
            {
                vertices[ i*3 + 0 ] = vertexPositions[i][0];
                vertices[ i*3 + 1 ] = vertexPositions[i][1];
                vertices[ i*3 + 2 ] = vertexPositions[i][2];

                if (i % 2 == 0){
                    colors[ i*3 ]     = 0;
                    colors[ i*3 + 1 ] = 1;
                    colors[ i*3 + 2 ] = 0;
                } else {
                    colors[ i*3 ]     = 0;
                    colors[ i*3 + 1 ] = 0;
                    colors[ i*3 + 2 ] = 1;
                }
            }

            geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

            geometry.computeBoundingSphere();

            geometry.dynamic = true;

            var material = new THREE.MeshBasicMaterial( {
                //color: 0xffffff, // also if set color to 0xbbbbbb brightness will be smaller
                vertexColors: THREE.VertexColors,
                side: THREE.DoubleSide  // if there is only front side it may be rotated with backside (and become invisible)
            } );
            var mesh = new THREE.Mesh( geometry, material );
            scene.add(mesh);

            var haveTask = false;
            var task = function(vertex){
                console.log(2);

                //mesh.geometry.attributes.color.array[vertex] = 1;
                //renderer.updateObject();

                haveTask = false;
            };

            var render = function () {
                stats.update();

                requestAnimationFrame(render, scene);

                /*for ( var i = 0; i < vertexPositions.length; i++ )
                {
                    colors[ i*3 ]     = Math.random();
                    colors[ i*3 + 1 ] = Math.random();
                    colors[ i*3 + 2 ] = Math.random();
                }*/

                //mesh.rotation.z -=0.1;

                //mesh.geometry.attributes.color.array[0] = Math.random();
                //mesh.geometry.colorsNeedUpdate = true;
                //if (haveTask) task();
//                task();
//
//                scene.children[0].geometry.attributes.color.array[0] = Math.random();
//                scene.children[0].geometry.attributes.color.array[1] = Math.random();
//                scene.children[0].geometry.attributes.color.array[2] = Math.random();
//                scene.children[0].geometry.verticesNeedUpdate = true;
//                scene.children[0].geometry.colorsNeedUpdate = true;

                // TODO coords don't change, colors too.
                // Raw shader (may be take a look on old backbone version)
                // https://github.com/mrdoob/three.js/issues/4518
                // https://github.com/mrdoob/three.js/commit/60bf8fbf975de1fce1716a63debfa3f8cbb8e180

                geometry.attributes.position.array[4].x = Math.random()*2 - 1;
                geometry.verticesNeedUpdate = true;
                geometry.elementsNeedUpdate = true;
                geometry.uvsNeedUpdate = true;
                geometry.normalsNeedUpdate = true;
                geometry.tangentsNeedUpdate = true;
                geometry.colorsNeedUpdate = true;
                geometry.morphTargetsNeedUpdate = true;

                //cube.rotation.x += 0.029;
                //cube.rotation.y += 0.0125;

                renderer.render(scene, camera);
            };

            var controls = new function () {
                // we need the first child, since it's a multimaterial


                this.width = 0;
                this.height = 0;

                this.widthSegments = 0;
                this.heightSegments = 0;

                this.redraw = function () {
                    // remove the old plane
                    //scene.remove(plane);
                    // create a new one
                    //plane = createMesh(new THREE.PlaneGeometry(controls.width, controls.height, Math.round(controls.widthSegments), Math.round(controls.heightSegments)));
                    // add it to the scene.
                    //scene.add(plane);

                    console.warn(1);
                    //mesh.geometry.attributes.color.array[0] = 1;
                    //mesh.geometry.colorsNeedUpdate = true;

                    haveTask = true;
                };
            };

            var gui = new dat.GUI();
            gui.add(controls, 'width', 0, 40).onChange(controls.redraw);
            gui.add(controls, 'height', 0, 40).onChange(controls.redraw);
            gui.add(controls, 'widthSegments', 0, 10).onChange(controls.redraw);
            gui.add(controls, 'heightSegments', 0, 10).onChange(controls.redraw);

            render();

            function initStats() {

                var stats = new Stats();
                stats.setMode(1); // 0: fps, 1: ms

                // Align top-left
                //stats.domElement.style.position = 'absolute';
                //stats.domElement.style.left = '0px';
                //stats.domElement.style.top = '0px';

                document.getElementById('Stats-output').appendChild(stats.domElement);
                //$("#Stats-output").append(stats.domElement);

                return stats;
            }


        }
        threeProbe.start = start;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = threeProbe;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return threeProbe;
            });
        }
        // included directly via <script> tag
        else {
            root.threeProbe = threeProbe;
        }

    }());

});

/*
(function(THREE, BB){
    if (!THREE) {
        console.error('there is no three.js: ', THREE);
    }

    console.log('have three', THREE, BB);

    var stats = initStats();

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000); //PerspectiveCamera( 75, 400.0 / 300.0, 0.1, 1000 );
    //var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( 400, 300 );
    //renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.BufferGeometry();
    var vertexPositions = [
        [-1.0, -1.0,  1.0],
        [ 1.0, -1.0,  1.0],
        [ 1.0,  1.0,  1.0],

        [ 1.0,  1.0,  1.0],
        [-1.0,  1.0,  1.0],
        [-1.0, -1.0,  1.0]
    ];
    var vertices = new Float32Array( vertexPositions.length * 3 ); // three components per vertex
    var colors = new Float32Array( vertexPositions.length * 3 );

    for ( var i = 0; i < vertexPositions.length; i++ )
    {
        vertices[ i*3 + 0 ] = vertexPositions[i][0];
        vertices[ i*3 + 1 ] = vertexPositions[i][1];
        vertices[ i*3 + 2 ] = vertexPositions[i][2];

        if (i % 2 == 0){
            colors[ i*3 ]     = 0;
            colors[ i*3 + 1 ] = 1;
            colors[ i*3 + 2 ] = 0;
        } else {
            colors[ i*3 ]     = 0;
            colors[ i*3 + 1 ] = 0;
            colors[ i*3 + 2 ] = 1;
        }
    }

    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();

    var material = new THREE.MeshBasicMaterial( {
        //color: 0xffffff, // also if set color to 0xbbbbbb brightness will be smaller
        vertexColors: THREE.VertexColors
    } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);

//    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
//    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//    var cube = new THREE.Mesh( geometry, material );
//    scene.add( cube );

//    var geometry = new THREE.PlaneBufferGeometry(1.9, 1.8, 32, 16 );
//    //var material = new THREE.MeshBasicMaterial( {colors: 0xffff00, side: THREE.DoubleSide} );
//    var material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.VertexColors} );
//    var plane = new THREE.Mesh( geometry, material );
//    scene.add( plane );

//    var vertexColorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
//    var color, point, face, numberOfSides, vertexIndex;
//
//    var faceIndices = [ 'a', 'b', 'c', 'd' ];
//
//    var size = 100;
//    var cubeGeometry = new THREE.CubeGeometry( size, size, size );
//
//    for ( var i = 0; i < cubeGeometry.vertices.length; i++ )
//    {
//        point = cubeGeometry.vertices[ i ];
//        color = new THREE.Color( 0xffffff );
//        color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
//        cubeGeometry.colors[i] = color; // use this array for convenience
//    }
//
//    for ( var i = 0; i < cubeGeometry.faces.length; i++ )
//    {
//        face = cubeGeometry.faces[ i ];
//        numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
//        for( var j = 0; j < numberOfSides; j++ )
//        {
//            vertexIndex = face[ faceIndices[ j ] ];
//            face.vertexColors[ j ] = cubeGeometry.colors[ vertexIndex ];
//        }
//    }
//
//    cube = new THREE.Mesh( cubeGeometry, vertexColorMaterial );
//    scene.add( cube );

//    var geometry = new THREE.Geometry();
//
//    geometry.vertices.push(
//        new THREE.Vector3( -10,  10, 0 ),
//        new THREE.Vector3( -10, -10, 0 ),
//        new THREE.Vector3(  10, -10, 0 )
//    );
//
//    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
//
//    geometry.faces[0].vertexColors.push(new THREE.Color( 1, 0, 0 ));
//    geometry.faces[0].vertexColors.push(new THREE.Color( 0, 0, 0 ));
//    geometry.faces[0].vertexColors.push(new THREE.Color( 1, 0.5, 0 ));
//
//    geometry.computeBoundingSphere();
//
//    //var geometry = new THREE.PlaneBufferGeometry(1.9, 1.8, 32, 16 );
//    var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, side: THREE.DoubleSide} ); // THREE.FrontSide
//    var plane = new THREE.Mesh( geometry, material );
//    scene.add( plane );

//    var p1,p2,p3;
//
//    for (var i = 0; i < numberOfVertices; i += 9) {
//        p1  = new THREE.Vector3(graphData.triangles.vertices[i+0], graphData.triangles.vertices[i+1], graphData.triangles.vertices[i+2]);
//        p2  = new THREE.Vector3(graphData.triangles.vertices[i+3], graphData.triangles.vertices[i+4], graphData.triangles.vertices[i+5]);
//        p3  = new THREE.Vector3(graphData.triangles.vertices[i+6], graphData.triangles.vertices[i+7], graphData.triangles.vertices[i+8]);
//        geometry.vertices.push(new THREE.Vertex( p1.clone() ));
//        geometry.vertices.push(new THREE.Vertex( p2.clone() ));
//        geometry.vertices.push(new THREE.Vertex( p3.clone() ));
//        geometry.faces.push( new THREE.Face3( i/3, i/3+1, i/3+2 ) );
//
//        // i want to do something like this:
//        geometry.colors.push(new THREE.Color(0xFF0000));
//        geometry.colors.push(new THREE.Color(0xFF0000));
//        geometry.colors.push(new THREE.Color(0xFF0000));
//    }
//
//    geometry.computeFaceNormals();
//    var material = new THREE.MeshBasicMaterial({});
//
//    var triangles = new THREE.Mesh( geometry, material );
//    scene.add(triangles);

    camera.position.z = 10;

    var render = function () {
        stats.update();

        requestAnimationFrame(render);

        //cube.rotation.x += 0.029;
        //cube.rotation.y += 0.0125;

        renderer.render(scene, camera);
    };

    var controls = new function () {
        // we need the first child, since it's a multimaterial


        this.width = 0;
        this.height = 0;

        this.widthSegments = 0;
        this.heightSegments = 0;

        this.redraw = function () {
            // remove the old plane
            //scene.remove(plane);
            // create a new one
            //plane = createMesh(new THREE.PlaneGeometry(controls.width, controls.height, Math.round(controls.widthSegments), Math.round(controls.heightSegments)));
            // add it to the scene.
            //scene.add(plane);
        };
    };

    var gui = new dat.GUI();
    gui.add(controls, 'width', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'height', 0, 40).onChange(controls.redraw);
    gui.add(controls, 'widthSegments', 0, 10).onChange(controls.redraw);
    gui.add(controls, 'heightSegments', 0, 10).onChange(controls.redraw);

    render();

    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        //stats.domElement.style.position = 'absolute';
        //stats.domElement.style.left = '0px';
        //stats.domElement.style.top = '0px';

        document.getElementById('Stats-output').appendChild(stats.domElement);
        //$("#Stats-output").append(stats.domElement);

        return stats;
    }

}(THREE, BB));
*/