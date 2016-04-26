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

        'use strict';

        var bbCompile = {};

        function start(){
            var startSelf = this;

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

            var showCanvas = true;

            var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
            renderer.setClearColor( 0x000000, 0);
            //renderer.setSize( 380-100, 300 );
            //renderer.setSize( window.innerWidth - 100, window.innerHeight );
            var rendererSize = {
                width: Math.min(window.innerWidth, window.innerHeight)-50,
                height: Math.min(window.innerWidth, window.innerHeight)-50
            };
            renderer.setSize(rendererSize.width, rendererSize.height);
            renderer.domElement.style.position = 'absolute';
            if ( window.innerWidth / window.innerHeight < 1 ) {
                renderer.domElement.style.right = '50px';
            } else {
                renderer.domElement.style.right = '50px';
            }
            renderer.domElement.style.bottom = '10px';
            document.body.appendChild( renderer.domElement );

            var axisHelper = new THREE.AxisHelper( 5 );
            scene.add( axisHelper );

            var zeroDegreeText = createText("0°", renderer.domElement.offsetLeft + rendererSize.width/2, renderer.domElement.offsetTop);
            document.body.appendChild(zeroDegreeText);
            var ninetyDegreeText = createText("90°", renderer.domElement.offsetLeft + rendererSize.width, renderer.domElement.offsetTop + rendererSize.height/2);
            document.body.appendChild(ninetyDegreeText);

            setVisibility(renderer.domElement, showCanvas);
            setVisibility(zeroDegreeText, showCanvas);
            setVisibility(ninetyDegreeText, showCanvas);

            function createText(text, left, top, width, height){
                left = left || 0;
                top = top || 0;
                width = width || 23;
                height = height || 17;
                var generatedText = document.createElement('div');
                generatedText.style.position = 'absolute';
                //generatedText.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
                generatedText.style.width = width + 'px';
                generatedText.style.height = height + 'px';
                //generatedText.style.backgroundColor = "blue";
                generatedText.innerHTML = text;
                generatedText.style.left = left + 'px';
                generatedText.style.top = top + 'px';

                return generatedText;
            }

            var geometry = new THREE.BufferGeometry();

            var initTime = 0;

            // load from Datatone. Mem[time from 0 to 5 (data.TM), with 0.1 (data.DT) step][coord from 0 to 1 (data.XDESTR) with 0.1 (data.STEPX) step][angle from 0 to 90 (data.printPoints) with 15 step]
            var schemeIndex = 2;
            var mem = data.memOut[schemeIndex];
            console.log(data);

            var visualisationSchemeIndex = 2;

            // converting TP to correct array of angles (indexed from 0)
            var angles = [];
            for (var cang in data.TP) {
                if (data.TP.hasOwnProperty(cang)) {
                    if (data.TP[cang] != null) angles.push(data.TP[cang]);
                }
            }
            console.log("angles:", angles);
            var axisX = 2, axisY = 2;   // length of axises
            var axisX2 = axisX / 2, axisY2 = axisY / 2;
            var defZ = 1.0;

            axisX = axisY = 1;
            axisX2 = axisY2 = 0;

            var vertexPositions = [];
            var vertexColors = [];

            var cmin = Number.MAX_VALUE, cmax = -Number.MAX_VALUE;
            countMinMax();

            var amplifyColors = false;
            var amplifyCoef = 2;

            //var timeStepsCount = Math.round(data.TM/data.STEP);
            // TODO see how counted NBX, it would be correct for G array, but for QP use STEP and STEPX
            // NT = Math.round(TM/DT);
            // NBX = NT + Math.round(XDESTR/DX) + 10;

            // TODO probably need +1 and fix the memOut for TM
            var timeStepsCount = Math.round(data.T0 / data.STEP) + Math.round(data.TM / data.STEP);

            var stepsBeforeT0 = Math.round(data.XDESTR * 1.1 / data.STEPX);
            var stepsAfterT0 = Math.round(data.TM/data.STEP);
            var altTimeStepsCount = stepsBeforeT0 + stepsAfterT0;
            timeStepsCount = altTimeStepsCount;
            console.log("timeStepsCount:", timeStepsCount, "; altTimeStepsCount:", altTimeStepsCount);

            // adding attributes with empty arrays, so properties would be available
            geometry.addAttribute( 'position',  new THREE.BufferAttribute( [], N ) );
            geometry.addAttribute( 'color',  new THREE.BufferAttribute( [], N ) );

            // converts Num from diap (ds to df) to diap (dmin to dmax)
            function ctd(num, ds, df, dmin, dmax, invert){
                var diap = Math.abs(df - ds);
                var delta = Math.abs(dmax - dmin);
                var ans = (delta / diap) * (num-ds) + dmin;
                if (invert === true) ans = dmax - ans;
                return ans;
            }
            //console.warn( 'value:', ctd(-1e-7,cmin, cmax, 0,1),'min:', cmin, 'max:', cmax);

            // converts Num from diap (ds to df) to diap (dmin to center value, center value to dmax). 3 colored diap
            function ctd3(num, ds, dc, df, dmin, dcenter, dmax){
                if (!(ds < dc) || !(dc < df)) {
                    //console.warn("something wrong:", ds, " < ", dc, " < ", df);
                    //return 0;
                    //ans = ctd(num, ds, dc, dmin, dcenter, false);
                    if ( ((dc < df) == false) && num >= dc) return dcenter;
                }
                if (!(dmin < dcenter) || !(dcenter < dmax)) {
                    //console.warn("something wrong:", dmin, "<", centerValue, "<", dmax);
                    //return 0;
                    //ans = ctd(num, ds, dc, dmin, dcenter, false);
                }
                var ans;
                if (num < dc){
                    ans = ctd(num, ds, dc, dmin, dcenter, false);
                } else {
                    ans = ctd(num, dc, df, dcenter, dmax, false);
                }
                return ans;
            }
            //console.warn( 'value:', ctd3(0.1, cmin, 0, cmax, -1, 0, 1),'min:', cmin, 'max:', cmax);

            function calcDistance(point1, point2){
                var r1 = point1.radius;
                var phi1 = point1.angle;
                var r2 = point2.radius;
                var phi2 = point2.angle;

                var dist = Math.sqrt( r1*r1 + r2*r2 - 2*r1*r2*Math.cos( deg2rad(phi2-phi1) ) );

                return dist;
            }
            function findNearestFourPointsToPoint(point){
                point = point || {radius: 0, angle: 0}; // angle in degree
                var nearestPoints = [
                    {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE},
                    {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE},
                    {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE},
                    {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE}
                ];
                for (var c0 = 0; c0 < nearestPoints.length; c0++) {
                    for (var c1 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c1 <= c0len; c1++) {
                        for (var c2 = 0, c1len = angles.length - 1; c2 < c1len; c2++) {
                            //mem[time][radius][angle]
                            var skipThis = false;
                            for (var c3 = 0; c3 < c0; c3++){
                                if (nearestPoints[c3].radiusStepIndex == c1 && nearestPoints[c3].angleStepIndex == c2) {
                                    skipThis = true;
                                    break;
                                }
                            }
                            if (!data.cavform[angles[c2]]) skipThis = true;
                            if (skipThis) continue;

                            var objectRadius1 = data.cavform[angles[c2]].radius;
                            var r1 = objectRadius1 + c1 * data.STEPX;
                            var currentPoint = {radius: r1, angle: angles[c2]};

                            var distance = calcDistance(point, currentPoint);
                            if (nearestPoints[c0].distance > distance){
                                nearestPoints[c0].distance = distance;
                                nearestPoints[c0].radius = currentPoint.radius;
                                nearestPoints[c0].angle = currentPoint.angle;
                                nearestPoints[c0].radiusStepIndex = c1;
                                nearestPoints[c0].angleStepIndex = c2;
                            }
                        }
                    }
                }
                return nearestPoints;
            }
            var showControlPoints = false;
            var controlPoints = [
                { radius: data.XDESTR + data.rtetA, angle: 0 },
                { radius: data.XDESTR + data.rtetB, angle: 90 },
                { radius: 5, angle: 30 }
            ];
            // additional random points to test
            //for (var npi = 0; npi < 10; npi++){
            //    var testPoint = {
            //        radius: Math.max(data.rtetA, data.rtetB) + data.XDESTR * Math.random(),
            //        angle: 360 * Math.random()
            //    };
            //    controlPoints.push(testPoint);
            //}
            var nearestPoints = [];
            for (var currentControlPoint in controlPoints){
                nearestPoints.push(findNearestFourPointsToPoint(controlPoints[currentControlPoint]));
            }
            console.log("controlPoints", controlPoints, "nearestPoints", nearestPoints);

            data.angles = angles;
            data.controlPoints = controlPoints;
            data.nearestPoints = nearestPoints;

            function findNearestCavFormAngle(angle){
                var minDiff = Number.MAX_VALUE;
                var minIndex = -1;
                for (var c0 = 0; c0 < data.cavform.length; c0++){
                    if (Math.abs(data.cavform[c0].TETA - angle) < minDiff) {
                        minDiff = Math.abs(data.cavform[c0].TETA - angle);
                        minIndex = c0;
                    }
                }
                if (minIndex != -1) return data.cavform[minIndex];
                else {
                    console.error("no nearest angle for this angle:", angle);
                }
            }
            function deg2rad(angle){ return angle / 180 * Math.PI; }

            var totalRadius = 1;
            function calcTotalRadius(){
                // SOLVED we are using special radius that had been moved from FUNC2.js (RTET) to configuration, actually there can be not only circle
                var maxRadius = data.cavform[0].radius;
                for (var c2 = 1, cfLength = data.cavform.length; c2 < cfLength; c2++){
                    maxRadius = Math.max(maxRadius, data.cavform[c2].radius);
                }
                console.log("maxRadius", maxRadius);

                return (maxRadius + data.XDESTR) * 1.05; // *1.05 to show axis
            }
            function initPositionVertices(){
                vertexPositions = [];

                var r1, r2, r3, r4;
                var p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y;
                var objectRadius1, objectRadius2;
                totalRadius = calcTotalRadius();

                for (var c0 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c0 < c0len; c0++){
                    for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){

                        var currentAngle = angles[c1];
                        var nextAngle = angles[c1+1];

                        if (!data.cavform[currentAngle] || !data.cavform[nextAngle]){
                            // SOLVED findNearest works fine, but values are wrong, aren't they? Seems like values are good now
                            if (!data.cavform[currentAngle]) console.warn("No angle", currentAngle);
                            if (!data.cavform[nextAngle]) console.warn("No angle", nextAngle);
                            objectRadius1 = findNearestCavFormAngle(currentAngle).radius;
                            objectRadius2 = findNearestCavFormAngle(nextAngle).radius;
                        } else {
                            objectRadius1 = data.cavform[currentAngle].radius;
                            objectRadius2 = data.cavform[nextAngle].radius;
                        }
                        r1 = objectRadius1 + c0 * data.STEPX;
                        r2 = r1 + data.STEPX;
                        r3 = objectRadius2 + c0 * data.STEPX;
                        r4 = r3 + data.STEPX;

                        // normalization of radiuses
                        r1 = r1 / totalRadius;
                        r2 = r2 / totalRadius;
                        r3 = r3 / totalRadius;
                        r4 = r4 / totalRadius;

                        //// zero degree angle is on the right
                        //p1x = r2 * Math.cos( deg2rad(currentAngle) ) * axisX - axisX2;
                        //p1y = r2 * Math.sin( deg2rad(currentAngle) ) * axisY - axisY2;
                        //p2x = r1 * Math.cos( deg2rad(currentAngle) ) * axisX - axisX2;
                        //p2y = r1 * Math.sin( deg2rad(currentAngle) ) * axisY - axisY2;
                        //p3x = r2 * Math.cos( deg2rad(nextAngle) ) * axisX - axisX2;
                        //p3y = r2 * Math.sin( deg2rad(nextAngle) ) * axisY - axisY2;
                        //p4x = r1 * Math.cos( deg2rad(nextAngle) ) * axisX - axisX2;
                        //p4y = r1 * Math.sin( deg2rad(nextAngle) ) * axisY - axisY2;

                        //// zero degree angle is on the top
                        //p1x = r2 * Math.sin( deg2rad(currentAngle) ) * axisX - axisX2;
                        //p1y = r2 * Math.cos( deg2rad(currentAngle) ) * axisY - axisY2;
                        //p2x = r1 * Math.sin( deg2rad(currentAngle) ) * axisX - axisX2;
                        //p2y = r1 * Math.cos( deg2rad(currentAngle) ) * axisY - axisY2;
                        //p3x = r2 * Math.sin( deg2rad(nextAngle) ) * axisX - axisX2;
                        //p3y = r2 * Math.cos( deg2rad(nextAngle) ) * axisY - axisY2;
                        //p4x = r1 * Math.sin( deg2rad(nextAngle) ) * axisX - axisX2;
                        //p4y = r1 * Math.cos( deg2rad(nextAngle) ) * axisY - axisY2;

                        // zero degree angle is on the top
                        p1x = r2 * Math.sin( deg2rad(currentAngle) ) * axisX - axisX2;
                        p1y = r2 * Math.cos( deg2rad(currentAngle) ) * axisY - axisY2;
                        p2x = r1 * Math.sin( deg2rad(currentAngle) ) * axisX - axisX2;
                        p2y = r1 * Math.cos( deg2rad(currentAngle) ) * axisY - axisY2;
                        p3x = r4 * Math.sin( deg2rad(nextAngle) ) * axisX - axisX2;
                        p3y = r4 * Math.cos( deg2rad(nextAngle) ) * axisY - axisY2;
                        p4x = r3 * Math.sin( deg2rad(nextAngle) ) * axisX - axisX2;
                        p4y = r3 * Math.cos( deg2rad(nextAngle) ) * axisY - axisY2;

                        //if (c0 == 5 && c1 == 2) {
                        //    console.warn(r1, r2, currentAngle);
                        //    console.warn(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);
                        //}

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
                            p1x = r2 * Math.cos( deg2rad(currentAngle) ) * axisX - axisX2;
                            p1y = r2 * Math.sin( deg2rad(currentAngle) ) * axisY - axisY2;
                            p2x = r1 * Math.cos( deg2rad(currentAngle) ) * axisX - axisX2;
                            p2y = r1 * Math.sin( deg2rad(currentAngle) ) * axisY - axisY2;
                            p3x = r2 * Math.cos( deg2rad(nextAngle) ) * axisX - axisX2;
                            p3y = r2 * Math.sin( deg2rad(nextAngle) ) * axisY - axisY2;
                            p4x = r1 * Math.cos( deg2rad(nextAngle) ) * axisX - axisX2;
                            p4y = r1 * Math.sin( deg2rad(nextAngle) ) * axisY - axisY2;
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
                //if (controls && !controls.autoPlay) console.log("initialization of color vertices, time:", currentTime, "; visualisation scheme index:", visualisationSchemeIndex);
                vertexColors = [];

                for (var c0 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c0 <= c0len; c0++){
                    for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){

                        var isInvert = useInvertationColors;

                        var recTime = currentTime;

                        if (visualisationSchemeIndex == 1){
                            // HSV
                            var intervalMax = 0.94117647;   // 240 / 255 = 0.94117647, because we don't need red color for both min and max values
                            // 1st triangle
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1] ,cmin, cmax, 0,intervalMax, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,intervalMax, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,intervalMax, isInvert) ) );

                            // 2nd triangle
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,intervalMax, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,intervalMax, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1+1] ,cmin, cmax, 0,intervalMax, isInvert) ) );
                        } else if (visualisationSchemeIndex == 2){
                            // Blue White Red
                            // 1st triangle
                            vertexColors.push( getColorFromValue( ctd3( mem[recTime][c0+1][c1] ,cmin, 0, cmax, -1, 0,1) ) );
                            vertexColors.push( getColorFromValue( ctd3( mem[recTime][c0][c1] ,cmin, 0, cmax, -1,0,1) ) );
                            vertexColors.push( getColorFromValue( ctd3( mem[recTime][c0+1][c1+1] ,cmin, 0, cmax, -1,0,1) ) );

                            // 2nd triangle
                            vertexColors.push( getColorFromValue( ctd3( mem[recTime][c0][c1] ,cmin, 0, cmax, -1,0,1) ) );
                            vertexColors.push( getColorFromValue( ctd3( mem[recTime][c0+1][c1+1] ,cmin, 0, cmax, -1,0,1) ) );
                            vertexColors.push( getColorFromValue( ctd3( mem[recTime][c0][c1+1] ,cmin, 0, cmax, -1,0,1) ) );
                        } else {
                            // Rainbow color and others single colors schemes
                            // 1st triangle
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );

                            // 2nd triangle
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                        }


                        // duplicate
                        if (useDuplicate){
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0+1][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
                            vertexColors.push( getColorFromValue( ctd( mem[recTime][c0][c1+1] ,cmin, cmax, 0,1, isInvert) ) );
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
            // Almost triangle only view (for real, every second triangle is colored
            //material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );

            // TODO triangle strip? how it could change colors initialization? But probably it aren't too much necessary
            // because there are not too much triangles (default case: 10 * 12 * 2 = 240 triangles)
            var mesh = new THREE.Mesh( geometry, material );
            scene.add(mesh);

            var geometryNearestPoints = new THREE.Geometry();
            for (var nearestIndex in nearestPoints){
                for (var nearestPointIndex in nearestPoints[nearestIndex]){
                    var nearestPoint = nearestPoints[nearestIndex][nearestPointIndex];
                    var nearestPointX = nearestPoint.radius/totalRadius * Math.sin(deg2rad(nearestPoint.angle)) * axisX - axisX2;
                    var nearestPointY = nearestPoint.radius/totalRadius * Math.cos(deg2rad(nearestPoint.angle)) * axisY - axisY2;
                    geometryNearestPoints.vertices.push(new THREE.Vector3(nearestPointX, nearestPointY, defZ));
                }
            }
            var nearestPointMaterial = new THREE.PointCloudMaterial( { color: 0x00ff00, size: 5, sizeAttenuation: false } );
            var nearestPointsDots = new THREE.PointCloud( geometryNearestPoints, nearestPointMaterial );
            scene.add( nearestPointsDots );
            nearestPointsDots.visible = showControlPoints;

            var geometryControlPoints = new THREE.Geometry();
            for (var pointIndex in controlPoints){
                var controlPoint = controlPoints[pointIndex];
                var controlPointX = controlPoint.radius/totalRadius * Math.sin(deg2rad(controlPoint.angle)) * axisX - axisX2;
                var controlPointY = controlPoint.radius/totalRadius * Math.cos(deg2rad(controlPoint.angle)) * axisY - axisY2;
                geometryControlPoints.vertices.push(new THREE.Vector3(controlPointX, controlPointY, defZ));
            }
            var controlPointMaterial = new THREE.PointCloudMaterial( { color: 0xff0000, size: 5, sizeAttenuation: false } );
            var controlPointsDots = new THREE.PointCloud( geometryControlPoints, controlPointMaterial );
            scene.add( controlPointsDots );
            controlPointsDots.visible = showControlPoints;

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
                console.log("cmin:", cmin, "; cmax:", cmax);
            }

            function getColorFromValue(value){
                if (visualisationSchemeIndex == 1) {
                    return getRainbowColorHSV(value);
                } else if (visualisationSchemeIndex == 2) {
                    return getBlueWhiteRedColor(value);
                } else {
                    if (visualisationSchemeIndex == 0) return getRainbowColor(value);
                    else if (visualisationSchemeIndex == 3) return getGrayColor(value);
                    else if (visualisationSchemeIndex == 4) return getRedBlackColor(value);
                    else if (visualisationSchemeIndex == 5) return getGreenBlackColor(value);
                    else if (visualisationSchemeIndex == 6) return getBlueBlackColor(value);
                }
                //return getGreenColor(value);
                //return getRainbowColor(value);
                //return getBlueWhiteRedColor(value);
                //return getRainbowColorHSV(value);
            }
            function getGrayColor(value){
                var SRC_r = value, SRC_g = value, SRC_b = value;
                return [SRC_r, SRC_g, SRC_b];
            }
            function getRedBlackColor(value){
                var SRC_r = value, SRC_g = 0, SRC_b = 0;
                return [SRC_r, SRC_g, SRC_b];
            }
            function getGreenBlackColor(value){
                var SRC_r = 0, SRC_g = value, SRC_b = 0;
                return [SRC_r, SRC_g, SRC_b];
            }
            function getBlueBlackColor(value){
                var SRC_r = 0, SRC_g = 0, SRC_b = value;
                return [SRC_r, SRC_g, SRC_b];
            }

            function getBlueWhiteRedColor(value){
                var borB = -1;  	// Blue
                var borW = 0;    	// White
                var borR = 1;   	// Red

                var SRC_r, SRC_g, SRC_b;

                var bright = 1;
                var power;

                // amplify colors
                if (amplifyColors){
                    value *= amplifyCoef;
                    if (value < borB) value = borB;
                    if (value > borR) value = borR;
                    //if (value > 0) SRC_r *= 4; if (SRC_r > 1) SRC_r = 1;
                    //if (value < 0) SRC_b *= 4; if (SRC_b > 1) SRC_b = 1;
                }

                if (value < 0){
                    power = bright * (value / borB);
                    SRC_r = bright - power;
                    SRC_g = bright - power;
                    SRC_b = 1;
                } else {
                    power = bright * (value / borR);
                    SRC_r = 1;
                    SRC_g = bright - power;
                    SRC_b = bright - power;
                }

                //console.log(value, [Math.round(SRC_r * 255), Math.round(SRC_g * 255), Math.round(SRC_b * 255)]);
                return [SRC_r, SRC_g, SRC_b];
            }
            //for (var testI = -1; testI <= 1; testI += 0.25) console.warn(testI, getBlueWhiteRedColor(testI));

            function HSVtoRGB(h, s, v) {
                // http://stackoverflow.com/a/17243070
                var r, g, b, i, f, p, q, t;
                if (arguments.length === 1) {
                    s = h.s, v = h.v, h = h.h;
                }
                i = Math.floor(h * 6);
                f = h * 6 - i;
                p = v * (1 - s);
                q = v * (1 - f * s);
                t = v * (1 - (1 - f) * s);
                switch (i % 6) {
                    case 0: r = v, g = t, b = p; break;
                    case 1: r = q, g = v, b = p; break;
                    case 2: r = p, g = v, b = t; break;
                    case 3: r = p, g = q, b = v; break;
                    case 4: r = t, g = p, b = v; break;
                    case 5: r = v, g = p, b = q; break;
                }
                //return {
                //    r: Math.round(r * 255),
                //    g: Math.round(g * 255),
                //    b: Math.round(b * 255)
                //};
                return [r, g, b];
            }
            function getRainbowColorHSV(value){
                return HSVtoRGB(value, 1, 1);
            }
            //for (var testI = 0; testI <= 1; testI += 1/6) console.warn("HSV", testI, getRainbowColorHSV(testI));

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
                if ((value >= borO) && (value <= borK)) {
                    SRC_r = 1;
                    SRC_g = 0.5;
                    SRC_b = 0;
                    SRC_g = 0.5 - bright * (value - borO) / piece;
                }

                return [SRC_r, SRC_g, SRC_b];
            }
            //for (var testI = 0; testI <= 1; testI += 1/12) console.warn("RGB", testI, getBlueWhiteRedColor(testI));

            function getTimeByTimeIndex(timeIndex){
                var realTime = 0;

                if (timeIndex < stepsBeforeT0){
                    realTime = timeIndex * data.STEPX - data.XDESTR*1.1;
                } else {
                    realTime = ((timeIndex - stepsBeforeT0) * data.STEP);
                }
                return realTime;
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
                this.timeStep = initTime;
                this.schemeIndex = schemeIndex;
                this.autoPlay = false;
                this.invertColors = useInvertationColors;
                this.duplicate = useDuplicate;
                this.visualisationSchemeIndex = visualisationSchemeIndex;
                this.autoUpdateTimer = 0;
                this.autoUpdateInterval = 10;
                this.canvasVisible = showCanvas;
                this.realTime = (-data.XDESTR * 1.1).toFixed(2);
                this.amplifyColors = amplifyColors;
                this.amplifyCoef = amplifyCoef;
                this.showControlPoints = showControlPoints;
                this.showCPData = false;
                this.cmin = cmin.toFixed(6);
                this.cmax = cmax.toFixed(6);
                this.showMemOutData = false;

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
                        //controls.timeStep = Math.cos( (new Date()).getTime() );
                        //controls.changeTime();

                        //controls.autoUpdate();
                        requestAnimationFrame(controls.autoUpdate);

                        //controls.timeStep = Math.cos( (new Date()).getTime()/1000 )*(timeStepsCount/2) + timeStepsCount/2;

                        //controls.updateGUIdisplays();
                        controls.updateGUIwithName('timeStep');

                        var currentTime = Date.now();
                        if (currentTime - controls.autoUpdateTimer > controls.autoUpdateInterval) {
                            controls.autoUpdateTimer = currentTime;

                            controls.timeStep += 1;
                            if (controls.timeStep >= timeStepsCount) {
                                //controls.timeStep -= 1;
                                //controls.autoPlay = false;
                                //controls.updateGUIwithName('autoPlay');
                                controls.timeStep = 0;
                            }
                            controls.changeTime();
                        }

                    }
                };

                this.changeDuplicate = function(){
                    console.error("unfortunately duplicate is not available now");
                    return;

                    //useDuplicate = controls.duplicate;
                    //initVertices();
                    //controls.changeTime();
                };

                this.changeInvertation = function(){
                    useInvertationColors = controls.invertColors;
                    controls.changeTime();
                };

                this.changeTime = function(){
                    controls.realTime = getTimeByTimeIndex(controls.timeStep).toFixed(2);
                    controls.updateGUIwithName('realTime');

                    initColorVertices( Math.round(controls.timeStep) );
                };

                this.changeMem = function(){
                    mem = data.memOut[ Math.round( controls.schemeIndex ) ];

                    countMinMax();

                    controls.cmin = cmin.toFixed(6);
                    controls.updateGUIwithName('cmin');
                    controls.cmax = cmax.toFixed(6);
                    controls.updateGUIwithName('cmax');

                    controls.changeTime();
                };

                this.changeVisualisationScheme = function(){
                    visualisationSchemeIndex = controls.visualisationSchemeIndex;
                    controls.changeTime();
                };

                this.changeCanvasVisible = function(){
                    setVisibility(renderer.domElement, controls.canvasVisible);
                    setVisibility(zeroDegreeText, controls.canvasVisible);
                    setVisibility(ninetyDegreeText, controls.canvasVisible);
                };

                this.changeAmplifyOfColors = function(){
                    amplifyColors = controls.amplifyColors;
                    controls.changeTime();
                };

                this.changeAmplifyValue = function(){
                    if (controls.amplifyColors){
                        amplifyCoef = controls.amplifyCoef;
                        controls.changeTime();
                    }
                };

                this.changeControlPoints = function(){
                    controlPointsDots.visible = controls.showControlPoints;
                    nearestPointsDots.visible = controls.showControlPoints;
                };

                this.changeVisibilityCPData = function(){
                    setControlPointsData(controls.showCPData);
                };

                this.changeVisibilityMemOutData = function(){
                    setDisplayData(controls.showMemOutData);
                };
            };

            var gui = new dat.GUI({autoPlace: false});
            gui.domElement.style.position = 'absolute';
            gui.domElement.style.left = '0px';
            gui.domElement.style.top = '50px';
            document.body.appendChild(gui.domElement);

            gui.add(controls, 'autoPlay').onChange(controls.autoUpdate);
            gui.add(controls, 'timeStep').min(0).max(timeStepsCount-1).step(1).onChange(controls.changeTime);
            gui.add(controls, 'schemeIndex', {
                'V_1.dat': 0,
                'V_2.dat': 1,
                'S11.dat': 2,
                'S22.dat': 3,
                'S12.dat': 4
            }).onChange(controls.changeMem);
            //gui.add(controls, 'invertColors').onChange(controls.changeInvertation);
            //gui.add(controls, 'duplicate').onChange(controls.changeDuplicate);
            gui.add(controls, 'visualisationSchemeIndex', {
                'Rainbow': 0,
                'HSV': 1,
                'Red-White-Blue': 2,
                'Gray': 3,
                'Red': 4,
                'Green': 5,
                'Blue': 6
            }).onChange(controls.changeVisualisationScheme);
            gui.add(controls, 'autoUpdateInterval').min(10).max(1000).step(10);
            gui.add(controls, 'canvasVisible').onChange(controls.changeCanvasVisible);
            gui.add(controls, 'realTime');
            gui.add(controls, 'amplifyColors').onChange(controls.changeAmplifyOfColors);
            gui.add(controls, 'amplifyCoef').min(0.5).max(4).step(0.1).onChange(controls.changeAmplifyValue);
            gui.add(controls, 'showControlPoints').onChange(controls.changeControlPoints);
            gui.add(controls, 'showCPData').onChange(controls.changeVisibilityCPData);
            gui.add(controls, 'cmin');
            gui.add(controls, 'cmax');
            gui.add(controls, 'showMemOutData').onChange(controls.changeVisibilityMemOutData);

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

            function setVisibility(object, state){
                //if (!object) { console.error("no object for visibility"); return; }
                //if (state === undefined || state === null) { console.error("no visibility state"); return; }
                //if (!object.style) { console.error("no style in object"); return; }
                // TODO fifefox says that style has no property "visibility", why so?
                //if (!object.style.hasOwnProperty("visibility")) { console.error("no style.visibility in object"); return; }

                if (state === true) object.style.visibility = "visible";
                else if (state === false) object.style.visibility = "hidden";
                else console.error("state neither true nor false, state:", state);
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