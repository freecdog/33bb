/**
 * Created by jaric on 11.11.2014.
 */

(function(exports){

    var FUNC2 = require('./Func2.js');
    var MatMult = require('./MatMult.js');
    var BBstart = require('./BBstart.js');

    var numbers = require('numbers');
    var Complex = numbers.complex;
    var matrix = numbers.matrix;

    // TODO how to send variables through modules
    var NXDST = 10,
        NTP = 6,
        NFI = 121,
        NBX = 310,
        INDEX = 0,
        T0 = 1.1,
        L = 2.2030534365839607,
        ALFA = 0;

    function COUNTPROC(){
        var I, J, K, N, NX, SN, IK, IS, IA, ICOUNT = 1; // integer
        var FIM, KSI, KSIN, P, PP, PSI, COM, T, FIC, X, T1, TETA, TOUT, LOM, CF, SF, MC, IMC, IMC0, MC0; // float
        var WT; // boolean
        var D1Z, DZ0, DZC, Z, SIG, MSIG, IMV0, MV0, IMV, MV; // Complex
        var MSIG0, SIG0; // [2] of Complex
        var LX, LAX, E; // [5, 5] of float
        var GA; // [5, -1:1] of float
        var W, U, UFI; // [5] of float
        var G, AUX, QP; // [,,] of float

        QP = MatMult.createArray(5 +1, NXDST+5 +1, NTP+5 +1);    // QP(5,0:NXDST+5,1:NTP+5)
        QP.splice(0, 1);

        AUX = new Array(5);
        for (var c1 = 0; c1 < AUX.length; c1++) {
            AUX[c1] = new Array(NBX +1);
            for (var c2 = 0; c2 < NBX +1; c2++) {
                AUX[c1][c2] = [];
                // TODO js can't count correctly length of [-1:1], it shows length = 2, except of 3
                for (var c3 = -1; c3 <= 1; c3++) {
                    AUX[c1][c2][c3] = 0;
                }
            }
        }

        G = MatMult.createArray(5 +1, NBX +1, NFI +1);
        G.splice(0, 1);
        for (var c4 = 1; c4 <= 5; c4++)
            for (var c5 = 0; c5 < NBX +1; c5++)
                for (var c6 = 0; c6 < NFI +1; c6++)
                    G[c4][c5][c6] = 0;

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
        MC0=0;IMC0=0;FIC=0;
        N=0;


        // TODO unfinished code

        fs.closeSync(fd);

    }
    exports.COUNTPROC = COUNTPROC;

    function ZET(T){
        // ZET=-RTET(T)*EXP(IM*(T-ALFA))/L;
        return (new Complex(-FUNC2.RTET(T), 0)).multiply(new Complex(Math.cos(T-ALFA), Math.sin(T-ALFA))).divide(new Complex(L, 0));
    }


})(typeof exports === 'undefined'? this['BBcount']={} : exports);
