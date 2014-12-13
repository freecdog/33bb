/**
 * Created by jaric on 12.12.2014.
 */

// http://threejs.org/docs/#Reference/Core/BufferGeometry — most useful link
// http://stackoverflow.com/questions/10330342/threejs-assign-different-colors-to-each-vertex-in-a-geometry
// http://www.smartjava.org/content/all-109-examples-my-book-threejs-threejs-version-r63

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {

        var bbCompile = {};

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
            camera.position.z = 10;

            var renderer = new THREE.WebGLRenderer();
            renderer.setSize( 380-100, 300 );
            //renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );

            var geometry = new THREE.BufferGeometry();
            var vertexPositions = [
                [ 0.50, 0.0,  1.0],
                [ 0.5, -0.50,  1.0],
                [ -0.5, -0.5,  1.0]

                //[-0.7, 0.2, 1.0]
            ];
            var N = 3;
            var vertices = new Float32Array( vertexPositions.length * N ); // three components per vertex
            var colors = new Float32Array( vertexPositions.length * N );

            for ( var i = 0; i < vertexPositions.length; i++ )
            {
                vertices[ i*N + 0 ] = vertexPositions[i][0];
                vertices[ i*N + 1 ] = vertexPositions[i][1];
                vertices[ i*N + 2 ] = vertexPositions[i][2];
                //vertices[ i*N + 3 ] = vertexPositions[i][3];

                if (i % 2 == 0){
                    colors[ i*N ]     = 0;
                    colors[ i*N + 1 ] = 1;
                    colors[ i*N + 2 ] = 0;
                } else {
                    colors[ i*N ]     = 0;
                    colors[ i*N + 1 ] = 0;
                    colors[ i*N + 2 ] = 1;
                }
            }

            geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, N ) );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

            geometry.computeBoundingSphere();

//            geometry.dynamic = true;  // it is not make sense for my app

            var material = new THREE.MeshBasicMaterial( {
                //color: 0xffffff, // also if set color to 0xbbbbbb brightness will be smaller
                vertexColors: THREE.VertexColors,
                side: THREE.DoubleSide  // if there is only front side it may be rotated with backside (and become invisible)
            } );
            var mesh = new THREE.Mesh( geometry, material );
            scene.add(mesh);

            var render = function () {
                renderer.render(scene, camera);
            };

            function animate() {

                requestAnimationFrame( animate );

                render();
                stats.update();

            }
            animate();

            var controls = new function () {
                this.yellow = 1e-100;
                this.x = geometry.attributes.position.array[ 0 ];

                this.redraw = function () {
                    console.log(controls.yellow);

                    //var vc = new Float32Array( vertexPositions.length * 3 );
//                    for ( var i = 0; i < 1; i++ )
//                    {
//                        vc[ i*3 ]     = controls.width / 40;
//                        vc[ i*3 + 1 ] = 1;
//                        vc[ i*3 + 2 ] = 0;
//                    }
                    //geometry.attributes.color = new THREE.BufferAttribute( vc, 3 );

                    var vc =  new Float32Array( vertexPositions.length * 3 );
                    for (var i = 0; i < geometry.attributes.color.array.length; i++) vc[i] = geometry.attributes.color.array[i];
                    vc[0] = controls.yellow;
                    geometry.attributes.color = new THREE.BufferAttribute( vc, 3 );

                    var vv = new Float32Array( vertexPositions.length * 3 ); // three components per vertex
                    for (var j = 0; j < geometry.attributes.position.array.length; j++) vv[j] = geometry.attributes.position.array[j];
                    vv[ 0 ] = controls.x;
                    geometry.attributes.position = new THREE.BufferAttribute( vv, 3 );

                };
            };

            var gui = new dat.GUI();
            gui.add(controls, 'yellow', 0, 1).onChange(controls.redraw);
            gui.add(controls, 'x', -1, 1).onChange(controls.redraw);

            function initStats() {
                var stats = new Stats();
                stats.setMode(1); // 0: fps, 1: ms

                document.getElementById('Stats-output').appendChild(stats.domElement);

                return stats;
            }

        }
        bbCompile.start = start;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = bbCompile;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return bbCompile;
            });
        }
        // included directly via <script> tag
        else {
            root.bbCompile = bbCompile;
        }

    }());

});