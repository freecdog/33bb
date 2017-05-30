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

        function CalcStatic(callback) {
            callback = callback || function(){};

            console.warn("BBLHCalcStatic has start work, it's not finished yet");

            BBLH = require('../BBLH');
            var Datatone = BBLH.Datatone;
            var FUNC2 = BBLH.FUNC2;
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
            var W, U, UFI, QG; // [5] of float
            var G, GOUT; // [,,] of float
            var GA; // [5, -1:1] of float
            var GAF1, GAF2; // [,,] of float
            var LO, HI; // [] of integer
            var HEFFECT;

            var ARS = ['V_01.dat','V_02.dat','S011.dat','S022.dat','S012.dat'];
            var genSize = ARS.length;

            T = 0;
            G = MatMult.createArray(genSize, NBX+10 +1, NFI+1);
            data.G = G;

            QG = MatMult.createArray(5);
            data.QG = QG;

            E = MatMult.createArray(5,5);
            MatMult.fillArray(E, 0);
            for (I = 0; I < 5; I++) E[I][I] = 1;

            HEFFECT = 2 + 3 * HTOTAL;
            LK[1]= Math.round(HEFFECT/DX);
            data.HEFFECT = HEFFECT;

            ;

            callback();
        }
        BBLHstatic.CalcStatic = CalcStatic;

        function INITLOAD(){
            var I, K;
            var B = LB[0];
            for (I = 0; I <= NFI; I++){
                TETA = TAR[I];
                FIM = FAR[I];
                CF = Math.cos(FIM);
                SF = Math.sin(FIM);
                UFI[0] = CF;
                UFI[1] = -SF;
                UFI[2] = 1 - 2*B * SF*SF;
                UFI[3] = 1 - 2*B * CF*CF;
                UFI[4] = -2*B * CF*SF;

                for (K = 0; K <= NBX+10; K++) {
                    KSI = K*DX*CF - (HTOTAL + KSIN);
                    //KSI = K*DX*CF - KSIN; // Wave would be near object at T=0
                    if (KSI < 0) {
                        for (var c1 = 0; c1 < 5; c1++) G[c1][K][I] = 0;
                    } else {
                        var IFF = BBLHstart.FF(LC*KSI);
                        for (var c2 = 0; c2 < 5; c2++) G[c2][K][I] = IFF*UFI[c2];
                    }
                }
            }
        }

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