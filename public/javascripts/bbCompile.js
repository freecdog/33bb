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

            //console.log('have THREE:', THREE, BB, data);

            var stats = initStats();

            var N = 3; // number of components per vertex
            var useDuplicate = false;
            var useInvertationColors = false;

            var scene = new THREE.Scene();
            var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000); //PerspectiveCamera( 75, 400.0 / 300.0, 0.1, 1000 );
            camera.position.z = 10;

            var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
            renderer.setClearColor( 0x000000, 0);
            //renderer.setSize( 380-100, 300 );
            //renderer.setSize( window.innerWidth - 100, window.innerHeight );
            renderer.setSize( Math.min(window.innerWidth, window.innerHeight)-50, Math.min(window.innerWidth, window.innerHeight)-50 );
            renderer.domElement.style.position = 'absolute';
            if ( window.innerWidth / window.innerHeight < 1 ) {
                renderer.domElement.style.right = '50px';
            } else {
                renderer.domElement.style.right = '50px';
            }
            renderer.domElement.style.bottom = '10px';
            document.body.appendChild( renderer.domElement );

            var geometry = new THREE.BufferGeometry();

            var initTime = 0;

            // load from Datatone. Mem[time from 0 to 5 (data.TM), with 0.1 (data.DT) step][coord from 0 to 1 (data.XDESTR) with 0.1 (data.STEPX) step][angle from 0 to 90 (data.printPoints) with 15 step]
            var schemeIndex = 2;
            var mem = data.memOut[schemeIndex];
            // converting TP to correct array of angles (indexed from 0)
            var angles = [];
            for (var cang in data.TP) {
                if (data.TP.hasOwnProperty(cang)) {
                    angles.push(data.TP[cang]);
                }
            }
            var axisX = 2, axisY = 2;   // length of axises
            var axisX2 = axisX / 2, axisY2 = axisY / 2;
            var defZ = 1.0;

            axisX = axisY = 1;
            axisX2 = axisY2 = 0;

            var vertexPositions = [];
            var vertexColors = [];

            var cmin = Number.MAX_VALUE, cmax = -Number.MAX_VALUE;
            countMinMax();

            var timeStepsCount = Math.round(data.TM/data.STEP)-1;

            // adding attributes with empty arrays, so properties would be available
            geometry.addAttribute( 'position',  new THREE.BufferAttribute( [], N ) );
            geometry.addAttribute( 'color',  new THREE.BufferAttribute( [], N ) );

            // converts Num from diap (ds to df) to diap (dmin to dmax)
            function ctd(num, ds, df, dmin, dmax, invert){
                console.warn(num);

                var diap = Math.abs(df - ds);
                var delta = Math.abs(dmax - dmin);
                var ans = (delta / diap) * (num-ds) + dmin;
                if (invert === true) ans = dmax - ans;
                return ans;
            }
            //console.warn( 'value:', ctd(-1e-7,cmin, cmax, 0,1),'min:', cmin, 'max:', cmax);
            function deg2rad(angle){ return angle / 180 * Math.PI; }
            function initPositionVertices(){
                vertexPositions = [];

                // TODO we are using special radius that had been moved from FUNC2.js (RTET) to configuration, actually there can be not only circle
                var objectRadius = data.rtetA;
                var totalRadius = objectRadius + data.XDESTR;
                var normalaizedObjectRadius = objectRadius / totalRadius;

                for (var c0 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c0 < c0len; c0++){
                    //var r1 = c0 * data.STEPX;
                    //var r2 = r1 + data.STEPX;
                    var r1 = objectRadius + c0 * data.STEPX;
                    var r2 = r1 + data.STEPX;

                    // normalization of radiuses
                    r1 = r1 / totalRadius;
                    r2 = r2 / totalRadius;

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

                        // duplicate
                        if (useDuplicate){
                            p1x = r2 * Math.cos( deg2rad(angles[c1]) ) * axisX - axisX2;
                            p1y = r2 * Math.sin( deg2rad(angles[c1]) ) * axisY - axisY2;
                            p2x = r1 * Math.cos( deg2rad(angles[c1]) ) * axisX - axisX2;
                            p2y = r1 * Math.sin( deg2rad(angles[c1]) ) * axisY - axisY2;
                            p3x = r2 * Math.cos( deg2rad(angles[c1+1]) ) * axisX - axisX2;
                            p3y = r2 * Math.sin( deg2rad(angles[c1+1]) ) * axisY - axisY2;
                            p4x = r1 * Math.cos( deg2rad(angles[c1+1]) ) * axisX - axisX2;
                            p4y = r1 * Math.sin( deg2rad(angles[c1+1]) ) * axisY - axisY2;
                            vertexPositions.push( [p1x, 1-p1y -1, defZ] );
                            vertexPositions.push( [p2x, 1-p2y -1, defZ] );
                            vertexPositions.push( [p3x, 1-p3y -1, defZ] );
                            vertexPositions.push( [p2x, 1-p2y -1, defZ] );
                            vertexPositions.push( [p3x, 1-p3y -1, defZ] );
                            vertexPositions.push( [p4x, 1-p4y -1, defZ] );
                        }
                    }
                }

                var vertices = new Float32Array( vertexPositions.length * N ); // three components per vertex

                for ( var i = 0, len = vertexPositions.length; i < len; i++ ) {
                    for (var j = 0; j < N; j++) vertices[ i*N + j ] = vertexPositions[i][j];
                }

                geometry.attributes.position = new THREE.BufferAttribute( vertices, N );

                geometry.computeBoundingSphere();
            }
            function initColorVertices(currentTime){
                vertexColors = [];

                for (var c0 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c0 < c0len; c0++){
                    for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){

                        var isInvert = useInvertationColors;

                        // 1st triangle
                        var recTime = currentTime;
                        vertexColors.push( getRainbowColor( ctd( mem[recTime][c0+1][c1] ,cmin, cmax, 0,1, isInvert) ) );
                        vertexColors.push( getRainbowColor( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                        vertexColors.push( getRainbowColor( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );

                        // 2nd triangle
                        vertexColors.push( getRainbowColor( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                        vertexColors.push( getRainbowColor( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                        vertexColors.push( getRainbowColor( ctd( mem[recTime][c0][c1+1] ,cmin, cmax, 0,1, isInvert) ) );

                        // duplicate
                        if (useDuplicate){
                            vertexColors.push( getRainbowColor( ctd( mem[recTime][c0+1][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getRainbowColor( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getRainbowColor( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getRainbowColor( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getRainbowColor( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getRainbowColor( ctd( mem[recTime][c0][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                        }
                    }
                }

                var colors = new Float32Array( vertexColors.length * N );

                for ( var i = 0, len = vertexColors.length; i < len; i++ ) {
                    for (var k = 0; k < N; k++) colors[ i*N + k ] = vertexColors[i][k];
                }

                geometry.attributes.color = new THREE.BufferAttribute( colors, N );
            }
            function initVertices(){
                initPositionVertices();
                initColorVertices(initTime);
            }
            initVertices();

//            geometry.dynamic = true;  // it is not make sense for my app

            var material = new THREE.MeshBasicMaterial( {
                //color: 0xffffff, // also if set color to 0xbbbbbb brightness will be smaller
                vertexColors: THREE.VertexColors,
                side: THREE.DoubleSide  // if there is only front side it may be rotated with backside (and become invisible)
            } );

            // TODO triangle strip? how it could change colors initialization? But probably it aren't too much necessary
            // because there are not too much triangles (default case: 10 * 12 * 2 = 240 triangles)
            var mesh = new THREE.Mesh( geometry, material );
            scene.add(mesh);

            animate();

            // usefull methods
            function countMinMax(){
                cmin = Number.MAX_VALUE;
                cmax = -Number.MAX_VALUE;
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
                this.time = initTime;
                this.schemeIndex = schemeIndex;
                this.autoPlay = false;
                this.invertColors = useInvertationColors;
                this.duplicate = useDuplicate;

                this.updateGUIdisplays = function(){
                    if (gui !== undefined) {
                        for (var guiElem in gui.__controllers) {
                            if (!gui.__controllers.hasOwnProperty(guiElem)) continue;

                            gui.__controllers[ guiElem ].updateDisplay();
                        }
                    } else {
                        console.error('gui is undefined');
                    }
                };
                this.updateGUIwithName = function(name){
                    if (gui !== undefined) {
                        for (var guiElem in gui.__controllers) {
                            if (!gui.__controllers.hasOwnProperty(guiElem)) continue;

                            if (gui.__controllers[ guiElem ].property === name) gui.__controllers[ guiElem ].updateDisplay();
                        }
                    } else {
                        console.error('gui is undefined');
                    }
                };

                this.autoUpdate = function(){
                    if (controls.autoPlay){
                        //onsole.log(Math.cos( (new Date()).getTime() ));
                        //controls.time = Math.cos( (new Date()).getTime() );
                        //controls.changeTime();

                        //controls.autoUpdate();
                        requestAnimationFrame( controls.autoUpdate );

                        //controls.time += 1;
                        controls.time = Math.cos( (new Date()).getTime()/1000 )*(timeStepsCount/2) + timeStepsCount/2;

                        //controls.updateGUIdisplays();
                        controls.updateGUIwithName('time');
                        controls.changeTime();
                    }
                };

                this.changeDuplicate = function(){
                    useDuplicate = controls.duplicate;
                    initVertices();
                    controls.changeTime();
                };

                this.changeInvertation = function(){
                    useInvertationColors = controls.invertColors;
                    controls.changeTime();
                };

                this.changeTime = function(){
                    initColorVertices( Math.round(controls.time) );
                };

                this.changeMem = function(){
                    mem = data.memOut[ Math.round( controls.schemeIndex ) ];

                    countMinMax();

                    controls.changeTime();
                };

            };

            var gui = new dat.GUI({autoPlace: false});
            gui.domElement.style.position = 'absolute';
            gui.domElement.style.left = '0px';
            gui.domElement.style.top = '50px';
            document.body.appendChild(gui.domElement);

            gui.add(controls, 'autoPlay').onChange(controls.autoUpdate);
            gui.add(controls, 'time').min(0).max(timeStepsCount).step(1).onChange(controls.changeTime);
            gui.add(controls, 'schemeIndex', {
                'V_1.dat': 0,
                'V_2.dat': 1,
                'S11.dat': 2,
                'S22.dat': 3,
                'S12.dat': 4
            }).onChange(controls.changeMem);
            gui.add(controls, 'invertColors').onChange(controls.changeInvertation);
            gui.add(controls, 'duplicate').onChange(controls.changeDuplicate);

            function initStats() {
                var stats = new Stats();
                stats.setMode(1); // 0: fps, 1: ms

                stats.domElement.style.position = 'absolute';
                stats.domElement.style.left = '0px';
                stats.domElement.style.top = '0px';
                //document.getElementById('Stats-output').appendChild(stats.domElement);
                document.body.appendChild(stats.domElement);

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