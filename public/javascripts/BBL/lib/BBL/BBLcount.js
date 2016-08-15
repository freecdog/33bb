/**
 * Created by jaric on 08.07.2016.
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

        var BBLcount = {};
        console.log("BBLcount is starting");

        // global on the server, window in the browser
        var root, previous_BBcount;

        root = this;
        if (root != null) {
            previous_BBcount = root.BBcount;
        }

        var async = require('async');
        var numbers = require('numbers');
        var fs = require('fs');

        var BBL;

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

            BBL = require('../BBL');
            var FUNC2 = BBL.FUNC2;
            var MatMult = BBL.MatMult;
            var BBLstart = BBL.BBLstart;
            var Datatone = BBL.Datatone;

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
                needRealValues = data.needRealValues;

            var I, J, K, N, KJ, NX, ICOUNT = 1, GABS,GABE, II, IK; // integer
            var FIM, KSI, KSIN, P, PP, COM, T, X, LM, TETA, TOUT, LOM, CF, SF, IB, JX; // float
            var WT; // boolean
            var DZ0, Z; // Complex
            var LX, LAX, E; // [5, 5] of float
            var W, U, UFI; // [5] of float
            var G, GOUT; // [,,] of float
            var GA; // [5, -1:1] of float
            var GAF1, GAF2; // [,,] of float
            var LO, HI; // [] of integer

            var GABobj; // to convert GABS and GABE

            var ARS = ['V_01.dat','V_02.dat','S011.dat','S022.dat','S012.dat'];

            var fds = [];
            for (N = 0; N < ARS.length; N++){
                var initPath = 'BBLdat/_' + ARS[N];
                fds.push( fs.openSync(initPath, 'w') );
            }
            data.fds = fds;

            var genSize = ARS.length;
            var jStepsCnt;

            // ALLOCATE(G(5, 0:NBX+10,0:NFI),GOUT(5,0:NINT(CHECK/STEPX),1:NTP+1))	 !GOUT- МАССИВ ДЛЯ ВЫВОДА
            // ALLOCATE(GAF1(1:NL-1,5,0:NFI-1),GAF2(1:NL-1,5,0:NFI-1),LO(NL),HI(NL) );	! LO,HI- НИЖНИЕ И ВЕРХНИЕ ГРАНИЦЫ СЛОЁВ СООТВЕТСТВЕННО

            // G(КОМПОНЕНТА, КООРДИНАТА, УГОЛ)
            G = MatMult.createArray(genSize, NBX+10 +1, NFI+1);
            GOUT = MatMult.createArray(genSize, Math.round(CHECK/STEPX)+1, NTP+1);
            GAF1 = MatMult.createArray(NL-1, genSize, NFI);
            MatMult.fillArray(GAF1, 0);
            GAF2 = MatMult.createArray(NL-1, genSize, NFI);
            MatMult.fillArray(GAF2, 0);
            LO = MatMult.createArray(NL);
            HI = MatMult.createArray(NL);

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
            MatMult.fillArraySafe(G, 0);
            CALCBOUNDARIES(LO,HI);

            //GA = MatMult.createArray(genSize , 2);
            //delete GA[0];
            //for (var c0 in GA) {
            //    if (!GA.hasOwnProperty(c0)) continue;
            //    for (var c01 = -1; c01 <= 1; c01++) GA[c0][c01] = 0;
            //}

            INITLOAD();
            data.G = G;

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

                    FICTCELLS(GAF1, GAF2);

                    console.log("T =", T);

                    LK[0] = NX - Math.round(HTOTAL/DX);
                    X = 0;

                    for (var L = NL-1; L >= 0; L--){
                        LM = C[L] / C0;
                        // ALLOCATE(GA(5,0:LK(L)+1,0:NFI))
                        GA = MatMult.createArray(genSize, LK[L]+2, NFI+1);
                        MatMult.fillArray(GA, 0);

                        GABS = LO[L];
                        GABE = HI[L];

                        //DO I=1,NFI-1
                        //  DO J=1,LK(L)
                        //      GA(:,J,I)=G(:,GABS+J-1,I)
                        //  END DO
                        //END DO
                        for (var i0 = 1; i0 < NFI; i0++)
                            for (var i1 = 1; i1 <= LK[L]; i1++)
                                for (var i2 = 0, i2len = GA.length; i2 < i2len; i2++)
                                    GA[i2][i1][i0] = G[i2][GABS+i1-1][i0];

                        if (L == NL-1){
                            // G(:,0,1:NFI-1)=FG(NL,:,:).x.G(:,1,1:NFI-1);
                            var g0 = [];
                            for (var g0i = 0; g0i < G.length; g0i++){
                                var g0arr = [];
                                for (var g0j = 1; g0j < NFI; g0j++) g0arr.push(G[g0i][1][g0j]);
                                g0.push(g0arr);
                            }
                            var g0mult = matrix.multiply(FG[NL-1], g0);
                            for (var g0m = 0; g0m < G.length; g0m++)
                                for (var g0n = 0, g0nlen = g0mult[0].length; g0n < g0nlen; g0n++)
                                    G[g0m][0][g0n+1] = g0mult[g0m][g0n];    // G[][0][] 0 because Harry as me numerates from 0
                            // GA(:,0,1:NFI-1)=G(:,0,1:NFI-1);
                            for (var i3 = 0; i3 < GA.length; i3++)
                                for (var i4 = 1; i4 < NFI; i4++)
                                    GA[i3][0][i4] = G[i3][0][i4];
                        }

                        if (L == 0){
                            // GA(:,LK(L)+1,1:NFI-1)=G(:,GABE+1,1:NFI-1);
                            for (var i6 = 0; i6 < GA.length; i6++)
                                for (var i7 = 1; i7 < NFI; i7++)
                                    GA[i6][LK[L]+1][i7] = G[i6][GABE+1][i7];
                        }

                        for (var i8 = 0; i8 < G.length; i8++) {
                            for (var i9 = GABS; i9 <= GABE; i9++) {
                                // G(:,GABS:GABE,0)= 	G(:,GABS:GABE,NFI-1);
                                G[i8][i9][0] = G[i8][i9][NFI - 1];
                                // G(:,GABS:GABE,NFI)= G(:,GABS:GABE,1);
                                G[i8][i9][NFI] = G[i8][i9][1];
                            }
                        }

                        for (var i10 = 0; i10 < GA.length; i10++) {
                            for (var i11 = 0, i11len = GA[0].length; i11 < i11len; i11++) {
                                // GA(:,:,0)= 	GA(:,:,NFI-1);
                                GA[i10][i11][0] = GA[i10][i11][NFI-1];
                                // GA(:,:,NFI)= GA(:,:,1);
                                GA[i10][i11][NFI] = GA[i10][i11][1];
                            }
                        }

                        // IF (L/=NL) GA(:,0,1:NFI-1)=GAF1(L,:,1:NFI-1)
                        if (L != NL-1)
                            for (var i12 = 0; i12 < GA.length; i12++)
                                for (var i13 = 1; i13 < NFI; i13++)
                                    GA[i12][0][i13] = GAF1[L][i12][i13];
                        // IF (L/=1)  GA(:,LK(L)+1,1:NFI-1)=GAF2(L-1,:,1:NFI-1)
                        if (L != 0)
                            for (var i14 = 0; i14 < GA.length; i14++)
                                for (var i15 = 1; i15 < NFI; i15++)
                                    GA[i14][LK[L]+1][i15] = GAF2[L-1][i14][i15];

                        if (T > 0){
                            I = NFI;
                            K = 1;

                            while(true){
                                I = NFI - I + K;
                                K = 1 - K;
                                DFI = DF[I];
                                TETA = TAR[I];
                                COM = COURB[I] * R;
                                LOM = LONG[I] / R;
                                FIM = FAR[I];

                                JX = X;
                                for (J = 1; J <= LK[L]; J++){
                                    KJ = GABS - 1 + J;
                                    JX = JX + DX;
                                    P = 1 / ((1 + COM * (JX - DX/2)) * LOM);
                                    PP = COM / (1 + COM * (JX - DX/2));
                                    // LAX=DT*LM/DX*FIX(L,:,:)+DT*LM*P/DFI*FIY(L,:,:)+DT*LM*PP*Q(L,:,:)
                                    LAX = matrix.addition(
                                        matrix.addition(
                                            matrix.scalarSafe(FIX[L], DT * LM / DX),
                                            matrix.scalarSafe(FIY[L], DT * LM * P / DFI)
                                        ),
                                        matrix.scalarSafe(Q[L], DT * LM * PP)
                                    );
                                    LX = matrix.subtract(E, matrix.scalarSafe(LAX, 1 - DELTA));

                                    // W=LX.x.GA(:,J,I);
                                    var ga0 = matrix.getColUnSafe3x(GA, J, I);
                                    ga0 = matrix.vectorTranspose(ga0);
                                    W = matrix.multiply(LX, ga0);

                                    // U=FIXP(L,:,:).x.GA(:,J-1,I)
                                    var ga1 = matrix.getColUnSafe3x(GA, J-1, I);
                                    ga1 = matrix.vectorTranspose(ga1);
                                    U = matrix.multiply(FIXP[L], ga1);
                                    // W=W+DT*LM/DX*U;
                                    W = matrix.addition(W, matrix.scalarSafe(U, DT * LM / DX));

                                    // U=FIXM(L,:,:).x.GA(:,J+1,I)
                                    var ga2 = matrix.getColUnSafe3x(GA, J+1, I);
                                    ga2 = matrix.vectorTranspose(ga2);
                                    U = matrix.multiply(FIXM[L], ga2);
                                    // W=W+DT*LM/DX*U;
                                    W = matrix.addition(W, matrix.scalarSafe(U, DT * LM / DX));

                                    // U=FIYP(L,:,:).x.GA(:,J,I-1)
                                    var ga3 = matrix.getColUnSafe3x(GA, J, I-1);
                                    ga3 = matrix.vectorTranspose(ga3);
                                    U = matrix.multiply(FIYP[L], ga3);
                                    // W=W+DT*LM*P/DFI*U;
                                    W = matrix.addition(W, matrix.scalarSafe(U, DT * LM * P / DFI));

                                    // U=FIYM(L,:,:).x.GA(:,J,I+1)
                                    var ga4 = matrix.getColUnSafe3x(GA, J, I+1);
                                    ga4 = matrix.vectorTranspose(ga4);
                                    U = matrix.multiply(FIYM[L], ga4);
                                    // W=W+DT*LM*P/DFI*U;
                                    W = matrix.addition(W, matrix.scalarSafe(U, DT * LM * P / DFI));

                                    LX = matrix.addition(E, matrix.scalarSafe(LAX, DELTA));
                                    LX = matrix.inverse(LX);
                                    W = matrix.multiply(LX, W);

                                    // G(:,KJ,I)=W;
                                    for (var i16 = 0; i16 < G.length; i16++)
                                        G[i16][KJ][I] = W[i16][0];

                                }   // for J
                                if ((NFI == 2*I) || (NFI == 2*I-1)) break;
                            }   // while true (I)
                            X = X + JX;

                        }   // if T > 0
                    }   // for L

                    if (T >= 0.95){
                        var aaa = 1;
                        aaa++;
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

                    callback();
                }
            );  // end of async.whilst

            ////}

            function getLayerNumberByCoordinate(X){
                var L, ans;   // integer
                ans=0;
                for (L = NL-1; L > 0; L--){
                    if (X < HI[L]*DX){
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
                        for (J = 0; J < NTP+1; J++) {
                            // GOUT(M,I,J)=LG(L,M,:).x.G(:,K,ITP(J)+1);
                            var g2 = matrix.getColUnSafe(LG[L], M);
                            var g3 = [];
                            //for (var g3i = 0; g3i < G.length; g3i++) g3.push(G[g3i][K][ITP[J]+1]);
                            g3 = matrix.getColUnSafe3x(G, K, ITP[J+1]+1);
                            //g2 = matrix.vectorTranspose(g2);
                            g2 = [g2];
                            g3 = matrix.vectorTranspose(g3);
                            var g2mult = matrix.multiply(g2, g3);
                            GOUT[M][I][J] = g2mult[0][0];
                        }

                        st = L.toString() + " " + (X*R).toString() + " ";
                        for (J = 0; J < NTP+1; J++) st += GOUT[M][I][J].toString() + " ";
                        st += "\n";
                        rBuffer = new Buffer(st);
                        fs.writeSync(fds[M], rBuffer, rBuffer.length, null);
                    }
                }
            }

            function INITLOAD(){
                var I, K;
                var B = LB[0];
                for (I = 0; I <= NFI; I++){
                    TETA = TAR[I];
                    FIM = FAR[I];
                    Z = ZET(TETA);
                    KSIN = (Z.subtract(DZ0)).re;
                    CF = Math.cos(FIM);
                    SF = Math.sin(FIM);
                    UFI[0] = CF;
                    UFI[1] = -SF;
                    UFI[2] = 1 - 2*B * SF*SF;
                    UFI[3] = 1 - 2*B * CF*CF;
                    UFI[4] = -2*B * CF*SF;

                    for (K = 0; K <= NBX+10; K++) {
                        KSI = K*DX*CF - (HTOTAL + KSIN);
                        if (KSI < 0) {
                            for (var c1 = 0; c1 < 5; c1++) G[c1][K][I] = 0;
                        } else {
                            var IFF = BBLstart.FF(LC*KSI);
                            for (var c2 = 0; c2 < 5; c2++) G[c2][K][I] = IFF*UFI[c2];
                        }
                    }
                }
            }

            function FICTCELLS(A1, A2){
                // REAL,DIMENSION(NL-1,5,NFI-1),INTENT(OUT)::A1,A2
                var U; // [1:10,1:NFI-1] of float
                var L; // int

                U = MatMult.createArray(10, NFI-1);
                MatMult.fillArray(U, 0);

                for (L=0; L < NL-1; L++){
                    // U(1:5,1:NFI-1)=G(1:5,HI(L+1),1:NFI-1);
                    for (var c1 = 0; c1 < 5; c1++)
                        for (var c2 = 0; c2 < NFI-1; c2++) U[c1][c2] = G[c1][HI[L+1]][c2+1];
                    //U(6:10,1:NFI-1)=G(1:5,LO(L),1:NFI-1);
                    for (var c3 = 5; c3 < 10; c3++)
                        for (var c4 = 0; c4 < NFI-1; c4++) U[c3][c4] = G[c3-5][LO[L]][c4+1];
                    //U(1:10,1:NFI-1)=BOUNDARYS(L,1:10,:).x.U(:,1:NFI-1);
                    U = matrix.multiply(BOUNDARYS[L], U);

                    // A2(L,1:5,1:NFI-1)=U(1:5,1:NFI-1);
                    for (var c5 = 0; c5 < 5; c5++){
                        for (var c6 = 0; c6 < NFI-1; c6++){
                            A2[L][c5][c6+1] = U[c5][c6];
                        }
                    }
                    // A1(L,:,1:NFI-1)=U(6:10,1:NFI-1);
                    for (var c7 = 5; c7 < 10; c7++){
                        for (var c8 = 0; c8 < NFI-1; c8++){
                            A1[L][c7-5][c8+1] = U[c7][c8];
                        }
                    }
                }

            }

            function CALCBOUNDARIES(A,B){
                // INTEGER,DIMENSION(NL),INTENT(OUT)::A,B
                var L,BS,BE,I;

                for (L = 0; L < NL; L++){
                    BS = 1;
                    for (I = NL-1; I >= L+1; I--) {
                        BS = BS + LK[I];
                    }
                    BE = BS + LK[L] - 1;
                    A[L] = BS;
                    B[L] = BE;
                }
            }

            function ZET(T){
                // ZET=-RTET(T)*EXP(IM*(T-ALFA))/R;
                return (new Complex(-FUNC2.RTET(T), 0)).multiply(new Complex(Math.cos(T-ALFA), Math.sin(T-ALFA))).divide(new Complex(R, 0));
            }
        }
        //exports.COUNTPROC = COUNTPROC;
        BBLcount.COUNTPROC = COUNTPROC;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBLcount;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBLcount;
            });
        }
        // included directly via <script> tag
        else {
            root.BBLcount = BBLcount;
        }

    }(Buffer));
    //})(typeof exports === 'undefined'? this['BBLcount']={} : exports);

});
