/**
 * Created by jaric on 30.05.2017.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {
        //(function(exports) {
        var BBLHstatic = {};

        // global on the server, window in the browser
        var root, previous_BBLHstatic;

        root = this;
        if (root != null) {
            previous_BBLHstatic = root.BBLHstatic;
        }

        var async = require('async');
        var numbers = require('numbers');
        var matrix = numbers.matrix;

        var BBLH;

        var data;

        function CalcStatic(callback) {
            var calcStaticProfiler = new Date();
            console.log("BBLHstatic.CalcStatic() has start work");

            callback = callback || function(){};

            BBLH = require('../BBLH');
            var Datatone = BBLH.Datatone;
            var FUNC2 = BBLH.FUNC2;
            var RTET = FUNC2.RTET;
            var MatMult = BBLH.MatMult;

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
                TETA_ARRAY = data.TETA_ARRAY,
                COURB = data.COURB,
                LONG = data.LONG,
                FI_ARRAY = data.FI_ARRAY,
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

                HDAY = data.HDAY,
                STATICTM = data.STATICTM,
                HEFFECT = data.HEFFECT,
                LEF = data.LEF;

            var I, J, K, N, KJ, NX, ICOUNT = 1, GABS,GABE, II, IK, L, M; // integer
            var FIM, KSI, KSIN, P, PP, COM, T, X, LM, TETA, TOUT, LOM, CF, SF, IB, JX, SXX, XEF; // float
            var WT; // boolean
            var DZ0, Z; // Complex
            var LX, LAX, E; // [5, 5] of float
            var W, U, UFI, UEF, QG; // [5] of float
            var G, GOUT, GSTATIC; // [,,] of float
            var GA; // [5, -1:1] of float
            var GAF1, GAF2; // [,,] of float
            var LO, HI; // [] of integer

            var ARS = ['V_01.dat','V_02.dat','S011.dat','S022.dat','S012.dat'];
            var genSize = ARS.length;

            //ALLOCATE(G(5, 0:NBX+10,0:NFI),GSTATIC(5, 0:NBX+10,0:NFI));
            G = MatMult.createArray(genSize, NBX+10 +1, NFI+1);
            data.G = G;
            GSTATIC = MatMult.createArray(genSize, NBX+10 +1, NFI+1);

            //ALLOCATE(GAF1(1:NL-1,5,0:NFI),GAF2(1:NL-1,5,0:NFI));
            GAF1 = MatMult.createArray(NL-1, genSize, NFI+1);
            MatMult.fillArray(GAF1, 0);
            data.GAF1 = GAF1;
            GAF2 = MatMult.createArray(NL-1, genSize, NFI+1);
            MatMult.fillArray(GAF2, 0);
            data.GAF2 = GAF2;

            //ALLOCATE(LO(NL),HI(NL) ); ! LO,HI- НИЖНИЕ И ВЕРХНИЕ ГРАНИЦЫ СЛОЁВ СООТВЕТСТВЕННО
            LO = MatMult.createArray(NL);
            HI = MatMult.createArray(NL);
            data.HI = HI;
            data.LO = LO;

            QG = MatMult.createArray(5);

            E = MatMult.createArray(5,5);
            MatMult.fillArray(E, 0);
            for (I = 0; I < 5; I++) E[I][I] = 1;

            UFI = MatMult.createArray(5);
            UEF = MatMult.createArray(5);

            T = 0;
            MatMult.fillArray(G, 0);
            for (I = 0; I < 5; I++) QG[I] = 0;

            // moved to START
            //HEFFECT = 2 + 3 * HTOTAL;
            //var H0 = 0.5 * (HDAY -1 + HTOTAL); // -1 is a typical size
            //if (HEFFECT > H0) HEFFECT = H0;
            //data.HEFFECT = HEFFECT;
            //LK[0]= Math.round((HEFFECT-HTOTAL)/DX);
            //LEF = Math.round(HEFFECT/DX);

            // moved to INITLOAD()
            // UFI[0] = 0;
            // UFI[1] = 0;
            // CNU = (1-2*LNU[0])/(1-LNU[0]);

            INITLOAD();

            // TODO ask Harry use here, but shouldn't I?
            // LK(1)= KSTEP*NSTEP(1);
            CALCBOUNDARIES(LO, HI);

            async.whilst(
                function(){
                    var calcNext = (T <= STATICTM + 1e-6);

                    if (data.breakCalculation === true){
                        data.breakCalculation = false;

                        calcNext = false;
                    }

                    return calcNext;
                },
                function(callback){

                    // calculations

                    var timeAtStart = Date.now();

                    console.log("T = " + T.toFixed(2));

                    MatMult.fillArray(G[0], 0);
                    MatMult.fillArray(G[1], 0);

                    FICTCELLS(GAF1, GAF2, G);

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
                        function meUndefined(x){return x === undefined;}
                        for (var i20 = 0; i20 <= NFI; i20++)
                            for (var i21 = 1; i21 <= LK[L]; i21++)
                                for (var i22 = 0, i22len = GA[0].length; i22 < i22len; i22++) {
                                    //console.log(L, GABS, i20, i21, i22);
                                    //console.log(meUndefined(GA[L]), meUndefined(G[i22]));
                                    if (i20 == 0 && i21 == 38 && i22 == 0) {
                                        var xz = 0;
                                        xz++;
                                    }
                                    GA[L][i22][i21][i20] = G[i22][GABS + i21 - 1][i20];
                                }

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

                    // G(1:2,0,0:NFI) =0;
                    for (var i27 = 0; i27 < 2; i27++)
                        for (var i28 = 0; i28 <= NFI; i28++)
                            G[i27][0][i28] = 0;

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

                    // GA(NL,1:2,0,0:NFI)=0;
                    for (var i29 = 0; i29 < 2; i29++)
                        for (var i30 = 0; i30 <= NFI; i30++)
                            GA[NL-1][i29][0][i30] = 0;

                    // GA(1,:,LK(1)+1,0:NFI)=G(:,LEF+1,0:NFI);
                    for (var i6 = 0; i6 < GA[0].length; i6++)
                        for (var i7 = 0; i7 <= NFI; i7++)
                            //GA[0][i6][LK[0]+1][i7] = G[i6][LEF+1][i7];
                            GA[0][i6][LK[0]+1][i7] = G[i6][ G[i6].length-1 ][i7];

                    X = 0;

                    for (L = NL-1; L >= 0; L--) {
                        LM = C[L] / C0;

                        GABS = LO[L];
                        GABE = HI[L];

                        if (T > 0){
                            I = NFI;
                            K = 1;

                            while(true){
                                I = NFI - I + K;
                                K = 1 - K;
                                TETA = TETA_ARRAY[I];
                                COM = COURB[I] * R;
                                LOM = LONG[I] / R;
                                //FIM = FI_ARRAY[I];
                                FIM = FUNC2.ATN(TETA);

                                QG.length = 0;
                                QG[0] = ( R*9.81 / (C[L]*C[L]) ) * Math.cos(FIM);
                                QG[1] = - ( R*9.81 / (C[L]*C[L]) ) * Math.sin(FIM);
                                QG[2] = 0;
                                QG[3] = 0;
                                QG[4] = 0;
                                QG = matrix.vectorTranspose(QG);
                                data.QG = QG;

                                var constMatrix1 = matrix.scalarSafe(FIX[L], DT * LM / DX);
                                var constMatrix2 = matrix.scalarSafe(FIY[L], DT * LM  / DFI);
                                var constMatrix3 = matrix.scalarSafe(Q[L], DT * LM);

                                JX = X;
                                for (J = 1; J <= LK[L]; J++){
                                    KJ = GABS - 1 + J;
                                    JX = JX + DX;
                                    P = 1 / ((1 + COM * (JX - DX/2)) * LOM);
                                    PP = COM / (1 + COM * (JX - DX/2));
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
                                    var ga1 = matrix.getColUnSafe3x(GA[L], J-1, I);
                                    ga1 = matrix.vectorTranspose(ga1);
                                    U = matrix.multiply(FIXP[L], ga1);
                                    // W=W+DT*LM/DX*U;
                                    W = matrix.addition(W, matrix.scalarSafe(U, DT * LM / DX));

                                    // U=FIXM(L,:,:).x.GA(L,:,J+1,I)
                                    var ga2 = matrix.getColUnSafe3x(GA[L], J+1, I);
                                    ga2 = matrix.vectorTranspose(ga2);
                                    U = matrix.multiply(FIXM[L], ga2);
                                    // W=W+DT*LM/DX*U;
                                    W = matrix.addition(W, matrix.scalarSafe(U, DT * LM / DX));

                                    // U=FIYP(L,:,:).x.GA(L,:,J,I-1)
                                    var ga3 = matrix.getColUnSafe3x(GA[L], J, I-1);
                                    ga3 = matrix.vectorTranspose(ga3);
                                    U = matrix.multiply(FIYP[L], ga3);
                                    // W=W+DT*LM*P/DFI*U;
                                    W = matrix.addition(W, matrix.scalarSafe(U, DT * LM * P / DFI));

                                    // U=FIYM(L,:,:).x.GA(L,:,J,I+1)
                                    var ga4 = matrix.getColUnSafe3x(GA[L], J, I+1);
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

                                }   // end for J
                                if ((NFI == 2*I) || (NFI == 2*I-1)) break;
                            }   // end while true (I)
                            X = JX;

                            //for (var i8 = 0; i8 < G.length; i8++) {
                            //    for (var i9 = GABS; i9 <= GABE; i9++) {
                            //        // G(:,GABS:GABE,0)= 	G(:,GABS:GABE,NFI-1);
                            //        G[i8][i9][0] = G[i8][i9][NFI - 1];
                            //        // G(:,GABS:GABE,NFI)= G(:,GABS:GABE,1);
                            //        G[i8][i9][NFI] = G[i8][i9][1];
                            //    }
                            //}
                        }   // if T > 0
                    }   // end for L

                    // moved to begin of this part
                    // G(1:2,:,:)=0;
                    // MatMult.fillArray(G[0], 0);
                    // MatMult.fillArray(G[1], 0);

                    T += DT;
                    data.currentT = T;

                    GA.length = 0;

                    //callback();
                    // It should be a joke, but setTimeout works faster or for the same time! How come?
                    // but setTimeout at least has interruptions so DOM can be rendered
                    // TODO 2017.11 setTimeout in chrome capped to 1000ms when inactive (https://codereview.chromium.org/6577021/patch/1/2)
                    // can't interrupt callback(), should find something else or start using workers
                    setTimeout(callback, 1);
                },
                function(err){
                    if (err) console.error(err, "BBLHstatic !!!!!!!!!!!");

                    GSTATIC = matrix.deepCopy(G);
                    data.GSTATIC = GSTATIC;
                    console.log("GSTATIC", GSTATIC, data.GSTATIC);
                    console.log("CalcStatic has end work", (new Date()) - calcStaticProfiler, "ms to complete CalcStatic");

                    callback();
                }
            );  // end of async.whilst

            function INITLOAD(){
                var I, K;
                var B = LB[0];
                var CNU;

                UFI[0] = 0;
                UFI[1] = 0;

                CNU = (1-2*LNU[0])/(1-LNU[0]);

                for (I = 0; I <= NFI; I++){
                    TETA = TETA_ARRAY[I];
                    FIM = FUNC2.ATN(TETA);
                    CF = Math.cos(FIM);
                    SF = Math.sin(FIM);

                    for (K = NBX+10; K >= 0; K--) {
                        X=K*DX;

                        //if (K >= LEF){

                        KSI = HDAY - (RTET(TETA) / R) * Math.cos(TETA) - X*CF;
                        if (KSI > 0)
                            SXX= -9.81 * R * KSI / (C[0]*C[0]);
                        else
                            SXX = 0;
                        UFI[2] = SXX * (1 - CNU*SF*SF);
                        UFI[3] = SXX * (1 - CNU*CF*CF);
                        UFI[4] = -SXX * CNU*CF*SF;

                        //    if (K == LEF){
                        //        //UEF = UFI;
                        //        for (var j = 0; j < UFI.length; j++) UEF[j] = UFI[j];
                        //        XEF = X;
                        //    }
                        //} else {
                        //    //UFI=UEF*X/XEF;
                        //    var vector = matrix.scalarSafe(UEF, X/XEF);
                        //    for (var m = 0; m < UFI.length; m++) UFI[m] = vector[m];
                        //}

                        //G(:,IK,II)=UFI;
                        for (var gi = 0; gi < genSize; gi++) G[gi][K][I] = UFI[gi];
                    }   // end of K
                }   // end of I
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

        }
        BBLHstatic.CalcStatic = CalcStatic;

        function FICTCELLS(A1, A2, G){
            BBLH = require('../BBLH');
            var Datatone = BBLH.Datatone;
            var MatMult = BBLH.MatMult;

            data = new Datatone();
            var NL = data.NL,
                LO = data.LO,
                HI = data.HI,
                BOUNDARYS = data.BOUNDARYS,
                NFI = data.NFI;

            // REAL,DIMENSION(NL-1,5,NFI-1),INTENT(OUT)::A1,A2
            var U; // [1:10,0:NFI] of float
            var L; // int

            U = MatMult.createArray(10, NFI+1);
            MatMult.fillArray(U, 0);

            for (L=0; L < NL-1; L++){
                // U(1:5,0:NFI)=G(1:5,HI(L+1),0:NFI);
                for (var c1 = 0; c1 < 5; c1++)
                    for (var c2 = 0; c2 <= NFI; c2++) U[c1][c2] = G[c1][HI[L+1]][c2];
                //U(6:10,0:NFI)=G(1:5,LO(L),0:NFI);
                for (var c3 = 5; c3 < 10; c3++)
                    for (var c4 = 0; c4 <= NFI; c4++) U[c3][c4] = G[c3-5][LO[L]][c4];
                //U(1:10,0:NFI)=BOUNDARYS(L,1:10,:).x.U(:,0:NFI);
                U = matrix.multiply(BOUNDARYS[L], U);
                //U = alternativeMultiply(BOUNDARYS[L], U);

                // A2(L,1:5,0:NFI)=U(1:5,0:NFI);
                for (var c5 = 0; c5 < 5; c5++){
                    for (var c6 = 0; c6 <= NFI; c6++){
                        A2[L][c5][c6] = U[c5][c6];
                    }
                }
                // A1(L,:,0:NFI)=U(6:10,0:NFI);
                for (var c7 = 5; c7 < 10; c7++){
                    for (var c8 = 0; c8 <= NFI; c8++){
                        A1[L][c7-5][c8] = U[c7][c8];
                    }
                }
            }

        }
        BBLHstatic.FICTCELLS = FICTCELLS;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBLHstatic;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBLHstatic;
            });
        }
        // included directly via <script> tag
        else {
            root.BBLHstatic = BBLHstatic;
        }

    }());

});