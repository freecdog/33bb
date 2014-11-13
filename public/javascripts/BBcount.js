/**
 * Created by jaric on 11.11.2014.
 */

(function(exports){

    var FUNC2 = require('./Func2.js');
    var MatMult = require('./MatMult.js');
    var BBstart = require('./BBstart.js');
    var Datatone = require('./Datatone.js').Datatone;
    var data;

    var numbers = require('numbers');
    var Complex = numbers.complex;
    var matrix = numbers.matrix;

    // helpful methods
    function compareWithEps(num1, num2, eps){
        eps = eps || 1e-6;
        return (Math.abs(num1 - num2) < eps);
    }

    // TODO how to send variables through modules
    // Do them public ofc.
    /*var NXDST = data.NXDST,
        NTP = data.NTP,
        NFI = data.NFI,
        NBX = 310,
        INDEX = 0,
        T0 = 1.1,
        L = 2.2030534365839607,
        ALFA = 0,
        TM = 5,
        DT = 0.02,
        STEP = 0.1,
        DFI = 0.05235987755982988;
    var DF = [];
    DF.push(0);
    for (var DFi = 1; DFi < 123; DFi++) { DF.push(DFI); }
    DF[122] = 0;*/

    function COUNTPROC(){
        var data = new Datatone();
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
            FG = data.FG;

        var I, J, K, N, NX, SN, IK, IS, IA, ICOUNT = 1; // integer
        var FIM, KSI, KSIN, P, PP, PSI, COM, T, FIC, X, T1, TETA, TOUT, LOM, CF, SF, MC, IMC, IMC0, MC0; // float
        var WT; // boolean
        var D1Z, DZ0, DZC, Z, SIG, MSIG, IMV0, MV0, IMV, MV; // Complex
        var MSIG0, SIG0; // [2] of Complex
        var LX, LAX, E; // [5, 5] of float
        var GA; // [5, -1:1] of float
        var W, U, UFI; // [5] of float
        var G, AUX, QP; // [,,] of float

        var genSize = 5;
        Z = new Complex(0, 0);
        GA = MatMult.createArray(genSize , 2);
        //delete GA[0];
        for (var c0 in GA) {
            for (var c01 = -1; c01 <= -1; c01++) GA[c0][c01] = 0;
        }

        IMV = new Complex(0, 0);
        IMC = 0;

        QP = MatMult.createArray(genSize +1, NXDST+5 +1, NTP+5 +1);    // QP(5,0:NXDST+5,1:NTP+5)
        QP.splice(0, 1);

        // ALLOCATE (G(5,0:NBX,0:NFI),AUX(5,0:NBX,-1:1));
        AUX = MatMult.createArray(genSize +1, NBX +1, 2); //new Array(5 +1);
        delete AUX[0];
        for (var c1 in AUX){
            for (var c2 in AUX[c1]){
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
        //        // TODO js can't count correctly length of [-1:1], it shows length = 2, except of 3
        //        for (var c3 = -1; c3 <= 1; c3++) {
        //            AUX[c1][c2][c3] = 0;
        //        }
        //    }
        //}

        G = MatMult.createArray(genSize +1, NBX +1, NFI +1);
        delete G[0];
        //G.splice(0, 1);
        //for (var c4 = 1; c4 <= 5; c4++)
        //    for (var c5 = 0; c5 < NBX +1; c5++)
        //        for (var c6 = 0; c6 < NFI +1; c6++)
        //            G[c4][c5][c6] = 0;
        for (var c4 in G){
            for (var c5 in G[c4]){
                // TODO don't know why for..in doesn't work in this case
                //for (var c6 in G[c4][c5]){
                var c6len = G[c4][c5].length;
                for (var c6 = 0; c6 < c6len; c6++){
                    G[c4][c5][c6] = 0;
                }
            }
        }

        var cntPath = 'BBdat/_Cnt.dat'; // looks like path depends on app.js for server side
        var fd = fs.openSync(cntPath, 'w');
        var recBuffer;

        if (INDEX > 0 && INDEX < 3) {
            recBuffer = new Buffer('T, ' + 'FX, ' + 'FY, ' + 'MOM\n');
            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
        } else if (INDEX > 3) {
            recBuffer = new Buffer('T, ' + 'WX, ' + 'WY, ' + 'VX, ' + 'VY, ' + 'X, ' + 'Y, ' + 'EPS\n');
            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
        } else {
            console.log("Unknown value of INDEX", INDEX);
        }

        E = MatMult.createArray(5, 5);
        MatMult.fillArray(E, 0);

        for (I = 0; I < E.length; I++) E[I][I] = 1;
        T = -T0;
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

        while (true){
            N++;
            if (T > TM) break;
            if (Math.abs(T) < DT / 2) T = 0;
            console.log(" T = ", T);
            if (ICOUNT % 7 == 0) console.log("\n");
            ICOUNT++;
            T1 = T + DT;
            WT = (T > TOUT - DT/4);
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
                        W = [];
                        for (var c7 = 1; c7 <= 5; c7++) {W[c7] = G[c7][0][I]; }
                        D1Z = ZET(TETA + DFI/2).subtract(ZET(TETA - DFI/2));
                        SIG = new Complex(W[5], -W[3]);
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
                    // TODO indexes ??? or for..in loop has solved all problems
                    for (var c8 in AUX){
                        for (var c9 in AUX[c1]){
                            AUX[c8][c9][IK] = 0;
                        }
                    }
                    for (var c10 in G) GA[c10 -1][-1] = G[c10][0][I];
                    for (var c11 in G) GA[c11 -1][0] = G[c11][1][I];
                    for (J = 1; J <= NX; J++){
                        X = X + DX;
                        for (var c12 in G) GA[c12 -1][1] = G[c12][J+1][I];
                        P = 1 / ((1 + COM * (X - DX/2)) * LOM);
                        PP = COM / (1 + COM * (X - DX/2));
                        LAX = matrix.addition(
                            matrix.addition(
                                matrix.scalarSafe(FIX, DT / DX), matrix.scalarSafe(FIY, DT * P / DFI)
                            ),
                            matrix.scalarSafe(Q, DT * PP)
                        );
                        LX = matrix.subtract(E, matrix.scalarSafe(LAX, 1 - DELTA));
                        W = matrix.multiply(LX, matrix.getColUnSafe(GA, 0));
                        U = matrix.multiply(FIXP, matrix.getColUnSafe(GA, -1));

                        W = matrix.addition(W, matrix.scalarSafe(U, DT / DX));
                        U = matrix.multiply(FIXM, matrix.getColUnSafe(GA, 1));
                        W = matrix.addition(W, matrix.scalarSafe(U, DT / DX));

                        var recG = new Array(genSize);
                        for (var c13 in G) recG[c13-1] = G[c13][J][I-1];
                        U = matrix.multiply(FIYP, recG);

                        W = matrix.addition(W, matrix.scalarSafe(U, DT * P / DFI));

                        for (var c14 in G) recG[c14-1] = G[c14][J][I+1];
                        U = matrix.multiply(FIYM, recG);

                        W = matrix.addition(W, matrix.scalarSafe(U, DT * P / DFI));

                        LX = matrix.addition(E, matrix.scalarSafe(LAX, DELTA));
                        LX = matrix.inverse(LX);
                        W = matrix.multiply(LX, W);
                        for (var c15 in AUX) AUX[c15][J][IK] = W[c15-1];
                        for (var c16 in GA) {
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
                                                IM.multiply(Z.multiply(ZC)).multiply(IMC)
                                            )
                                        )
                                )
                        );
                        U[0] = Uexpr.re;
                        U[1] = Uexpr.im;
                    }
                    U = matrix.multiply(FU, U);
                    var recAUX = new Array(genSize);
                    for (var c17 in AUX) recAUX[c17-1] = AUX[c17][1][IK];
                    W = matrix.multiply(FG, recAUX);
                    var recWpU = matrix.addition(W, U);
                    for (var c18 in AUX) AUX[c18][0][IK] = recWpU[c18 -1];
                    if ((I > 1) && (I < NFI-1)) {
                        for (var c19 in G){
                            for (var c20 in G[c19]){
                                G[c19][c20][I-SN] = AUX[c19][c20][IS];
                            }
                        }
                    }

                }

                // 100, goto order to this place
                IA = -(IK + IS);
                IK = IS;
                IS = IA;
                if ((NFI == 2 * I) || (2 * I - 1)) break;
            }

            // TODO unfinished code; from "IF (T<0) GOTO 200;"
            //if (T < 0) goto200();
            if (T >= 0) {

            }

        }

        fs.closeSync(fd);


        // TODO do nothing
        function COUNTOUT(T){
            console.log("COUNTOUT do nothing!!!!");
        }

        function INITLOAD(T){
            console.log("INITLOAD do nothing!!!!");
        }
    }
    exports.COUNTPROC = COUNTPROC;

    function ZET(T){
        // ZET=-RTET(T)*EXP(IM*(T-ALFA))/L;
        return (new Complex(-FUNC2.RTET(T), 0)).multiply(new Complex(Math.cos(T-ALFA), Math.sin(T-ALFA))).divide(new Complex(L, 0));
    }


})(typeof exports === 'undefined'? this['BBcount']={} : exports);
