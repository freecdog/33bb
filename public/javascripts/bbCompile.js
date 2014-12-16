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
            //renderer.setSize( 380-100, 300 );
            //renderer.setSize( window.innerWidth - 100, window.innerHeight );
            renderer.setSize( Math.min(window.innerWidth, window.innerHeight)-100, Math.min(window.innerWidth, window.innerHeight)-100 );
            document.body.appendChild( renderer.domElement );

            var geometry = new THREE.BufferGeometry();

            var curTime = 0;

            // load from Datatone. Mem[time from 0 to 5, with 0.1 stop][coord from 0 to 1 with 0.1 step][angle from 0 to 90 with 15 step]
            var memIndex = 2;
            var mem = data.memOut[memIndex];
            // converting TP to correct array of angles (indexed from 0)
            var angles = [];
            for (var cang in data.TP) {
                if (data.TP.hasOwnProperty(cang)) {
                    angles.push(data.TP[cang]);
                }
            }
            console.log('pts', angles);
            var axisX = 2, axisY = 2;   // length of axises
            var axisX2 = axisX / 2, axisY2 = axisY / 2;
            var defZ = 1.0;

            axisX = axisY = 1;
            axisX2 = axisY2 = 0;

            var vertexPositions = [];
            var vertexColors = [];

            var cmin, cmax;
            countMinMax();

            // converts Num from diap (ds to df) to diap (dmin to dmax)
            function ctd(num, ds, df, dmin, dmax){
                var diap = Math.abs(df - ds);
                var delta = Math.abs(dmax - dmin);
                return (delta / diap) * (num-ds) + dmin;
            }
            //console.warn( 'value:', ctd(-1e-7,cmin, cmax, 0,1),'min:', cmin, 'max:', cmax);
            function deg2rad(angle){ return angle / 180 * Math.PI; }
            for (var c0 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c0 < c0len; c0++){
                var r1 = c0 * data.STEPX;
                var r2 = r1 + data.STEPX;
                for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){

                    var p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y;
                    p1x = r2 * Math.cos( deg2rad(angles[c1]) ) * axisX - axisX2;
                    p1y = r2 * Math.sin( deg2rad(angles[c1]) ) * axisY - axisY2;
                    p2x = r1 * Math.cos( deg2rad(angles[c1]) ) * axisX - axisX2;
                    p2y = r1 * Math.sin( deg2rad(angles[c1]) ) * axisY - axisY2;
                    p3x = r2 * Math.cos( deg2rad(angles[c1+1]) ) * axisX - axisX2;
                    p3y = r2 * Math.sin( deg2rad(angles[c1+1]) ) * axisY - axisY2;
                    p4x = r1 * Math.cos( deg2rad(angles[c1+1]) ) * axisX - axisX2;
                    p4y = r1 * Math.sin( deg2rad(angles[c1+1]) ) * axisY - axisY2;

                    // 1st triangle
                    vertexPositions.push( [p1x, p1y, defZ] );
                    vertexPositions.push( [p2x, p2y, defZ] );
                    vertexPositions.push( [p3x, p3y, defZ] );

                    // 2nd triangle
                    vertexPositions.push( [p2x, p2y, defZ] );
                    vertexPositions.push( [p3x, p3y, defZ] );
                    vertexPositions.push( [p4x, p4y, defZ] );

                    // 1st triangle
                    var recTime = curTime;
                    vertexColors.push( getRainbowColor( 1-ctd( mem[recTime][c0+1][c1] ,cmin, cmax, 0,1) ) );
                    vertexColors.push( getRainbowColor( 1-ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1) ) );
                    vertexColors.push( getRainbowColor( 1-ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1) ) );

                    // 2nd triangle
                    vertexColors.push( getRainbowColor( 1-ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1) ) );
                    vertexColors.push( getRainbowColor( 1-ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1) ) );
                    vertexColors.push( getRainbowColor( 1-ctd( mem[recTime][c0][c1+1] ,cmin, cmax, 0,1) ) );
                }
            }

            var N = 3; // number of components per vertex
            var vertices = new Float32Array( vertexPositions.length * N ); // three components per vertex
            var colors = new Float32Array( vertexPositions.length * N );

            for ( var i = 0; i < vertexPositions.length; i++ )
            {
                vertices[ i*N + 0 ] = vertexPositions[i][0];
                vertices[ i*N + 1 ] = vertexPositions[i][1];
                vertices[ i*N + 2 ] = vertexPositions[i][2];

                colors[ i*N + 0 ] = vertexColors[i][0];
                colors[ i*N + 1 ] = vertexColors[i][1];
                colors[ i*N + 2 ] = vertexColors[i][2];
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

            // TODO triangle strip? how it could change colors initialization?
            var mesh = new THREE.Mesh( geometry, material );
            scene.add(mesh);

            animate();

            // usefull methods
            function initStats() {
                var stats = new Stats();
                stats.setMode(1); // 0: fps, 1: ms

                document.getElementById('Stats-output').appendChild(stats.domElement);

                return stats;
            }

            function countMinMax(){
                cmin = 1e308;
                cmax = -1e308;
                for (var m0 in mem){
                    for (var m1 in mem[m0]){
                        for (var m2 in mem[m0][m1]){
                            cmin = Math.min(cmin, mem[m0][m1][m2]);
                            cmax = Math.max(cmax, mem[m0][m1][m2]);
                        }
                    }
                }
            }

            // get color from value in diap 0..1
            function getRainbowColor(value){

                var piece = 0.16666666666666666666666666666667;
                var borF = 0 * piece;  		// Fiolet
                var borS = 1 * piece;    	// Sinij
                var borG = 2 * piece;   	// Goluboj
                var borZ = 3 * piece;		// Zelenij
                var borZh = 4 * piece;		// Zheltyj
                var borO = 5 * piece;		// Oranzhevyj
                var borK = 6 * piece;		// Krasnyj

                var SRC_r, SRC_g, SRC_b;
                var bright;

                bright = 1;

                //F - S - G - Z - Zh - O - K
                if ((value >= borF) && (value < borS)) {
                    SRC_r = 1;
                    SRC_g = 0;
                    SRC_b = 1;
                    SRC_r = 1 - bright * (value - borF) / piece;
                }
                if ((value >= borS) && (value < borG)) {
                    SRC_r = 0;
                    SRC_g = 0;
                    SRC_b = 1;
                    SRC_g = bright * (value - borS) / piece;
                }
                if ((value >= borG) && (value < borZ)) {
                    SRC_r = 0;
                    SRC_g = 1;
                    SRC_b = 1;
                    SRC_b = 1 - bright * (value - borG) / piece;
                }
                if ((value >= borZ) && (value < borZh)) {
                    SRC_r = 0;
                    SRC_g = 1;
                    SRC_b = 0;
                    SRC_r = bright * (value - borZ) / piece;
                }
                if ((value >= borZh) && (value < borO)) {
                    SRC_r = 1;
                    SRC_g = 1;
                    SRC_b = 0;
                    SRC_g = 1 - 0.5 * bright * (value - borZh) / piece;
                }
                if ((value >= borO) && (value < borK)) {
                    SRC_r = 1;
                    SRC_g = 0.5;
                    SRC_b = 0;
                    SRC_g = 0.5 - bright * (value - borO) / piece;
                }

                return [SRC_r, SRC_g, SRC_b];
            }

            // RENDER
            function render() {
                renderer.render(scene, camera);
            }

            function animate() {

                requestAnimationFrame( animate );

                render();
                stats.update();
            }

            // GUI
            var controls = new function () {
                this.time = curTime;
                this.memIndex = memIndex;

                this.changeTime = function(){
                    var vertexColors = [];
                    for (var c0 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c0 < c0len; c0++){
                        for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){

                            // 1st triangle
                            var ind = Math.round(controls.time);
                            vertexColors.push( getRainbowColor( 1-ctd( mem[ind][c0+1][c1] ,cmin, cmax, 0,1) ) );
                            vertexColors.push( getRainbowColor( 1-ctd( mem[ind][c0][c1] ,cmin, cmax, 0,1) ) );
                            vertexColors.push( getRainbowColor( 1-ctd( mem[ind][c0+1][c1+1] ,cmin, cmax, 0,1) ) );

                            // 2nd triangle
                            vertexColors.push( getRainbowColor( 1-ctd( mem[ind][c0][c1] ,cmin, cmax, 0,1) ) );
                            vertexColors.push( getRainbowColor( 1-ctd( mem[ind][c0+1][c1+1] ,cmin, cmax, 0,1) ) );
                            vertexColors.push( getRainbowColor( 1-ctd( mem[ind][c0][c1+1] ,cmin, cmax, 0,1) ) );
                        }
                    }

                    var colors = new Float32Array( vertexPositions.length * N );
                    for ( var i = 0; i < vertexPositions.length; i++ )
                    {
                        colors[ i*N + 0 ] = vertexColors[i][0];
                        colors[ i*N + 1 ] = vertexColors[i][1];
                        colors[ i*N + 2 ] = vertexColors[i][2];
                    }

                    geometry.attributes.color = new THREE.BufferAttribute( colors, 3 );
                };

                this.changeMem = function(){
                    mem = data.memOut[ Math.round( controls.memIndex ) ];

                    countMinMax();

                    controls.changeTime();
                };
            };

            var gui = new dat.GUI();
            gui.add(controls, 'time', 0, 49).onChange(controls.changeTime);
            gui.add(controls, 'memIndex', 0, 4).onChange(controls.changeMem);

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