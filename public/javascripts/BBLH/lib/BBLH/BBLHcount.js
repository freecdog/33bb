/**
 * Created by jaric on 30.05.2017.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    // TODO npm install buffer
    if (typeof Buffer !== "function") {
        Buffer = function (inp){
            return new String(inp);
        };
    }

    (function (Buffer) {
    //(function(exports){

        'use strict';

        var BBLHcount = {};
        console.log("BBLHcount is starting");

        // global on the server, window in the browser
        var root, previous_BBLHcount;

        root = this;
        if (root != null) {
            previous_BBLHcount = root.BBLHcount;
        }

        var async = require('async');
        var numbers = require('numbers');
        var fs = require('fs');

        var BBLH;

        var data;

        var Complex = numbers.complex;
        var matrix = numbers.matrix;

        // TODO probably my methods should be here, but not in numbers.matrix code, also I should test values, so now it stays commented
        // matrix.scalarSafe = function(arr, value){ }

        // helpful methods
        function compareWithEps(num1, num2, eps){
            eps = eps || 1e-6;
            return (Math.abs(num1 - num2) < eps);
        }

        function arrToString(arr, start, len){
            start = start || 0;
            len = len || arr.length;
            var str = "";
            for (var i = start ; i < len; i++){
                var tp = typeof arr[i];
                if (tp == 'string') {
                    str += arr[i];
                } else if (tp == 'number') {
                    str += arr[i].toFixedDef();
                } else {
                    console.log("something wrong happened with current argument:", arr[i]);
                }
                if (i+1 != len) str += ' ';
            }
            return str;
        }
        function arrToStringR(arr) {
            var str = "";
            for (var i in arr){
                if (arr.hasOwnProperty(i)){
                    var tp = typeof arr[i];
                    if (tp == 'string') {
                        str += arr[i];
                    } else if (tp == 'number') {
                        str += arr[i].toFixedDef();
                    } else if (tp == 'object') {
                        str += arrToStringR(arr[i]);
                    } else {
                        console.log("something wrong happened with current argument:", arr[i]);
                    }
                    str += ' ';
                }
            }
            return str;
        }

        Number.prototype.toFixedDef = function(){
            return this.toFixed(3);
        };

        String.prototype.toFixedLen = function(len, align){
            align = align || 0;
            var s = this.toString();
            for (var i = s.length, flag = true; i < len; i++) {
                if (align == 0) {           // left align
                    s += " ";
                } else if (align == 1) {    // center align
                    if (flag) s += " ";
                    else s = " " + s;
                    flag = !flag;
                } else {                    // right align
                    s = " " + s;
                }
            }
            return s;
        };

        function COUNTPROC(callback){
            var countProcProfiler = new Date();
            console.log("COUNTPROC has start work");

            callback = callback || function(){};

            BBLH = require('../BBLH');
            var FUNC2 = BBLH.FUNC2;
            var MatMult = BBLH.MatMult;
            var BBLHstart = BBLH.BBLHstart;
            var BBLHstatic = BBLH.BBLHstatic;
            var Datatone = BBLH.Datatone;

            data = new Datatone();
            var NTP = data.NTP,
                NFI = data.NFI,
                NBX = data.NBX,
                INDEX = data.INDEX,
                T0 = data.T0,
                R = data.R,
                ALFA = data.ALFA,
                TM = data.TM,
                DT = data.DT,
                STEP = data.STEP,
                DFI = data.DFI,
                DF = data.DF,
                TAR = data.TAR,
                COURB = data.COURB,
                LONG = data.LONG,
                FAR = data.FAR,
                DX = data.DX,
                FIX = data.FIX,
                FIY = data.FIY,
                Q = data.Q,
                DELTA = data.DELTA,
                FIXP = data.FIXP,
                FIXM = data.FIXM,
                FIYP = data.FIYP,
                FIYM = data.FIYM,
                FG = data.FG,
                TET0 = data.TET0,
                TP = data.TP,
                ITP = data.ITP,

                NL = data.NL,
                layers = data.layers,
                LE = data.LE,
                LRO = data.LRO,
                LNU = data.LNU,
                LH = data.LH,
                C = data.C,
                LB= data.LB,
                LRC= data.LRC,
                LK= data.LK,
                BOUNDARYS= data.BOUNDARYS,
                LG= data.LG,
                NSTEP= data.NSTEP,
                HTOTAL = data.HTOTAL,
                CHECK = data.CHECK,

                XDESTR = data.XDESTR,
                LC = data.LC,
                STEPX = data.STEPX,
                ALIM = data.ALIM,
                C0 = data.C0,
                //fds1 = data.fds1,
                //fds2 = data.fds2,
                RC0 = data.RC0,
                needRealValues = data.needRealValues,

                HEFFECT = data.HEFFECT,

                GAF1 = data.GAF1,
                GAF2 = data.GAF2,
                QG = data.QG,

                G = data.G,

                LO = data.LO,
                HI = data.HI,
                OnlyStaticLoad = data.OnlyStaticLoad,
                CMAX = data.CMAX,
                CAVERAGE = data.CAVERAGE;

            var I, J, K, N, KJ, NX, ICOUNT = 1, GABS,GABE, II, IK, L, M; // integer
            var FIM, KSI, KSIN, P, PP, COM, T, X, LM, TETA, TOUT, LOM, CF, SF, IB, JX; // float
            var WT; // boolean
            var DZ0, Z; // Complex
            var LX, LAX, E; // [5, 5] of float
            var W, U, UFI; // [5] of float
            var GOUT; // [,,] of float
            var GA; // [:,:,:,:] of float
            //var GAF1, GAF2; // [,,] of float
            //var LO, HI; // [] of integer

            var GABobj; // to convert GABS and GABE

            var ARS = ['V_01.dat','V_02.dat','S011.dat','S022.dat','S012.dat'];

            var fds = [];
            for (N = 0; N < ARS.length; N++){
                var initPath = 'BBLHdat/_' + ARS[N];
                fds.push( fs.openSync(initPath, 'w') );
            }
            data.fds = fds;

            var genSize = ARS.length;
            var jStepsCnt;

            // ALLOCATE(G(5, 0:NBX+10,0:NFI),GOUT(5,0:NINT(CHECK/STEPX),1:NTP+1))	 !GOUT- МАССИВ ДЛЯ ВЫВОДА
            // ALLOCATE(GAF1(1:NL-1,5,0:NFI),GAF2(1:NL-1,5,0:NFI),LO(NL),HI(NL) );	! LO,HI- НИЖНИЕ И ВЕРХНИЕ ГРАНИЦЫ СЛОЁВ СООТВЕТСТВЕННО

            // G(КОМПОНЕНТА, КООРДИНАТА, УГОЛ)
            //G = MatMult.createArray(genSize, NBX+10 +1, NFI+1);

            GOUT = MatMult.createArray(genSize, Math.round(HEFFECT/STEPX)+1, NTP+1);

            // all this were moved to BBLHstatic.js
            //GAF1 = MatMult.createArray(NL-1, genSize, NFI+1);
            //MatMult.fillArray(GAF1, 0);
            //GAF2 = MatMult.createArray(NL-1, genSize, NFI+1);
            //MatMult.fillArray(GAF2, 0);
            //LO = MatMult.createArray(NL);
            //HI = MatMult.createArray(NL);

            E = MatMult.createArray(5,5);
            MatMult.fillArray(E, 0);
            for (I = 0; I < 5; I++) E[I][I] = 1;

            W = MatMult.createArray(5);
            U = MatMult.createArray(5);
            UFI = MatMult.createArray(5);

            T = 0;
            TOUT = T;
            NX = NBX - 1;
            DZ0 = ZET(TET0);

            //CALCBOUNDARIES(LO,HI);

            //MatMult.fillArraySafe(G, 0);


            //GA = MatMult.createArray(genSize , 2);
            //delete GA[0];
            //for (var c0 in GA) {
            //    if (!GA.hasOwnProperty(c0)) continue;
            //    for (var c01 = -1; c01 <= 1; c01++) GA[c0][c01] = 0;
            //}

            INITLOAD();

            var memoutCounter = 0;
            var memout = [];
            data.memout = memout;

            // all this were moved to BBLHstatic.js
            //data.HI = HI;
            //data.LO = LO;

            jStepsCnt = 0;
            async.whilst(
                function(){
                    var calcNext = (T <= TM + 1e-6);

                    if (data.breakCalculation === true){
                        data.breakCalculation = false;

                        calcNext = false;
                    }

                    return calcNext;
                },
                function(callback){
                    var timeAtStart = Date.now();

                    BBLHstatic.FICTCELLS(GAF1, GAF2, G);

                    console.log("T = " + T.toFixed(2));

                    LK[0] = NX - Math.round(HTOTAL/DX);


                    M = 0;
                    for (L = 0; L < NL; L++) {
                        if (LK[L] > M) M = LK[L];
                    }
                    //ALLOCATE(GA(1:NL,5,0:M+1,0:NFI))
                    GA = MatMult.createArray(NL, genSize, M + 2, NFI+1);

                    for (L = NL-1; L >= 0; L--){
                        //GA(L,:,:,:)=0;
                        MatMult.fillArray(GA[L], 0);

                        GABS = LO[L];
                        GABE = HI[L];

                        //DO I=0,NFI
                        //DO J=1,LK(L)
                        //GA(L,:,J,I)=G(:,GABS+J-1,I)
                        //END DO
                        //END DO
                        for (var i20 = 0; i20 <= NFI; i20++)
                            for (var i21 = 1; i21 <= LK[L]; i21++)
                                for (var i22 = 0, i22len = GA[0].length; i22 < i22len; i22++)
                                    GA[L][i22][i21][i20] = G[i22][GABS+i21-1][i20];

                        // IF (L/=NL) GA(L,:,0,0:NFI)=GAF1(L,:,0:NFI)
                        if (L != NL-1)
                            for (var i23 = 0; i23 < GA[0].length; i23++)
                                for (var i24 = 0; i24 <= NFI; i24++)
                                    GA[L][i23][0][i24] = GAF1[L][i23][i24];
                        // IF (L/=1)  GA(L,:,LK(L)+1,0:NFI)=GAF2(L-1,:,0:NFI)
                        if (L != 0)
                            for (var i25 = 0; i25 < GA[0].length; i25++)
                                for (var i26 = 0; i26 <= NFI; i26++)
                                    GA[L][i25][LK[L]+1][i26] = GAF2[L-1][i25][i26];
                    }

                    // G(:,0,0:NFI)=FG(NL,:,:).x.G(:,1,0:NFI);
                    var g0 = [];
                    for (var g0i = 0; g0i < G.length; g0i++){
                        //var g0arr = [];
                        //for (var g0j = 0; g0j <= NFI; g0j++) g0arr.push(G[g0i][1][g0j]);
                        var g0arr = G[g0i][1].slice(0);
                        g0.push(g0arr);
                    }
                    var g0mult = matrix.multiply(FG[NL-1], g0);
                    for (var g0m = 0; g0m < G.length; g0m++)
                        //for (var g0n = 0, g0nlen = g0mult[0].length; g0n < g0nlen; g0n++)
                        for (var g0n = 0; g0n <= NFI; g0n++)
                            G[g0m][0][g0n] = g0mult[g0m][g0n];    // G[][0][] 0 because Harry as me numerates from 0

                    if (OnlyStaticLoad == true) {
                        // G(1:2,0,0:NFI) =0;
                        for (var i27 = 0; i27 < 2; i27++)
                            for (var i28 = 0; i28 <= NFI; i28++)
                                G[i27][0][i28] = 0;
                    }

                    // GA(NL,:,0,0:NFI)=FG(NL,:,:).x.GA(NL,:,1,0:NFI)
                    var g10 = [];
                    for (var g10i = 0; g10i < GA[0].length; g10i++){
                        var g10arr = GA[NL-1][g10i][1].slice(0);
                        g10.push(g10arr);
                    }
                    var g10mult = matrix.multiply(FG[NL-1], g10);
                    for (var g10m = 0; g10m < GA[0].length; g10m++)
                        for (var g10n = 0; g10n <= NFI; g10n++)
                            GA[NL-1][g10m][0][g10n] = g10mult[g10m][g10n];

                    // GA(1,:,LK(1)+1,0:NFI)=G(:,GABE+1,0:NFI);
                    for (var i6 = 0; i6 < GA[0].length; i6++)
                        for (var i7 = 0; i7 <= NFI; i7++)
                            GA[0][i6][LK[0]+1][i7] = G[i6][GABE+1][i7];


                    X = 0;

                    for (L = NL-1; L >= 0; L--){
                        LM = C[L] / C0;

                        GABS = LO[L];
                        //GABE = HI[L];

                        if (T > 0){
                            I = NFI;
                            K = 1;

                            while(true){
                                I = NFI - I + K;
                                K = 1 - K;
                                //DFI = DF[I];
                                TETA = TAR[I];
                                COM = COURB[I] * R;
                                LOM = LONG[I] / R;
                                //FIM = FAR[I];
                                FIM = FUNC2.ATN(TETA);

                                CF = Math.cos(FIM);
                                Z = ZET(TETA);
                                KSIN = (Z.subtract(DZ0)).re;

                                QG.length = 0;
                                QG[0] = ( R*9.81 / (C[L]*C[L]) ) * Math.cos(FIM);
                                QG[1] = - ( R*9.81 / (C[L]*C[L]) ) * Math.sin(FIM);
                                QG[2] = 0;
                                QG[3] = 0;
                                QG[4] = 0;
                                //QG(1)=( R*9.81 / (C(L)*C(L)) ) * COS(FIM);
                                //QG(2)=-( R*9.81 / (C(L)*C(L)) ) * SIN(FIM);
                                QG = matrix.vectorTranspose(QG);

                                var constMatrix1 = matrix.scalarSafe(FIX[L], DT * LM / DX);
                                var constMatrix2 = matrix.scalarSafe(FIY[L], DT * LM  / DFI);
                                var constMatrix3 = matrix.scalarSafe(Q[L], DT * LM);

                                JX = X;
                                for (J = 1; J <= LK[L]; J++){
                                    KJ = GABS - 1 + J;

                                    // TODO is it C0 or C[L]?

                                    //KSI = JX * CF - (HTOTAL - CMAX/C0*T + KSIN);
                                    //KSI = JX * CF - (HTOTAL - CAVERAGE/C[L]*T + KSIN);
                                    KSI = JX * CF - (HTOTAL - CAVERAGE/C0*T + KSIN);    // or C[L]/C[0]

                                    JX = JX + DX;

                                    if (KSI >= 0) {
                                        P = 1 / ((1 + COM * (JX - DX / 2)) * LOM);
                                        PP = COM / (1 + COM * (JX - DX / 2));
                                        // LAX=DT*LM/DX*FIX(L,:,:)+DT*LM*P/DFI*FIY(L,:,:)+DT*LM*PP*Q(L,:,:)
                                        // it seems like no speed up here
                                        LAX = matrix.addition(
                                            matrix.addition(
                                                constMatrix1,
                                                matrix.scalarSafe(constMatrix2, P)
                                            ),
                                            matrix.scalarSafe(constMatrix3, PP)
                                        );
                                        //LAX = matrix.addition(
                                        //    matrix.addition(
                                        //        matrix.scalarSafe(FIX[L], DT * LM / DX),
                                        //        matrix.scalarSafe(FIY[L], DT * LM * P / DFI)
                                        //    ),
                                        //    matrix.scalarSafe(Q[L], DT * LM * PP)
                                        //);
                                        LX = matrix.subtract(E, matrix.scalarSafe(LAX, 1 - DELTA));

                                        // W=LX.x.GA(L,:,J,I);
                                        var ga0 = matrix.getColUnSafe3x(GA[L], J, I);
                                        ga0 = matrix.vectorTranspose(ga0);
                                        W = matrix.multiply(LX, ga0);

                                        // U=FIXP(L,:,:).x.GA(L,:,J-1,I)
                                        var ga1 = matrix.getColUnSafe3x(GA[L], J - 1, I);
                                        ga1 = matrix.vectorTranspose(ga1);
                                        U = matrix.multiply(FIXP[L], ga1);
                                        // W=W+DT*LM/DX*U;
                                        W = matrix.addition(W, matrix.scalarSafe(U, DT * LM / DX));

                                        // U=FIXM(L,:,:).x.GA(L,:,J+1,I)
                                        var ga2 = matrix.getColUnSafe3x(GA[L], J + 1, I);
                                        ga2 = matrix.vectorTranspose(ga2);
                                        U = matrix.multiply(FIXM[L], ga2);
                                        // W=W+DT*LM/DX*U;
                                        W = matrix.addition(W, matrix.scalarSafe(U, DT * LM / DX));

                                        // U=FIYP(L,:,:).x.GA(L,:,J,I-1)
                                        var ga3 = matrix.getColUnSafe3x(GA[L], J, I - 1);
                                        ga3 = matrix.vectorTranspose(ga3);
                                        U = matrix.multiply(FIYP[L], ga3);
                                        // W=W+DT*LM*P/DFI*U;
                                        W = matrix.addition(W, matrix.scalarSafe(U, DT * LM * P / DFI));

                                        // U=FIYM(L,:,:).x.GA(L,:,J,I+1)
                                        var ga4 = matrix.getColUnSafe3x(GA[L], J, I + 1);
                                        ga4 = matrix.vectorTranspose(ga4);
                                        U = matrix.multiply(FIYM[L], ga4);
                                        // W=W+DT*LM*P/DFI*U - DT*LM*QG;
                                        W = matrix.addition(W, matrix.scalarSafe(U, DT * LM * P / DFI));
                                        W = matrix.addition(W, matrix.scalarSafe(QG, -DT * LM));

                                        LX = matrix.addition(E, matrix.scalarSafe(LAX, DELTA));
                                        LX = matrix.inverse(LX);
                                        W = matrix.multiply(LX, W);

                                        // G(:,KJ,I)=W;
                                        for (var i16 = 0; i16 < G.length; i16++)
                                            G[i16][KJ][I] = W[i16][0];

                                    }   // end if (KSI >= 0)

                                }   // end for J
                                if ((NFI == 2*I) || (NFI == 2*I-1)) break;
                            }   // end while true (I)
                            X = JX;

                            for (var i8 = 0; i8 < G.length; i8++) {
                                for (var i9 = GABS; i9 <= GABE; i9++) {
                                    // G(:,GABS:GABE,0)= 	G(:,GABS:GABE,NFI-1);
                                    G[i8][i9][0] = G[i8][i9][NFI - 1];
                                    // G(:,GABS:GABE,NFI)= G(:,GABS:GABE,1);
                                    G[i8][i9][NFI] = G[i8][i9][1];
                                }
                            }

                        }   // if T > 0
                    }   // for L

                    //IF(.NOT.BEGIN.AND.(T>0)) STOP;
                    if (OnlyStaticLoad && T > 0) {
                        data.breakCalculation = true;
                    }

                    WT = T >= TOUT;

                    var timeBeforeCountOut = Date.now();
                    if (WT) {
                        OUT(T);
                        TOUT += STEP;
                    }

                    T += DT;
                    data.currentT = T;

                    NX = NX - 1;

                    GA.length = 0;

                    jStepsCnt++;
                    if (T >= 0) console.log(jStepsCnt, ")", Date.now()-timeAtStart, "ms to count()", '; CountOut:', Date.now() - timeBeforeCountOut, 'ms');

                    //callback();
                    // It should be a joke, but setTimeout works faster or for the same time! How come?
                    // but setTimeout at least has interruptions so DOM can be rendered
                    setTimeout(callback, 1);
                },
                function(err){
                    if (err) console.log(err, "!!!!!!!!!!!");

                    for (var i = 0; i < ARS.length; i++){
                        //noinspection JSUnresolvedFunction
                        fs.closeSync(fds[i]);
                    }

                    console.log("COUNTPROC has end work", (new Date()) - countProcProfiler, "ms to complete COUNTPROC");

                    calculateDeformations();

                    callback();
                }
            );  // end of async.whilst

            ////}

            function calculateDeformations(){
                // From book Filonenko-Borodich M.M. Teoriya uprugosti (str. 138)
                console.time("calculateDeformations");

                var e11 = [], e22 = [], e12 = [];

                var lenTime  = memout.length;
                //var lenParam = memout[0].length;
                var lenCoord = memout[0][0].length;
                var lenAngle = memout[0][0][0].length;

                for (var i = 0; i < lenTime; i++){
                    var timexx = [];
                    var timeyy = [];
                    var timexy = [];

                    for (var m = 0; m < lenCoord; m++){
                        var coordxx = [];
                        var coordyy = [];
                        var coordxy = [];

                        var coord = m * data.STEPX;
                        var layer = getLayerNumberByCoordinate(coord);

                        var nu = data.layers[layer].NU;
                        var E = data.layers[layer].E;
                        var c1 = (1 + nu) / E;

                        for (var n = 0; n < lenAngle; n++){
                            var Xx = memout[i][2][m][n];
                            var Yy = memout[i][3][m][n];
                            var Xy = memout[i][4][m][n];

                            // exx = (1 + nu) / E * ( (1-nu)*Xx - nu*Yy )
                            // eyy = (1 + nu) / E * ( (1-nu)*Yy - nu*Xx )
                            // exy = 2 * (1 + nu) / E * Xy

                            var exx = c1 * ( (1-nu)*Xx - nu*Yy );
                            var eyy = c1 * ( (1-nu)*Yy - nu*Xx );
                            var exy = 2 * c1 * Xy;

                            coordxx.push(exx);
                            coordyy.push(eyy);
                            coordxy.push(exy);
                        }

                        timexx.push(coordxx);
                        timeyy.push(coordyy);
                        timexy.push(coordxy);
                    }

                    e11.push(timexx);
                    e22.push(timeyy);
                    e12.push(timexy);

                    memout[i][5] = timexx;
                    memout[i][6] = timeyy;
                    memout[i][7] = timexy;
                }

                console.timeEnd("calculateDeformations");
            }

            function getLayerNumberByCoordinate(X){
                //var L, ans;   // integer
                //ans=0;
                //for (L = NL-1; L > 0; L--){
                //    // TODO this shouldn't be true, but it is (getLayerNumberByCoordinate, probably comparision problems in Fortran)
                //    if (X < HI[L]*DX + 1e-6){
                //        ans = L;
                //        return ans;
                //    }
                //}
                //return ans;

                var K, L, ans;   // integer
                ans=0;
                for (L = NL-1; L > 0; L--){
                    // TODO this shouldn't be true, but it is (getLayerNumberByCoordinate, probably comparision problems in Fortran)
                    if (X <= HI[L]*DX + 1e-6){
                        ans = L;
                        return ans;
                    }
                }
                return ans;
            }

            function OUT(T){
                var X; // float
                var I, J, K, M, L;  // integer
                var st, rBuffer;
                for (M = 0; M < 5; M++){
                    rBuffer = new Buffer("T="+ T.toString() + "\n");
                    fs.writeSync(fds[M], rBuffer, rBuffer.length, null);
                    st = "L, X/TETA, ";
                    for (var i = 1; i <= NTP+1; i++) st += TP[i].toString() + " ";
                    st += "\n";
                    rBuffer = new Buffer(st);
                    fs.writeSync(fds[M], rBuffer, rBuffer.length, null);

                    var len = Math.round(CHECK/STEPX);
                    for (I = 0; I <= len; I++){
                        X = I * STEPX;
                        K = Math.round(X/DX);
                        L = getLayerNumberByCoordinate(X);

                        // TODO ask Harry to check it out
                        for (J = 1; J <= NTP+1; J++) {
                            if (needRealValues){
                                // GOUT(M,I,J)=LG(L,M,:).x.G(:,K,ITP(J));
                                var ans = 0;
                                for (var lgi = 0; lgi < LG[L][M].length; lgi++) ans += LG[L][M][lgi] * G[lgi][K][ITP[J]];
                                GOUT[M][I][J-1] = ans;

                                //var g2 = [matrix.getColUnSafe(LG[L], M)];
                                //var g3 = matrix.transpose([matrix.getColUnSafe3x(G, K, ITP[J])]);
                                //var g2mult = matrix.multiply(g2, g3);
                                //GOUT[M][I][J-1] = g2mult[0][0];
                            } else {
                                // GOUT(M,I,J)=G(M,K,ITP(J));
                                GOUT[M][I][J-1] = G[M][K][ITP[J]];
                            }
                        }

                        st = L.toString() + " " + (X*R).toString() + " ";
                        for (J = 0; J < NTP+1; J++) st += GOUT[M][I][J].toString() + " ";
                        st += "\n";
                        rBuffer = new Buffer(st);
                        fs.writeSync(fds[M], rBuffer, rBuffer.length, null);
                    }
                }

                var mRec = MatMult.createArray(genSize, Math.round(CHECK/STEPX)+1, NTP+1);
                for (var m0 = 0, m0len = GOUT.length; m0 < m0len; m0++){
                    for (var m1 = 0, m1len = GOUT[m0].length; m1 < m1len; m1++) {
                        mRec[m0][m1] = GOUT[m0][m1].slice(0);
                        //for (var m2 = 0, m2len = GOUT[m0][m1].length; m2 < m2len; m2++) {
                        //    mRec[m0][m1][m2] = GOUT[m0][m1][m2];
                        //}
                    }
                }
                memout[memoutCounter] = mRec;
                memoutCounter++;
            }

            function INITLOAD(){
                var I, K;
                var B = LB[0];

                if (OnlyStaticLoad == false) {
                    for (I = 0; I <= NFI; I++) {
                        TETA = TAR[I];
                        FIM = FAR[I];
                        Z = ZET(TETA);
                        KSIN = (Z.subtract(DZ0)).re;
                        CF = Math.cos(FIM);
                        SF = Math.sin(FIM);
                        UFI[0] = CF;
                        UFI[1] = -SF;
                        UFI[2] = 1 - 2 * B * SF * SF;
                        UFI[3] = 1 - 2 * B * CF * CF;
                        UFI[4] = -2 * B * CF * SF;

                        for (K = 0; K <= NBX + 10; K++) {
                            KSI = K * DX * CF - (HTOTAL + KSIN);
                            //KSI = K*DX*CF - KSIN; // Wave would be near object at T=0

                            //if (KSI < 0) {
                            //    for (var c1 = 0; c1 < 5; c1++) G[c1][K][I] = 0;
                            //} else {
                            //    var IFF = BBLHstart.FF(LC * KSI);
                            //    for (var c2 = 0; c2 < 5; c2++) G[c2][K][I] = IFF * UFI[c2];
                            //}

                            // TODO check this very carefully, it could be problem with equality
                            if (KSI >= 0){
                                var IFF = BBLHstart.FF(LC * KSI);
                                for (var c2 = 0; c2 < 5; c2++) G[c2][K][I] = G[c2][K][I] + IFF * UFI[c2];
                            }
                        }
                    }
                }
            }


            function alternativeMultiply(A,B){
                var C = MatMult.createArray(A.length, B[0].length);
                var sum = 0;
                for (var i = 0; i < C.length; i++){
                    for (var j = 0; j < C[0].length; j++){
                        sum = 0;
                        for (var k = 0; k < A[0].length; k++){
                            sum += A[i][k]*B[k][j];
                        }
                        C[i][j] = sum;
                    }
                }
                return C;
            }




            function ZET(T){
                // ZET=-RTET(T)*EXP(IM*(T-ALFA))/R;
                return (new Complex(-FUNC2.RTET(T), 0)).multiply(new Complex(Math.cos(T-ALFA), Math.sin(T-ALFA))).divide(new Complex(R, 0));
            }
        }
        //exports.COUNTPROC = COUNTPROC;
        BBLHcount.COUNTPROC = COUNTPROC;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBLHcount;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBLHcount;
            });
        }
        // included directly via <script> tag
        else {
            root.BBLHcount = BBLHcount;
        }

    }(Buffer));
    //})(typeof exports === 'undefined'? this['BBLHcount']={} : exports);

});
