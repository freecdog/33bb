/**
 * Created by jaric on 11.11.2014.
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

        var BBcount = {};
        console.log("BBcount is starting");

        // global on the server, window in the browser
        var root, previous_BBcount;

        root = this;
        if (root != null) {
            previous_BBcount = root.BBcount;
        }

        var async = require('async');
        var numbers = require('numbers');
        var fs = require('fs');

        var BB;

        var data;

        var Complex = numbers.complex;
        var matrix = numbers.matrix;

        // TODO probably my methods should be here, but not in numbers.matrix code, also I should test values, so now it stays commented
        //matrix.scalarSafe = function(arr, value){ }

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

            BB = require('../BB');
            var FUNC2 = BB.FUNC2;
            var MatMult = BB.MatMult;
            var BBstart = BB.BBstart;
            var Datatone = BB.Datatone;

            data = new Datatone();
            var NXDST = data.NXDST,
                NTP = data.NTP,
                NFI = data.NFI,
                NBX = data.NBX,
                INDEX = data.INDEX,
                T0 = data.T0,
                L = data.L,
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
                ZC = data.ZC,
                DX = data.DX,
                FIX = data.FIX,
                FIY = data.FIY,
                Q = data.Q,
                DELTA = data.DELTA,
                FIXP = data.FIXP,
                FIXM = data.FIXM,
                FIYP = data.FIYP,
                FIYM = data.FIYM,
                KP = data.KP,
                RISQ = data.RISQ,
                IM = data.IM,
                FU = data.FU,
                FG = data.FG,
                TET0 = data.TET0,
                ITP = data.ITP,
                B = data.B,
                XDESTR = data.XDESTR,
                LC = data.LC,
                STEPX = data.STEPX,
                NTIME = data.NTIME,
                KPFI = data.KPFI,
                KPA = data.KPA,
                ALIM = data.ALIM,
                C2 = data.C2,
                fds1 = data.fds1,
                fds2 = data.fds2,
                RC2 = data.RC2,
                RO2 = data.RO2,
                needRealValues = data.needRealValues;

            // jOutputBlock, init
            var outBuf = MatMult.createArray(10, Math.max(NTP+1, NXDST) +1, 1);
            for (var oi in outBuf){
                if (!outBuf.hasOwnProperty(oi)) continue;

                for (var oj in outBuf[oi]){
                    if (!outBuf[oi].hasOwnProperty(oj)) continue;

                    outBuf[oi][oj] = [];
                }
            }

            var I, J, K, N, NX, SN, IK, IS, IA; // integer
            var FIM, KSI, KSIN, P, PP, PSI, COM, T, FIC, X, T1, TETA, TOUT, LOM, CF, SF, MC, IMC, IMC0, MC0; // float
            var WT; // boolean
            var D1Z, DZ0, DZC, Z, SIG, MSIG, IMV0, MV0, IMV, MV; // Complex
            var MSIG0, SIG0; // [2] of Complex
            var LX, LAX, E; // [5, 5] of float
            var GA; // [5, -1:1] of float
            var W, U, UFI; // [5] of float
            var G, AUX, QP, ACC, QAC; // [,,] of float

            W = new Array(5);
            UFI = new Array(5); MatMult.fillArray(UFI, 0);

            var genSize = 5;
            Z = new Complex(0, 0);
            GA = MatMult.createArray(genSize , 2);
            //delete GA[0];
            for (var c0 in GA) {
                if (!GA.hasOwnProperty(c0)) continue;

                for (var c01 = -1; c01 <= 1; c01++) GA[c0][c01] = 0;
            }

            IMV = new Complex(0, 0);
            IMC = 0;

            QP = MatMult.createArray(genSize +1, NXDST+5 +1, NTP+5 +1);    // QP(5,0:NXDST+5,1:NTP+5) !!! 1:NTP+5
            delete QP[0];
            //MatMult.fillArray(QP, 0);
            //delete QP[0];
            //for (var c02 in QP) {
            //    for (var c03 in QP[c02]){
            //        delete QP[c02][c03][0];
            //    }
            //}
            //QP.splice(0, 1);
            QAC = MatMult.createArray(2 +1, NXDST+5 +1, NTP+5 +1);    // QAC(2,0:NXDST+5,1:NTP+5)) !!! 1:NTP+5
            delete QAC[0];

            // ALLOCATE (G(5,0:NBX,0:NFI),AUX(5,0:NBX,-1:1));
            AUX = MatMult.createArray(genSize +1, NBX +1, 2); //new Array(5 +1);
            delete AUX[0];
            for (var c1 in AUX){
                if (!AUX.hasOwnProperty(c1)) continue;

                for (var c2 in AUX[c1]){
                    if (!AUX[c1].hasOwnProperty(c2)) continue;

                    // special case where for..in can't recognize [-1, 1] array, so sad =/
                    //for (var c3 in AUX[c1][c2]){
                    for (var c3 = -1; c3 <=1; c3++){
                        AUX[c1][c2][c3] = 0;
                    }
                }
            }
            //AUX.splice(0, 1);
            //for (var c1 = 0; c1 < AUX.length; c1++) {
            //    AUX[c1] = new Array(NBX +1);
            //    for (var c2 = 0; c2 < NBX +1; c2++) {
            //        AUX[c1][c2] = [];
            //        // TODO js can't count correctly length of [-1:1], it shows length = 2, while was expected 3
            //        for (var c3 = -1; c3 <= 1; c3++) {
            //            AUX[c1][c2][c3] = 0;
            //        }
            //    }
            //}

            // ACC(2,0:NBX,0:NFI))
            ACC = MatMult.createArray(2 +1, NBX +1, NFI +1);
            delete ACC[0];
            for (var c45 in ACC){
                if (!ACC.hasOwnProperty(c45)) continue;

                for (var c46 in ACC[c45]){
                    if (!ACC[c45].hasOwnProperty(c46)) continue;

                    for (var c47 in ACC[c45][c46]){
                        if (!ACC[c45][c46].hasOwnProperty(c47)) continue;

                        ACC[c45][c46][c47] = 0;
                    }
                }
            }
            data.ACC = ACC;

            G = MatMult.createArray(genSize +1, NBX +1, NFI +1);
            delete G[0];
            //G.splice(0, 1);
            //for (var c4 = 1; c4 <= 5; c4++)
            //    for (var c5 = 0; c5 < NBX +1; c5++)
            //        for (var c6 = 0; c6 < NFI +1; c6++)
            //            G[c4][c5][c6] = 0;
            for (var c4 in G){
                if (!G.hasOwnProperty(c4)) continue;

                for (var c5 in G[c4]){
                    if (!G[c4].hasOwnProperty(c5)) continue;

                    // TODO don't know why for..in doesn't work in this case
                    //for (var c6 in G[c4][c5]){
                    var c6len = G[c4][c5].length;
                    for (var c6 = 0; c6 < c6len; c6++){
                        G[c4][c5][c6] = 0;
                    }
                }
            }
            data.G = G;

            var cntPath = 'BBdat/_Cnt.dat'; // looks like path depends on app.js for server side
            //noinspection JSUnresolvedFunction
            //var fd = fs.openSync(cntPath, 'w');
            var fd;
            fd = fs.openSync(cntPath, 'w');
            var recBuffer;

            if (INDEX > 0 && INDEX < 3) {
                recBuffer = new Buffer('T, ' + 'FX, ' + 'FY, ' + 'MOM\n');
                //noinspection JSUnresolvedFunction
                fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
            } else if (INDEX > 3) {
                recBuffer = new Buffer('T, ' + 'WX, ' + 'WY, ' + 'VX, ' + 'VY, ' + 'X, ' + 'Y, ' + 'EPS\n');
                //noinspection JSUnresolvedFunction
                fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
            } else if (INDEX == 0){
                console.log("INDEX =", INDEX, ", so we have empty space");
            } else {
                console.log("Unknown value of INDEX", INDEX);
            }

            E = MatMult.createArray(5, 5);
            MatMult.fillArray(E, 0);
            for (I = 0; I < E.length; I++) E[I][I] = 1;

            T = -T0;
            data.currentT = T;
            TOUT = T;
            NX = NBX - 1; // !NINT(XDESTR/DX)+2;
            MV0 = new Complex(0.0,0.0);
            IMV0 = new Complex(0.0,0.0);
            DZC = new Complex(0.0,0.0);
            DZ0 = ZET(TET0);
            MC0=0;
            IMC0=0;
            FIC=0;
            N=0;

            var jStepsCnt = 0;

            ////while (true){

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

                    N++;
                    ////if (T > TM) break;
                    if (Math.abs(T) < DT / 2){
                        T = 0;
                        data.currentT = T;
                    }
                    T1 = T + DT;
                    WT = T > (TOUT - (DT/4));
                    //console.log(" T = ", T.toFixedDef(), ";", "WT", WT, "; TOUT-DT/4", TOUT.toFixedDef(), DT, DT/4);
                    if (WT) TOUT = TOUT + STEP;
                    // НАЧАЛЬНАЯ ЗАГРУЗКА
                    if (compareWithEps(T, 0)) INITLOAD(T);
                    // РАСЧЕТ ВО ВНУТЕННИХ ТОЧКАХ
                    if (T >= 0) NX--;

                    // AUX = 0; it's done a little higher
                    MV = new Complex(0, 0);
                    MC = 0;
                    SIG0 = [new Complex(0,0), new Complex(0, 0)];
                    MSIG0 = [new Complex(0,0), new Complex(0, 0)];
                    I = NFI;
                    K = 1;
                    IK = -1;
                    IS = 0;
                    SN = -1;

                    while (true){
                        I = NFI - I + K;
                        K = 1 - K;
                        SN = -SN;
                        DFI = DF[I];
                        TETA = TAR[I];
                        COM = COURB[I] * L;
                        LOM = LONG[I] / L;
                        FIM = FAR[I];

                        //if (T < 0) goto100();
                        if (T >= 0){

                            if (INDEX >= 1){
                                for (var c7 = 1; c7 <= 5; c7++) {W[c7 -1] = G[c7][0][I]; }
                                D1Z = ZET(TETA + DFI/2).subtract(ZET(TETA - DFI/2));
                                SIG = new Complex(W[5 -1], -W[3 -1]);
                                MV = MV.add( (new Complex(0.5,0)).multiply( ( SIG.add(SIG0[K]) )).multiply(D1Z) );
                                MSIG = SIG.multiply( (Z.subtract(ZC)).conjugate() );
                                MC = MC + ( (new Complex(0.5, 0)).multiply( MSIG.add(MSIG0[K]) ).multiply(D1Z) ).im;
                                SIG0[K] = SIG;
                                MSIG0[K] = MSIG;
                            }
                            X = 0;
                            //for (var c1 = 0; c1 < AUX.length; c1++) {
                              //  AUX[c1] = new Array(NBX +1);
                                //for (var c2 = 0; c2 < NBX +1; c2++) {
                                  //  AUX[c1][c2] = [];
                            // probably SOLVED (looks like that for..in is ok), indexes ??? or for..in loop has solved all problems
                            //for (var c8 in AUX){
                            //    //if (!AUX.hasOwnProperty(c8)) continue;
                            //
                            //    for (var c9 in AUX[c8]){
                            //        //if (!AUX[c8].hasOwnProperty(c9)) continue;
                            //
                            //        AUX[c8][c9][IK] = 0;
                            //    }
                            //}
                            for (var c8 = 1; c8 <= genSize; c8++) {
                                for (var c9 = 0; c9 <= NBX; c9++) {
                                    AUX[c8][c9][IK] = 0;
                                }
                            }
                            //for (var c10 in G) {
                            //    //if (!G.hasOwnProperty(c10)) continue;
                            //
                            //    GA[c10 -1][-1] = G[c10][0][I];
                            //}
                            for (var c10 = 1; c10 <= genSize; c10++) {
                                GA[c10 -1][-1] = G[c10][0][I];
                            }
                            //for (var c11 in G) {
                            //    //if (!G.hasOwnProperty(c11)) continue;
                            //
                            //    GA[c11 -1][0] = G[c11][1][I];
                            //}
                            for (var c11 = 1; c11 <= genSize; c11++) {
                                GA[c11 -1][0] = G[c11][1][I];
                            }
                            for (J = 1; J <= NX; J++){
                                X = X + DX;
                                //for (var c12 in G) {
                                //    //if (!G.hasOwnProperty(c12)) continue;
                                //
                                //    GA[c12 -1][1] = G[c12][J+1][I];
                                //}
                                for (var c12 = 1; c12 <= genSize; c12++) {
                                    GA[c12 -1][1] = G[c12][J+1][I];
                                }
                                P = 1 / ((1 + COM * (X - DX/2)) * LOM);
                                PP = COM / (1 + COM * (X - DX/2));
                                LAX = matrix.addition(
                                    matrix.addition(
                                        matrix.scalarSafe(FIX, DT / DX), matrix.scalarSafe(FIY, DT * P / DFI)
                                    ),
                                    matrix.scalarSafe(Q, DT * PP)
                                );
                                LX = matrix.subtract(E, matrix.scalarSafe(LAX, 1 - DELTA));
                                // W=LX.x.GA(:,0);
                                var ga0 = matrix.getColUnSafe(GA, 0);
                                ga0 = matrix.vectorTranspose(ga0);
                                W = matrix.multiply(LX, ga0); //matrix.getColUnSafe(GA, 0));
                                var ga1 = matrix.getColUnSafe(GA, -1);
                                ga1 = matrix.vectorTranspose(ga1);
                                U = matrix.multiply(FIXP, ga1); //matrix.getColUnSafe(GA, -1));

                                W = matrix.addition(W, matrix.scalarSafe(U, DT / DX));
                                var ga2 = matrix.getColUnSafe(GA, 1);
                                ga2 = matrix.vectorTranspose(ga2);
                                U = matrix.multiply(FIXM, ga2); //matrix.getColUnSafe(GA, 1));
                                W = matrix.addition(W, matrix.scalarSafe(U, DT / DX));

                                var recG = new Array(genSize);
                                //for (var c13 in G) {
                                //    //if (!G.hasOwnProperty(c13)) continue;
                                //
                                //    recG[c13-1] = G[c13][J][I-1];
                                //}
                                for (var c13 = 1; c13 <= genSize; c13++) {
                                    recG[c13-1] = G[c13][J][I-1];
                                }
                                var recGtrFIYP = matrix.vectorTranspose(recG);
                                U = matrix.multiply(FIYP, recGtrFIYP); //recG);

                                W = matrix.addition(W, matrix.scalarSafe(U, DT * P / DFI));

                                //for (var c14 in G) {
                                //    //if (!G.hasOwnProperty(c14)) continue;
                                //
                                //    recG[c14-1] = G[c14][J][I+1];
                                //}
                                for (var c14 = 1; c14 <= genSize; c14++) {
                                    recG[c14-1] = G[c14][J][I+1];
                                }
                                var recGtrFIYM = matrix.vectorTranspose(recG);
                                U = matrix.multiply(FIYM, recGtrFIYM); // recG);

                                W = matrix.addition(W, matrix.scalarSafe(U, DT * P / DFI));

                                LX = matrix.addition(E, matrix.scalarSafe(LAX, DELTA));
                                LX = matrix.inverse(LX);
                                W = matrix.multiply(LX, W);
                                //for (var c15 in AUX) {
                                //    //if (!AUX.hasOwnProperty(c15)) continue;
                                //
                                //    AUX[c15][J][IK] = W[c15-1][0]; // W[c15-1];
                                //}
                                for (var c15 = 1; c15 <= genSize; c15++) {
                                    AUX[c15][J][IK] = W[c15-1][0]; // W[c15-1];
                                }
                                //for (var c16 in GA) {
                                //    //if (!GA.hasOwnProperty(c16)) continue;
                                //
                                //    GA[c16][-1] = GA[c16][0];
                                //    GA[c16][0] = GA[c16][1];
                                //}
                                for (var c16 = 0; c16 < genSize; c16++) {
                                    GA[c16][-1] = GA[c16][0];
                                    GA[c16][0] = GA[c16][1];
                                }
                            }
                            // ДООПРЕДЕЛЕНИЕ ВЕКТОРА G(:,0,I)

                            MatMult.fillArray(U, 0);
                            if (INDEX >=4) {
                                var Uexpr = (
                                        (
                                            new Complex(Math.cos(-FIM), Math.sin(-FIM))
                                        ).multiply(
                                                new Complex(KP, 0).multiply(
                                                    (
                                                        (new Complex(RISQ, 0)).multiply(IMV)
                                                    ).add(
                                                        IM.multiply(Z.subtract(ZC)).multiply( new Complex(IMC, 0) )
                                                    )
                                                )
                                        )
                                );

                                // debug mode
//                                var ue10 = Z.subtract(ZC);
//                                var ue11 = IM.multiply(ue10);
//                                var ue1 = ue11.multiply( new Complex(IMC, 0) );
//                                var ue2 = (new Complex(RISQ, 0)).multiply(IMV);
//                                var ue3 = ue2.add(ue1);
//                                var ue4 = (new Complex(KP, 0)).multiply(ue3);
//                                var ue5 = (new Complex(Math.cos(-FIM), Math.sin(-FIM))).multiply(ue4);
//                                Uexpr = ue5;

                                U[0][0] = Uexpr.re;
                                U[1][0] = Uexpr.im;
                            }
                            U = matrix.multiply(FU, U);
                            var recAUX = new Array(genSize);
                            //for (var c17 in AUX) {
                            //    //if (!AUX.hasOwnProperty(c17)) continue;
                            //
                            //    recAUX[c17-1] = AUX[c17][1][IK];
                            //}
                            for (var c17 = 1; c17 <= genSize; c17++) {
                                recAUX[c17-1] = AUX[c17][1][IK];
                            }
                            W = matrix.multiply(FG, matrix.vectorTranspose(recAUX)); // recAUX);
                            var recWpU = matrix.addition(W, U);
                            // TODO forEach with "c18 -1"... rewrite
                            //for (var c18 in AUX) {
                            //    //if (!AUX.hasOwnProperty(c18)) continue;
                            //
                            //    AUX[c18][0][IK] = recWpU[c18 -1][0];
                            //} // recWpU[c18 -1]
                            for (var c18 = 1; c18 <= genSize; c18++) {
                                AUX[c18][0][IK] = recWpU[c18 -1][0];
                            } // recWpU[c18 -1]
                            if ((I > 1) && (I < NFI-1)) {
                                // TODO ACC uses value of G array, before it will be counted, is it correct?
                                // ACC(:,:,I-SN)=(AUX(1:2,:,IS)-G(1:2,:,I-SN))/DT;
                                for (var c27 = 1; c27 <= 2; c27++){
                                    //for (var c28 in AUX[c27]){
                                    //    //if (!AUX[c27].hasOwnProperty(c28)) continue;
                                    //
                                    //    ACC[c27][c28][I-SN] = (AUX[c27][c28][IS] - G[c27][c28][I-SN]) / DT;
                                    //}
                                    for (var c28 = 0; c28 <= NBX; c28++) {
                                        ACC[c27][c28][I-SN] = (AUX[c27][c28][IS] - G[c27][c28][I-SN]) / DT;
                                    }
                                }
                                // G(:,:,I-SN)=AUX(:,:,IS);
                                //for (var c19 in G){
                                //    //if (!G.hasOwnProperty(c19)) continue;
                                //
                                //    for (var c20 in G[c19]){
                                //        //if (!G[c19].hasOwnProperty(c20)) continue;
                                //
                                //        G[c19][c20][I-SN] = AUX[c19][c20][IS];
                                //    }
                                //}
                                for (var c19 = 1; c19 <= genSize; c19++) {
                                    for (var c20 = 0; c20 <= NBX; c20++) {
                                        G[c19][c20][I-SN] = AUX[c19][c20][IS];
                                    }
                                }
                            }
                        }

                        // 100, goto order to this place
                        IA = -(IK + IS);
                        IK = IS;
                        IS = IA;
                        if ((NFI == 2 * I) || (NFI == 2 * I - 1)) break;
                    }   // end of while(true)

                    //if (T < 0) goto200();
                    if (T >= 0) {
                        // TODO ACC uses value of G array, before it will be counted, is it correct?
                        // ACC(:,:,I+SN)=(AUX(1:2,:,IS)-G(1:2,:,I+SN))/DT;
                        for (var c29 = 1; c29 <= 2; c29++){
                            //for (var c30 in AUX[c29]){
                            //    //if (!AUX[c29].hasOwnProperty(c30)) continue;
                            //
                            //    ACC[c29][c30][I+SN] = (AUX[c29][c30][IS] - G[c29][c30][I+SN]) / DT;
                            //}
                            for (var c30 = 0; c30 < NBX; c30++) {
                                ACC[c29][c30][I+SN] = (AUX[c29][c30][IS] - G[c29][c30][I+SN]) / DT;
                            }
                        }
                        // ACC(:,:,I)=(AUX(1:2,:,-(IS+IK))-G(1:2,:,I))/DT;
                        for (var c31 = 1; c31 <= 2; c31++){
                            //for (var c32 in AUX[c31]){
                            //    //if (!AUX[c31].hasOwnProperty(c32)) continue;
                            //
                            //    ACC[c31][c32][I+SN] = (AUX[c31][c32][-(IS+IK)] - G[c31][c32][I]) / DT;
                            //}
                            for (var c32 = 0; c32 <= NBX; c32++) {
                                ACC[c31][c32][I+SN] = (AUX[c31][c32][-(IS+IK)] - G[c31][c32][I]) / DT;
                            }
                        }
                        // G(:,:,I+SN)=AUX(:,:,IS);
                        //for (var c33 in G){
                        //    //if (!G.hasOwnProperty(c33)) continue;
                        //
                        //    for (var c34 in G[c33]){
                        //        //if (!G[c33].hasOwnProperty(c34)) continue;
                        //
                        //        G[c33][c34][I+SN] = AUX[c33][c34][IS];
                        //    }
                        //}
                        for (var c33 = 1; c33 <= genSize; c33++) {
                            for (var c34 = 0; c34 <= NBX; c34++) {
                                G[c33][c34][I+SN] = AUX[c33][c34][IS];
                            }
                        }
                        // G(:,:,I)=AUX(:,:,-(IS+IK));
                        //for (var c35 in G){
                        //    //if (!G.hasOwnProperty(c35)) continue;
                        //
                        //    for (var c36 in G[c35]){
                        //        //if (!G[c35].hasOwnProperty(c36)) continue;
                        //
                        //        G[c35][c36][I] = AUX[c35][c36][-(IS+IK)];
                        //    }
                        //}
                        for (var c35 = 1; c35 <= genSize; c35++) {
                            for (var c36 = 0; c36 <= NBX; c36++) {
                                G[c35][c36][I] = AUX[c35][c36][-(IS+IK)];
                            }
                        }
                        //          !ДООПРЕДЕЛЕЕНИЕ ВЕКТОРОВ G(:,J,0),G(:,J,NFI)
                        // G(:,:,NFI)=G(:,:,1);
                        //for (var c37 in G){
                        //    //if (!G.hasOwnProperty(c37)) continue;
                        //
                        //    for (var c38 in G[c37]){
                        //        //if (!G[c37].hasOwnProperty(c38)) continue;
                        //
                        //        G[c37][c38][NFI] = G[c37][c38][1];
                        //    }
                        //}
                        for (var c37 = 1; c37 <= genSize; c37++) {
                            for (var c38 = 0; c38 <= NBX; c38++) {
                                G[c37][c38][NFI] = G[c37][c38][1];
                            }
                        }
                        // G(:,:,0)=G(:,:,NFI-1);
                        //for (var c39 in G){
                        //    //if (!G.hasOwnProperty(c39)) continue;
                        //
                        //    for (var c40 in G[c39]){
                        //        //if (!G[c39].hasOwnProperty(c40)) continue;
                        //
                        //        G[c39][c40][0] = G[c39][c40][NFI-1];
                        //    }
                        //}
                        for (var c39 = 1; c39 <= genSize; c39++) {
                            for (var c40 = 0; c40 <= NBX; c40++) {
                                G[c39][c40][0] = G[c39][c40][NFI-1];
                            }
                        }
                        // ACC(:,:,NFI)=ACC(:,:,1);
                        for (var c41 = 1; c41 <= 2; c41++){
                            //for (var c42 in ACC[c41]){
                            //    //if (!ACC[c41].hasOwnProperty(c42)) continue;
                            //
                            //    ACC[c41][c42][NFI] = ACC[c41][c42][1];
                            //}
                            for (var c42 = 0; c42 <= NBX; c42++) {
                                ACC[c41][c42][NFI] = ACC[c41][c42][1];
                            }
                        }
                        // ACC(:,:,0)=ACC(:,:,1);
                        for (var c43 = 1; c43 <= 2; c43++){
                            //for (var c44 in ACC[c43]){
                            //    //if (!ACC[c43].hasOwnProperty(c44)) continue;
                            //
                            //    ACC[c43][c44][0] = ACC[c43][c44][1];
                            //}
                            for (var c44 = 0; c44 <= NBX; c44++) {
                                ACC[c43][c44][0] = ACC[c43][c44][1];
                            }
                        }

                        var recComplexMV = (new Complex(KPA, 0)).multiply(MV).multiply(ALIM);
                        // TODO if INDEX == 0 or 3, no data will be printed, is it ok?
                        if (INDEX > 0 && INDEX < 3) {
                            // probably SOLVED WRITE(4,'(5X,F10.3,3(2X,E10.3))') &
                            recBuffer = new Buffer(
                                (T).toFixedDef() + " " +
                                (recComplexMV.re).toFixedDef() + " " +
                                (recComplexMV.im).toFixedDef() + " " +
                                (KPFI * MC).toFixedDef()
                            );
                            //noinspection JSUnresolvedFunction
                            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
                        } else {
                            if (INDEX > 3) {
                                IMV = IMV0.add( (new Complex(0.5, 0)).multiply( MV.add(MV0) ).multiply( new Complex(DT, 0)) ) ;
                                MV0 = MV;
                                IMC = IMC0 + 0.5 * (MC + MC0) * DT;
                                MC0 = MC;
                                FIC = FIC + 0.5 * DT * (IMC + IMC0);
                                IMC0 = IMC;
                                DZC = DZC.add( (new Complex(0.5 * DT, 0)).multiply( IMV.add(IMV0) ) ) ;
                                IMV0 = IMV;
                                // probably SOLVED WRITE(4,'(F10.3,7(2X,E10.3))') &
                                var recComplexIMV = (new Complex(KPA, 0)).multiply(IMV).multiply(ALIM);
                                var recComplexDZC = (new Complex(KPA, 0)).multiply(DZC).multiply(ALIM);
                                recBuffer = new Buffer(
                                    (T).toFixedDef() + " " +
                                    (C2/LC * recComplexMV.re).toFixedDef() + " " +
                                    (C2/LC * recComplexMV.im).toFixedDef() + " " +
                                    (C2 * recComplexIMV.re).toFixedDef() + " " +
                                    (C2 * recComplexIMV.im).toFixedDef() + " " +
                                    (L * recComplexDZC.re).toFixedDef() + " " +
                                    (L * recComplexDZC.im).toFixedDef() + " " +
                                    (KPFI * MC / (LC*LC)).toFixedDef() + "!!!\n;;;"
                                );
                                //noinspection JSUnresolvedFunction
                                fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
                            }
                        }
                    }

                    // 200, goto order to this place
                    var timeBeforeCountOut = Date.now();
                    if (WT) COUNTOUT(T);
                    T = T1;
                    data.currentT = T;

                    jStepsCnt++;
                    if (T >= 0) console.log(jStepsCnt, ")", Date.now()-timeAtStart, "ms to count()", '; CountOut:', Date.now() - timeBeforeCountOut, 'ms');

                    //callback();
                    // It should be a joke, but setTimeout works faster or for the same time! How come?
                    // but setTimeout at least has interruptions so DOM can be rendered
                    setTimeout(callback, 1);
                },
                function(err){
                    if (err) console.log(err, "!!!!!!!!!!!");

                    //noinspection JSUnresolvedFunction
                    fs.closeSync(fd);
                    //DO I=11,20
                    //CLOSE(I)
                    //END DO
                    for (I = 0; I < fds1.length; I++) {
                        //noinspection JSUnresolvedFunction
                        fs.closeSync(fds1[I]);
                    }
                    for (I = 0; I < fds2.length; I++) {
                        //noinspection JSUnresolvedFunction
                        fs.closeSync(fds2[I]);
                    }

                    //jOutput();

                    console.log("COUNTPROC has end work", (new Date()) - countProcProfiler, "ms to complete COUNTPROC");

                    callback();
                }
            );  // end of async.whilst

            ////}

            // there were descriptor closers

            function jOutput(){
                // jOutputBlock, output
                var jOutputProfiler = new Date();
                var joNames = ['V_1.dat','V_2.dat','S11.dat','S22.dat','S12.dat', 'V01.dat','V02.dat','S011.dat','S022.dat','S012.dat'];
                var bufEL = new Buffer('\n');
                var bufELlen = bufEL.length;
                for (var ji in outBuf){
                    if (!outBuf.hasOwnProperty(ji)) continue;

                    var jpath = 'BBdat/2016.02/!' + joNames[ji];
                    //noinspection JSUnresolvedFunction
                    var jfd = fs.openSync(jpath, 'w');

                    for (var jj in outBuf[ji]){
                        if (!outBuf[ji].hasOwnProperty(jj)) continue;

                        if (outBuf[ji][jj].length > 0){
                            for (var jk in outBuf[ji][jj]){
                                if (!outBuf[ji][jj].hasOwnProperty(jk)) continue;

                                //noinspection JSUnresolvedFunction
                                fs.writeSync(jfd, outBuf[ji][jj][jk], 0, outBuf[ji][jj][jk].length, null);
                            }
                        }
                        //noinspection JSUnresolvedFunction
                        fs.writeSync(jfd, bufEL, 0, bufELlen, null);
                    }

                    //noinspection JSUnresolvedFunction
                    fs.closeSync(jfd);
                }
                console.log((new Date())-jOutputProfiler, 'ms to write all data to files');
            }

            function COUNTOUT(T){
                // TODO why in memOut no values for TM, but Harry has them. But in TM=5s last value (it is clearly seen on memOut tables in /bb)
                // TODO why in memOut[layer][time][radius][angle] in radius 0..(XDESTR/STEPX) has values, but there are extra elements (For example for TM = 1.0s 0..40 with values 41..74 w/o values).
                var countoutStart = Date.now();

                var I, M, J, K, N; //, JNT, COUNT=3; // integer
                var X, DPSI;  // float
                var rBuffer;
                // QP = 0;
                //MatMult.fillArray(QP, 0);
                for (var c1 in QP){
                    if (!QP.hasOwnProperty(c1)) continue;

                    for (var c2 in QP[c1]){
                        if (!QP[c1].hasOwnProperty(c2)) continue;

                        var QPlen = QP[c1][c2].length;
                        for (var c3 = 0; c3 < QPlen; c3++){
                            QP[c1][c2][c3] = 0;
                        }
                    }
                }
                for (var c11 in QAC){
                    if (!QAC.hasOwnProperty(c11)) continue;

                    for (var c12 in QAC[c11]){
                        if (!QAC[c11].hasOwnProperty(c12)) continue;

                        var QACLength = QAC[c11][c12].length;
                        for (var c13 = 0; c13 < QACLength; c13++){
                            QAC[c11][c12][c13] = 0;
                        }
                    }
                }

                // jmemOut memory and cpu optimization
                var memOut = data.memOut;
                var moT;
                var maxTimeSteps = Math.round(data.T0 / data.STEP) + Math.round(data.TM / data.STEP)+1;
                if (T < 0) moT = Math.round( (data.T0 - Math.abs(T)) / data.STEP);
                else moT = Math.round(data.T0 / data.STEP) + Math.round(T / data.STEP);
                console.log("countout for T =", T.toFixedDef(), "; index = ", moT);

                // JNT = COUNT; // not used
                // TETA = TET0; // not used
                I = 0;
                for (J = 1; J <= NTP + 1; J++) {
                    I = ITP[J];
                    if (T < 0) {
                        FIM = FAR[I];
                        Z = ZET(TAR[I]);
                        KSIN = (Z.subtract(DZ0)).re;
                        CF = Math.cos(FIM);
                        SF = Math.sin(FIM);
                        UFI[0] = CF;
                        UFI[1] = -SF;
                        UFI[2] = 1 - 2*B * SF*SF;
                        UFI[3] = 1 - 2*B * CF*CF;
                        UFI[4] = -2*B * CF*SF;
                        // TODO there are small mistakes in UFI e.g. for UFI[4] diff = 0.00001282782528004; my result 0.02611787782528004 vs. 2.610505E-02
                        // TODO for UFI[0] cos(1.627479), calc.exe shows result next to my results, but not Fortran. May be they use old methods for cos and sin, not that accurate
                    }
                    X = 0;
                    N = 0;

                    while (true){
                        // SOLVED what is for original -> X>1.01*XDESTR (why exactly 1.01?). It's done because to have extra bounds
                        if (X > 1.01 * XDESTR) break;
                        K = Math.round(X / DX);
                        if (T < 0){
                            KSI = KSIN - K*DX*CF;
                            PSI = BBstart.TENS(LC * (T - KSI));
                            DPSI = (BBstart.TENS(LC*(T+DT-KSI)) - BBstart.TENS(LC*(T-KSI)))/DT;
                            for (var c4 in QP){
                                if (!QP.hasOwnProperty(c4)) continue;

                                // TODO, hmm, why not UFI(:) ???? original: QP(:,N,J)=PSI*UFI
                                if (needRealValues) {
                                    QP[c4][N][J] = PSI * UFI[c4 - 1] *C2;
                                } else {
                                    QP[c4][N][J] = PSI * UFI[c4 - 1];
                                }
                            }
                            for (var c6 = 1; c6 <= 2; c6++){
                                QAC[c6][N][J] = DPSI * UFI[c6] *C2*C2/L; // QAC(:,N,J)=DPSI*UFI(1:2)*C2*C2/L;
                            }
                        } else {
                            for (var c5 in QP){
                                if (!QP.hasOwnProperty(c5)) continue;

                                if (needRealValues) {
                                    QP[c5][N][J] = G[c5][K][I] *C2;
                                } else {
                                    QP[c5][N][J] = G[c5][K][I];
                                }
                            }
                            for (var c7 = 1; c7 <= 2; c7++){
                                QAC[c7][N][J] = ACC[c7][K][I] *C2*C2/L;
                            }
                        }
                        X = X + STEPX;
                        N = N + 1;
                    }
                }

                // SOLVED what is for this string QP(3:5,:,:)=QP(3:5,:,:)    !*RO2*C2*1E-05/0.981;
                // this string uncommented when it is need to get real measurements
                // last version is QP(3:5,:,:)=QP(3:5,:,:)   !*RC2*C2*1E-05/0.981;    (RC2 not RO2)
                // very last version, letter from Harry 2016.04.19, there should be RO2
                if (needRealValues){
                    //var realValuesConst = RC2 * C2 * 1e-05 / 0.981; // as it mentioned above it is oldversion
                    var realValuesConst = RO2 * C2 * 1e-05 / 0.981;  // atmosphere values (if you want MegaPascals -> RO2 * C2 * 1e-06)
                    for (var c8 in QP){
                        if (!QP.hasOwnProperty(c8)) continue;

                        for (var c9 in QP[c8]){
                            if (!QP[c8].hasOwnProperty(c9)) continue;

                            var recQPLength = QP[c8][c9].length;
                            for (var c10 = 0; c10 < recQPLength; c10++){
                                QP[c8][c9][c10] = QP[c8][c9][c10] * realValuesConst;
                            }
                        }
                    }
                }

                //if(!window.debugBool){
                //    console.error(QP);
                //    window.debugBool = true;
                //}

                for (I = 0; I <= Math.max(NTP+1, NXDST); I++){
                    var st;
                    if (I <= NXDST) {
                        for (M = 1; M <= 2; M++){
                            st = "";
                            // WRITE(M+8,'(2X,F6.3,50(2X,E9.3))',REC=JNT) T,(QAC(M,I,J),J=1,NTP+1);
                            st += T.toFixedDef().toFixedLen(6) + "   ";
                            for (var qacj = 1; qacj <= NTP + 1; qacj++){
                                st += (QAC[M][I][qacj]).toExponential(5).toFixedLen(12); //.toFixedDef();
                                st += "   ";
                            }
                            st += "\n";
                            rBuffer = new Buffer(st);
                            //noinspection JSUnresolvedFunction
                            fs.writeSync(fds1[M-1], rBuffer, 0, rBuffer.length, null);
                        }
                        for (M = 1; M <= 5; M++){
                            // probably SOLVED WRITE(M+10,'(2X,F6.3,50(2X,E9.3))',REC=JNT) T,(QP(M,I,J),J=1,NTP+1);
                            st = "";
                            st += T.toFixedDef().toFixedLen(6) + "   ";
                            for (var qpj = 1; qpj <= NTP + 1; qpj++){
                                st += (QP[M][I][qpj]).toExponential(5).toFixedLen(12); //.toFixedDef();
                                st += "   ";

                                memOut[M - 1][moT][I][qpj - 1] = QP[M][I][qpj];
                            }
                            st += "\n";
                            rBuffer = new Buffer(st);
                            //noinspection JSUnresolvedFunction
                            fs.writeSync(fds1[M+2-1], rBuffer, 0, rBuffer.length, null);    // +2 because ACC1, ACC2 were added

                            // jOutputBlock, recording
                            //outBuf[M-1][I].push(rBuffer);
                        }
                    }
                    if (I <= NTP) {
                        for (M = 1; M <= 5; M++){
                            // probably SOLVED WRITE(M+15,'(2X,F6.3,50(2X,E9.3))',REC=JNT) T,(QP(M,N,I+1),N=0,NXDST);
                            st = "";
                            st += T.toFixedDef().toFixedLen(6) + "   ";
                            for (var qpn = 0; qpn <= NXDST; qpn++){
                                st += (QP[M][qpn][I+1]).toExponential(5).toFixedLen(12); //.toFixedDef();
                                st += "   ";

                                // no need to use another representation of QP (actually G)
                                //memOut[M-1+5][moT][I][qpn] = QP[M][qpn][I+1];
                            }
                            st += "\n";
                            rBuffer = new Buffer(st);
                            //noinspection JSUnresolvedFunction
                            fs.writeSync(fds2[M-1], rBuffer, 0, rBuffer.length, null);

                            // jOutputBlock, recording
                            //outBuf[M-1+5][I].push(rBuffer);
                        }
                    }
                    //JNT = JNT + NTIME;
                }

                //COUNT = COUNT + 1;

                //jOutput();

                //console.warn("countout tick:", (Date.now() - countoutStart) + " ms");
            }

            function INITLOAD(T){
                var I, K;
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

                    for (K = 0; K <= NBX; K++) {
                        KSI = KSIN - K*DX*CF;
                        PSI = BBstart.TENS(LC * (T - KSI));
                        if (T >= KSI) {
                            for (var c1 in G) {
                                if (!G.hasOwnProperty(c1)) continue;

                                G[c1][K][I] = PSI * UFI[c1-1];
                            }
                        }
                    }
                }
            }

            function ZET(T){
                // ZET=-RTET(T)*EXP(IM*(T-ALFA))/L;
                return (new Complex(-FUNC2.RTET(T), 0)).multiply(new Complex(Math.cos(T-ALFA), Math.sin(T-ALFA))).divide(new Complex(L, 0));
            }
        }
        //exports.COUNTPROC = COUNTPROC;
        BBcount.COUNTPROC = COUNTPROC;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBcount;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBcount;
            });
        }
        // included directly via <script> tag
        else {
            root.BBcount = BBcount;
        }

    }(Buffer));
    //})(typeof exports === 'undefined'? this['BBcount']={} : exports);

});
