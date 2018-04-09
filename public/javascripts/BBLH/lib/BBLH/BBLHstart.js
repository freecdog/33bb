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

        // TODO remove SPLIT parametr totally (BBLHinput, BBLHstart), at least now we don't need to use special layer between object and environment
        // TODO auto testing of BBLHup (it means BBLHstart + BBLHcount)
        // TODO you can parallel all calculations by parameters (0..genSize), but there would not be any matrix calculations

        'use strict';

        var BBLHstart = {};
        console.log("BBLHstart is starting");

        // global on the server, window in the browser
        var root, previous_BBLHstart;

        root = this;
        if (root != null) {
            previous_BBLHstart = root.BBLHstart;
        }

        var numbers = require('numbers');
        var fs = require('fs');

        var BBLH;
        var data;

        var Complex = numbers.complex;
        var matrix = numbers.matrix;

        // TODO probably my methods should be here, but not in numbers.matrix code, also I should test values, so now it stays commented
        // matrix.scalarSafe = function(arr, value){ }

        // helpful methods
        function charToBoolean(char){
            return char[0].toLowerCase() == 't';  // if first letter is T than true else false
        }
        function compareWithEps(num1, num2, eps){
            eps = eps || 1e-6;
            return (Math.abs(num1 - num2) < eps);
        }

        Number.prototype.toFixedDef = function(){
            return this.toFixed(3);
        };

        var ALFA,FRIC,S0,A1,A2,TH,
            TPLUS,STEP,STEPX,
            ALEF,BETTA,
            S,TET0,TET1,TET2,TET3,L1, // R
            R=1,
            LC,
            DFI,DX,DT,TM,XDESTR, CHECK,
            RC0, C0, HTOTAL, HDAY, HEFFECT, STATICTM, CMAX, CAVERAGE;    // float
        var H = Math.PI / 180, DELTA = 1;
        var DF = [],TETA_ARRAY = [],COURB = [],FI_ARRAY = [],LONG = [],TP = []; // of float
        var ITP = []; // of integer
        var Q,FIX,FIXP,FIXM,
            FIY,FIYM,FIYP,
            FG,FR,FL, BOUNDARYS, LAUX, LG; // [Layers,5, 5] of float
        var ALIM,IM = new Complex(0.0,1.0); // complex
        var NT,NTP,JTP,NFI,NBX,NTIME,NEFFECT,NCHECK,KSTEP,INDEX,EPUR,NL, L, LEF; // integer
        var layers = [];
        var LE = [], LRO = [], LNU = [], LH = [], C = [], LB = [], LRC = []; // of float
        var LK = [],NSTEP = []; // of integer

        var rtetN, rtetN1, rtetN2, rtetA, rtetB, rtetC, rtetVortex, rtetNoEdge;

        var needRealValues, OnlyStaticLoad, OnlyDynamicLoad;

        function STARTPROC(params, callback){
            var startProcProfiler = new Date();
            console.log("STARTPROC has start work");

            params = params || {};
            callback = callback || function(){};

            BBLH = require('../BBLH');
            var Datatone = BBLH.Datatone;
            var MatMult = BBLH.MatMult;

            data = new Datatone();

            var B1,B2, X,RZ, H0; // float //FI,
            var I;

            var inputData = {};
            function loadData(source){
                if (source == 'json'){
                    console.error("this method", source, "is not available here");
                }
                else if (source == 'dat'){
                    console.error("this method", source, "is not available here");
                }
                else {
                    // default config
                    inputData = {
                        ALFA: 0,        // degree
                        RZ: 2.55E-02,   // metres, radius zaryada?
                        X: 10,          // metres, distance
                        XDESTR: 2,    // metres, TODO XDESTR should be changed to layers[0].H
                        HDAY: 50,       // metres
                        STATICTM: 30,
                        OnlyStaticLoad: false,
                        OnlyDynamicLoad: false,

                        // 0 - Heaviside function
                        // 1 - exponent
                        // 2 - sinus * gauss
                        EPUR: 2,

                        NL: 2,
                        layers: [
                            {
                                E: 5.79e10,
                                RO: 2.7e3,
                                NU: 0.35,
                                H: 2
                            },
                            {
                                E: 1.23e10,
                                RO: 2.59e3,
                                NU: 0.3,
                                H: 2.0
                            },
                            {
                                E: 5.45e10,
                                RO: 2.667e3,
                                NU: 0.26,
                                H: 1.0
                            },
                            {
                                E: 5.79e10,
                                RO: 2.7e3,
                                NU: 0.35,
                                H: 0.5
                            }
                        ],

                        // 0 - cavity
                        // 1 - НЕПОДВИЖНОЕ ВКЛЮЧЕНИЕ,ЖЕСТКОЕ СЦЕПЛЕНИЕ
                        // 2 - НЕПОДВИЖНОЕ ВКЛЮЧЕНИЕ,СКОЛЬЗЯЩИЙ КОНТАКТ БЕЗ ТРЕНИЯ
                        // 3 - НЕПОДВИЖНОЕ ВКЛЮЧЕНИЕ,СКОЛЬЗЯЩИЙ КОНТАКТ С ТРЕНИЕМ
                        INDEX: 0,
                        FRIC: 0,        // friction coefficient

                        TM: 22,          // special time (/0.0004 ~ C0 afaik)
                        DT: 0.05,       // special
                        DFI: 2.0,       // degree
                        DX: 0.05,       // special
                        //NTP: 11, // it is calculated further NTP = printPoints.length
                        //printPoints: [ 0,5,10,15,30,40,45,60,90,120,335,355 ],
                        printPoints: [ 0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,
                            95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,
                            185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,
                            275,280,285,290,295,300,305,310,315,320,325,330,335,340,345,350,355,360 ],

                        STEP: 0.1,     // special
                        STEPX: 0.1,    // special

                        rtetN: 2,
                        rtetN1: 2,
                        rtetN2: 2,
                        rtetA: 2.0,
                        rtetB: 4.0,
                        rtetC: 4.5,
                        rtetVortex: 0,
                        rtetNoEdge: true,

                        //S0: 9.6,
                        BETTA: 900,
                        A1: 7.917,
                        A2: 48.611,
                        seismicEventEnergy: 1e9,    // J
                        sizeOfSource: 50,           // m
                        jhK: 80,                    // coefficient of Harry and jaric according to Pi theorem

                        needRealValues: true
                    };
                    inputData.printPoints = [];
                    for (var NTPi = 0; NTPi <= 360; NTPi=NTPi+2) inputData.printPoints.push(NTPi);
                    inputData.NTP = inputData.printPoints.length;

                }

                // TODO refactor this part, no need to use "userInput" only "userData"
                // apply user input config
                if (params.userInput) {
                    if (params.userData !== undefined && params.userData !== null){
                        for (var param in params.userData){
                            if (!params.userData.hasOwnProperty(param)) continue;
                            inputData[param] = params.userData[param];
                        }
                    }
                }

                inputData.XDESTR = inputData.layers[0].H;

                ALFA = inputData.ALFA;
                RZ = inputData.RZ;
                X = inputData.X;
                XDESTR = inputData.XDESTR;
                HDAY = inputData.HDAY;
                STATICTM = inputData.STATICTM;
                OnlyStaticLoad = inputData.OnlyStaticLoad;
                OnlyDynamicLoad = inputData.OnlyDynamicLoad;

                EPUR = inputData.EPUR;

                NL = inputData.NL;
                layers = inputData.layers;

                INDEX = inputData.INDEX;
                FRIC = inputData.FRIC;

                TM = inputData.TM;
                DT = inputData.DT;
                DFI = inputData.DFI;
                DX = inputData.DX;
                NTP = inputData.printPoints.length;

                TP = new Array(NTP+2);
                for (var ppIt in inputData.printPoints){
                    if (!inputData.printPoints.hasOwnProperty(ppIt)) continue;

                    TP[parseInt(ppIt) +1] = inputData.printPoints[ppIt];
                }
                //console.warn("TP", TP);

                STEP = inputData.STEP;
                STEPX = inputData.STEPX;

                rtetN = inputData.rtetN;
                rtetN1 = inputData.rtetN1;
                rtetN2 = inputData.rtetN2;
                rtetA = inputData.rtetA;
                rtetB = inputData.rtetB;
                rtetC = inputData.rtetC;
                rtetVortex = inputData.rtetVortex;
                rtetNoEdge = inputData.rtetNoEdge;

                //S0 = inputData.S0;
                BETTA = inputData.BETTA;
                A1 = inputData.A1;
                A2 = inputData.A2;

                if (EPUR == 0){
                    needRealValues = false;
                } else {
                    needRealValues = inputData.needRealValues;
                }
            }
            loadData('null');    // json, dat, null (default config). I'm using 'null', because in client version there is no local file with settings
            data.inputData = inputData;

            console.log((new Date()) - startProcProfiler, "ms to complete loadData");

            ALFA = ALFA * Math.PI / 180;
            ALIM = new Complex(Math.cos(ALFA), Math.sin(ALFA));

            LE = MatMult.createArray(NL);
            LRO = MatMult.createArray(NL);
            LNU = MatMult.createArray(NL);
            LH = MatMult.createArray(NL);
            C = MatMult.createArray(NL);
            LK = MatMult.createArray(NL);
            NSTEP = MatMult.createArray(NL);
            LRC = MatMult.createArray(NL);
            LB = MatMult.createArray(NL);

            Q = MatMult.createArray(NL, 5, 5);
            FIX = MatMult.createArray(NL, 5, 5);
            FIXP = MatMult.createArray(NL, 5, 5);
            FIXM = MatMult.createArray(NL, 5, 5);

            FIY = MatMult.createArray(NL, 5, 5);
            FIYM = MatMult.createArray(NL, 5, 5);
            FIYP = MatMult.createArray(NL, 5, 5);

            FG = MatMult.createArray(NL, 5, 5);
            FR = MatMult.createArray(NL, 5, 5);
            FL = MatMult.createArray(NL, 5, 5);

            CMAX = 0;
            CAVERAGE = 0;
            for (L = 0; L < NL; L++){
                LE[L] = layers[L].E;
                LRO[L] = layers[L].RO;
                LNU[L] = layers[L].NU;
                LH[L] = layers[L].H;

                C[L] = Math.sqrt( ( LE[L]*(1-LNU[L]) ) / (LRO[L]*(1+LNU[L])*(1-2*LNU[L])) );
                if (CMAX < C[L]) CMAX = C[L];
                CAVERAGE += C[L]/NL;
                LRC[L]=C[L]*C[L]*LRO[L];
                LB[L]=.5*(1-2*LNU[L])/(1-LNU[L]);
            }

            C0 = C[0];
            RC0 = LRC[0] / C0;

            if (EPUR == 0) {
                // TODO I returned this 2018.04.08 but didn't checked it, but I think it should work
                S0 = 1.0;
                // because small values and static pressure connected badly
                //S0 = 9.6 * 1e05 / (C0 * RC0);
            } else if (EPUR == 1) {
                // TODO again Harry changed something
                X = X / RZ;
                A1 = (0.325 + 0.16E-06 * RC0) * 1E-03;
                A2 = (0.47 - 0.113E-07 * RC0) * 1E-04;
                B1 = 178 + 3.49E-06 * RC0;
                B2 = -0.125 - 0.218E-07 * RC0;
                TH = RZ * (A1 + A2 * X);
                BETTA = (B1 + B2*X) / RZ;
                ALEF = BETTA / Math.tan(BETTA * TH);
                TPLUS = Math.PI / BETTA;
                // X = X / RZ;
                S0 = 545 / (C0 * (Math.pow(X, 1.1)) );
            } else if (EPUR == 2) {
                if (needRealValues){
                    //S0 = S0 * 1E05 / (C0 * RC0);
                    //S0 = 9.6 * 1E05 / (C0 * RC0);
                    S0 = inputData.seismicEventEnergy / Math.pow(inputData.sizeOfSource, 3) * inputData.jhK;
                    S0 = S0 / (C0*RC0);
                } else {
                    S0 = 1;
                }
                A2 = A1 * A1 / A2;
                A1 = 1E03 / A1;
            } else {
                console.error('unknown EPUR value');
            }

            if (needRealValues){
                // TODO Shouldn't we use (1e-05/0.981 or 9.869*1e-06 [1/101325 google] )
                // for calculation SHOULD be in MPa
                console.log('S0 =', S0 *C0*RC0); // atm *1E-05/0.981);
            } else {
                console.log('S0 =', S0);
            }

            data.rtetN = rtetN;
            data.rtetN1 = rtetN1;
            data.rtetN2 = rtetN2;
            data.rtetA = rtetA;
            data.rtetB = rtetB;
            data.rtetC = rtetC;
            data.rtetVortex = rtetVortex;
            data.rtetNoEdge = rtetNoEdge;

            GEOMPROC();
            console.log((new Date()) - startProcProfiler, "ms to complete GEOMPROC");

            LC = R / C0;

            HDAY = HDAY / R;

            //TM = TM * 1e3 / LC;

            DFI = DFI * Math.PI / 180;

            ITP = new Array(NTP+2);

//            //Harry's new
//            for (L = 0; L < NL; L++){
//                if (LH[L]/R < DX){
//                    DX = LH(L) / R;
//                    STEPX = DX;
//                    if (DT > DX) DT = DX;
//                }
//            }

            KSTEP = Math.round(STEPX / DX);
            DX = STEPX / KSTEP;
            HTOTAL = 0;
            for (L = 1; L < NL; L++){
                NSTEP[L] = Math.round(LH[L] / (R*STEPX));
                LH[L] = NSTEP[L] * STEPX;
                LK[L] = Math.round(LH[L] / DX);
                HTOTAL += LH[L];
            }
            HEFFECT = 2 + 3*HTOTAL;
            H0 = 0.5 * (HDAY - 1 + HTOTAL);
            if (HEFFECT > H0) HEFFECT = H0;
            NEFFECT = Math.round((HEFFECT - HTOTAL) / STEPX);
            HEFFECT = STEPX * NEFFECT;

            // TODO ask Harry; NSTEP(1)=NINT((HEFFECT-HTOTAL)/STEPX);
            NSTEP[0] = Math.round(XDESTR / (R*STEPX));

            XDESTR = STEPX * NSTEP[0];
            CHECK = HTOTAL + XDESTR;
            NCHECK = Math.round(CHECK/STEPX);

            NT = Math.round(TM/DT);

            NBX = NT + Math.round(CHECK/DX)+10;
            NTIME = Math.round(TM/STEP)+3;

            LK[0] = NBX - Math.round(HTOTAL/DX);
            // TODO ask Harry, if I'm not using EFFECT. Change STATIC (270 line: // GA(1,:,LK(1)+1,0:NFI)=G(:,LEF+1,0:NFI);)
            //LEF = KSTEP * NEFFECT;
            LEF = NBX;

            MTRXPROC();
            console.log((new Date()) - startProcProfiler, "ms passed when MTRXPROC finished");
            STEPFI();
            console.log((new Date()) - startProcProfiler, "ms passed when STEPFI finished");
            BOUNDARYCONDITIONS();
            console.log((new Date()) - startProcProfiler, "ms passed when BOUNDARYCONDITIONS finished");
            //STARTOUT();
            //console.log((new Date()) - startProcProfiler, "ms passed when STARTOUT finished");
            if (EPUR > 0) WAVEEPURE();
            console.log((new Date()) - startProcProfiler, "ms passed when WAVEEPURE finished");

            data.NTP = NTP;
            data.NFI = NFI;
            data.NBX = NBX;
            data.INDEX = INDEX;
            data.R = R;
            data.ALFA = ALFA;
            data.TM = TM;
            data.DT = DT;
            data.STEP = STEP;
            data.DFI = DFI;
            data.DF = DF;
            data.TETA_ARRAY = TETA_ARRAY;
            data.COURB = COURB;
            data.LONG = LONG;
            data.FI_ARRAY = FI_ARRAY;
            data.DX = DX;
            data.FIX = FIX;
            data.FIY = FIY;
            data.Q = Q;
            data.DELTA = DELTA;
            data.FIXP = FIXP;
            data.FIXM = FIXM;
            data.FIYP = FIYP;
            data.FIYM = FIYM;
            data.FG = FG;
            data.TET0 = TET0;
            data.ITP = ITP;

            data.NL = NL;
            data.layers = layers;
            data.LE = LE;
            data.LRO = LRO;
            data.LNU = LNU;
            data.LH = LH;
            data.C = C;
            data.LB = LB;
            data.LRC = LRC;
            data.LK = LK;
            data.BOUNDARYS = BOUNDARYS;
            data.LG = LG;
            data.NSTEP = NSTEP;
            data.HTOTAL = HTOTAL;
            data.CHECK = CHECK;

            data.XDESTR = XDESTR;
            data.LC = LC;
            data.STEPX = STEPX;
            data.NTIME = NTIME;
            data.ALIM = ALIM;
            data.C0 = C0;
            data.TP = TP;
            data.RC0 = RC0;
            data.S0 = S0;
            data.needRealValues = needRealValues;

            data.HDAY = HDAY;
            data.STATICTM = STATICTM;
            data.OnlyStaticLoad = OnlyStaticLoad;
            data.OnlyDynamicLoad = OnlyDynamicLoad;
            data.CMAX = CMAX;
            data.CAVERAGE = CAVERAGE;
            data.KSTEP = KSTEP;
            data.HEFFECT = HEFFECT;
            data.LEF = LEF;

            // jmemOut init
            // 10 files
            // Tmax / step + 1 , time steps
            // .max(NTP+1, NXDST) max of angle and coord steps
            // [] last one should be filled by values
            //data.memOut = MatMult.createArray(5, Math.round(T0/STEP) + Math.round(TM / STEP)+1,  Math.max(NTP+1, NXDST) +1, 1);   // clear memory output before new iteration
            //for (var moi in data.memOut){
            //    if (!data.memOut.hasOwnProperty(moi)) continue;
            //
            //    for (var moj in data.memOut[moi]){
            //        if (!data.memOut[moi].hasOwnProperty(moj)) continue;
            //
            //        for (var mok in data.memOut[moi][moj]){
            //            if (!data.memOut[moi][moj].hasOwnProperty(mok)) continue;
            //
            //            data.memOut[moi][moj][mok] = [];
            //        }
            //    }
            //}

            console.log("STARTPROC has end work", (new Date()) - startProcProfiler, "ms to complete STARTPROC");

            callback();
        }
        BBLHstart.STARTPROC = STARTPROC;

        function GEOMPROC(){
            //var BBLH = require('../BBLH');
            var FUNC2 = BBLH.FUNC2;
            var RTET = FUNC2.RTET;

            var K; // integer
            var T,TETA,TK,H,RT, A,B,T1,T2,AK, Ref; // float
            var ROOT = false;

            console.log("GEOMPROC has start work");

            var CavformPath = 'BBLHdat/_Cavform.dat'; // looks like path depends on app.js for server side
            // fs.open
            //noinspection JSUnresolvedFunction
            var fd = fs.openSync(CavformPath, 'w');
            // SOLVED, writing to console? WRITE(30,'(6(5X,A))')  ' TETA ', '   R   ','COS(FI)','SIN(FI) ','COS(PSI) ','SIN(PSI) '
            // write to file here
            var recBuffer = new Buffer('TETA, ' + 'R, ' + 'COS(FI), ' + 'SIN(FI), ' + 'COS(PSI), ' + 'SIN(PSI)\n');
            //noinspection JSUnresolvedFunction
            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
            S = 0;
            H = Math.PI/180;
            TETA = 0;
            var cavform = [];
            data.cavform = cavform;

            while(true){
                if (TETA > 2 * Math.PI) break;
                // SOLVED, SIMPS from what part of code is it? http://en.wikipedia.org/wiki/Simpson's_rule
                // The only I have is numbers.calculus.adaptiveSimpson(), http://en.wikipedia.org/wiki/Adaptive_Simpson's_method
                // seems like that adaptiveSimpson(RTET, 0, TETA, H), what is for 2nd parameter? Is it for number of steps N?
                // adaptiveSimpson don't have number of steps. Number of steps depends on eps
                // SIMPLE simpson defined in BBLHstart, but we can improve it.

                S = S + SIMPS(RTET, 2, 0, TETA, H).re;  // .re because S and JC is float values
                RT = RTET(TETA);

                var cfTETA = TETA*180/Math.PI;
                var cfCosATNTETA = Math.cos(FUNC2.ATN(TETA));
                var cfSinATNTETA = Math.sin(FUNC2.ATN(TETA));
                //WRITE(30,'(6(4X,F7.3))')  TETA*180/PI,RT,COS(ATN(TETA)),SIN(ATN(TETA)));
                recBuffer = new Buffer(
                    (cfTETA).toFixedDef() + " " +
                    (RT).toFixedDef() + " " +
                    (cfCosATNTETA).toFixedDef() + " " +
                    (cfSinATNTETA).toFixedDef() + " " +
                    "\n" );
                //noinspection JSUnresolvedFunction
                fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);

                cavform.push({
                    TETA: Math.round(cfTETA),
                    radius: RT,
                    cfCosATNTETA: cfCosATNTETA,
                    cfSinATNTETA: cfSinATNTETA
                });

                TETA = TETA + H;
            }
            // fs.close
            //noinspection JSUnresolvedFunction
            fs.closeSync(fd);
            console.log(CavformPath, "file written");

            S = S / 2;
            // R - характерный размер (радиус)
            Ref = Math.sqrt(S / Math.PI);   // R effective
            R = Ref;

            data.geomprocS = S;
            data.geomprocR = R;

            data.geomprocRef = Ref;

            //WRITE(*,'()');
            //WRITE(*,'(2(A,F6.3))') '        S= ',S,'  L= ',L
            //WRITE(*,'()');
            console.log("S =", S, "R effective =", Ref);
            // TODO meters? XDESTR is given in non-dimensional scale, while rtetB in meters (probably meters?)
            data.TMrecommended = 2 * XDESTR + (2 * data.rtetB) / data.geomprocRef;  // TMrecommended not used
            console.log("Recommended time for calculations is", data.TMrecommended, " plus a little extra to be sure");

            H = Math.PI / 6;
            TK = 0;
            AK = ALFA;

            for (K = 0; K <= 3; K++) {
                T = TK - H;
                B=0;
                A=1;
                ROOT = false;
                while (true) {
                    if ( (A * B < 0) || ROOT) break;
                    A = B;
                    T = T + H;
                    B = FUNC2.ATN(T) - AK;
                    //ROOT = (B==0); // there was float finite issue
                    ROOT = compareWithEps(B, 0);
                }

                if (ROOT) {
                    TK = T;
                } else {
                    T1 = T - H;
                    T2 = T;
                    while (true) {
                        if ((Math.abs(T2 - T1) < 0.0001) || ROOT) break;
                        T = 0.5 * (T1 + T2);
                        B = FUNC2.ATN(T) - AK;
                        //ROOT = (B==0); // there was float finite issue
                        ROOT = compareWithEps(B, 0);
                        if ((A * B) > 0){
                            T1 = T;
                        } else {
                            T2 = T;
                        }
                    }
                    if (ROOT) {
                        TK = T;
                    } else {
                        TK = 0.5 * (T1 + T2);
                    }
                }

                if (TK < Math.PI / 180) TK = 0;

                AK = AK + Math.PI / 2;
                if (K == 0) TET0 = TK;
                else if (K == 1) TET1 = TK;
                else if (K == 2) TET2 = TK;
                else if (K == 3) TET3 = TK;
            }

            if (TET0 >= (2*Math.PI)) TET0 = TET0 - 2 * Math.PI;
            L1 = (RTET(TET0) * Math.cos(TET0-ALFA) - RTET(TET2) * Math.cos(TET2-ALFA)) / R;

            console.log("GEOMPROC has end work");
        }

        function STEPFI(){
            //var BBLH = require('../BBLH');
            var MatMult = BBLH.MatMult;
            var FUNC2 = BBLH.FUNC2;

            var I,J,M; // integer
            var TET,TETA; // real

            TET = 180 * TET0 / Math.PI;
            for (J = 1; J <= NTP; J++) {
                if (TP[J] >= TET) {
                    //if (TP[J] == TET) {
                    if ( compareWithEps(TP[J], TET) ) {
                        NTP = NTP - 1;
                    } else {
                        for (I = NTP; I >= J; I--){
                            TP[I+1] = TP[I];
                        }
                        TP[J] = TET;
                    }
                    JTP = J;
                    for (I = 1; I <= J-1; I++){
                        TP[I] = 360 + TP[I];
                    }
                    break;
                }
            }

            NFI = Math.round(2*Math.PI / DFI);
            DFI = 2*Math.PI / NFI;
            NFI = NFI + 1;

            // ALLOCATE (TETA_ARRAY(0:NFI),COURB(0:NFI),FI_ARRAY(0:NFI),LONG(0:NFI));
            TETA_ARRAY = MatMult.createArray(NFI+1);
            COURB = MatMult.createArray(NFI+1);
            FI_ARRAY = MatMult.createArray(NFI+1);
            LONG = MatMult.createArray(NFI+1);
            for (I = 0; I <= NFI; I++){
                TETA = TET0 + I * DFI;
                TETA_ARRAY[I] = TETA;
                var courbTeta, longTeta, rcurbTetaAns;
                rcurbTetaAns = FUNC2.RCURB(TETA, courbTeta, longTeta);
                COURB[I] = rcurbTetaAns.A;
                LONG[I] = rcurbTetaAns.B;
                FI_ARRAY[I] = FUNC2.ATN(TETA) - ALFA;
            }
            I = 0;
            J = JTP;
            while (true){
                if (J == NTP+2) {
                    J = 1;
                    if (J == JTP) break;
                }
                TET = TP[J] * Math.PI/180;
                for (M = I; M <= NFI; M++){
                    if (TET <= TETA_ARRAY[M]){
                        I = M + 1;
                        ITP[J] = M;
                        break;
                    }
                }
                J++;
                if (J == JTP) break;
            }
            for (J = 1; J <= JTP-1; J++){
                TP[J] = TP[J] - 360;
            }
        }

        function STEPFI_OLD(){
            //var BBLH = require('../BBLH');
            var FUNC2 = BBLH.FUNC2;

            var I,J,NI,K,K0,K1,M; // integer
            var RO,ROM,TET,LL,TETA; // real
            var ADF, ATAR; // of real
            NI = Math.round(2 * Math.PI/H) + 10;
            // TODO is it really needed [0, NI+1) array size?
            ADF = new Array(NI + 1);
            ATAR = new Array(NI + 1);
            for (var i = 0; i <= NI; i++) {
                ADF[i] = 0;
                ATAR[i] = 0;
            }
            TET = 180 * TET0 / Math.PI;
            for (J = 1; J <= NTP; J++) {
                if (TP[J] >= TET) {
                    //if (TP[J] == TET) {
                    if ( compareWithEps(TP[J], TET) ) {
                        NTP = NTP - 1;
                    } else {
                        for (I = NTP; I >= J; I--){
                            TP[I+1] = TP[I];
                        }
                        TP[J] = TET;
                    }
                    JTP = J;
                    for (I = 1; I <= J-1; I++){
                        TP[I] = 360 + TP[I];
                    }
                    break;
                }
            }
            TET = TET0;
            ATAR[0] = TET0;
            ADF[0] = 0;
            NI = Math.round(DFI / H);
            DFI = NI * H;
            NFI = 0;
            K1 = 0;
            while (true) {
                if (TET>TET0+2*Math.PI) break;
                K0 = K1 + 1;
                ROM = R;
                for (I=1; I <= NI; I++) {
                    var courbTet, longTet, rcurbTetAns;
                    rcurbTetAns = FUNC2.RCURB(TET,RO,LL);
                    RO = rcurbTetAns.A;
                    LL = rcurbTetAns.B;
                    RO=1/RO;
                    if (RO < ROM) ROM = RO;
                    TET = TET + H;
                }
                K = Math.round(Math.min(R/ROM, DFI/H));
                K1 = K0 + K - 1;
                NFI = NFI + K;
                // SOLVED, what is it?
                // ADF(K0:K1)=MAX(DFI/K,H);
                // small boost, we shouldn't count MAX for every element, should we? =)
                var recVar = Math.max(DFI / K, H);
                for (var adfi = K0; adfi <= K1; adfi++) {
                    ADF[adfi] = recVar;
                }
                for (I = K0; I <= K1; I++) {
                    ATAR[I] = ATAR[I-1] + 0.5*(ADF[I-1] +  ADF[I]);
                }
            }
            DF = new Array(NFI+1 +1);
            TETA_ARRAY = new Array(NFI+1 +1);
            COURB = new Array(NFI+1 +1);
            FI_ARRAY = new Array(NFI+1 +1);
            LONG = new Array(NFI+1 +1);
            for (I = 0; I <= NFI+1; I++){
                DF[I] = ADF[I];
                TETA = ATAR[I];
                TETA_ARRAY[I] = TETA;
                var courbTeta, longTeta, rcurbTetaAns;
                rcurbTetaAns = FUNC2.RCURB(TETA, courbTeta, longTeta);
                COURB[I] = rcurbTetaAns.A;
                LONG[I] = rcurbTetaAns.B;
                FI_ARRAY[I] = FUNC2.ATN(TETA) - ALFA;
            }
            // TODO there are small differs in FI_ARRAY but not too big, I think. Reasons are RCURB and RTET functions
            I = 0;
            J = JTP;
            var firstStepITP = true;
            while (firstStepITP || J != JTP){
                firstStepITP = false;

                if (J == NTP+2) {
                    J = 1;
                    if (J == JTP) break;
                }
                TET = TP[J] * Math.PI/180;
                for (M = I; M <= NFI + 1; M++){
                    // TODO there is still bug (ALFA==15), TAR[90] has value 0 which is less than TET so no angle for ITP[10]
                    // Harry's solution solve this well, should take a look on it
                    if (TET <= TETA_ARRAY[M]){
                        I = M + 1;
                        ITP[J] = M;
                        break;
                    }
                }
                J++;
            }
            for (J = 1; J <= JTP-1; J++){
                TP[J] = TP[J] - 360;
            }
        }

        function BOUNDARYCONDITIONS(){
            var MatMult = BBLH.MatMult;

            var L;
            var LBD;    // of real[10,10]
            var SS;     // of real[4,10]

            var A,B;    // float

            LBD = MatMult.createArray(10, 10);
            SS = MatMult.createArray(4, 10);

            BOUNDARYS = MatMult.createArray(NL, 10, 10);
            MatMult.fillArray(BOUNDARYS, 0);

            for (L = NL-2; L >= 0; L--){
                A = C[L] / C[L+1];
                B = LRC[L] / LRC[L+1];

                MatMult.fillArray(SS, 0);

                SS[0][0]=1;	SS[0][5]=-A;
                SS[1][1]=1;	SS[1][6]=-A;
                SS[2][2]=1;	SS[2][7]=-B;
                SS[3][4]=1;	SS[3][9]=-B;

                MatMult.fillArray(LBD, 0);

                //LBD(1:3,1:5)=LAUX(L+1,1:3,1:5);
                for (var c4 = 0; c4 < 3; c4++)
                    for (var c5 = 0; c5 < 5; c5++) LBD[c4][c5] = LAUX[L+1][c4][c5];

                //LBD(4:6,6:10)=LAUX(L,3:5,1:5);
                for (var c6 = 3; c6 < 6; c6++)
                    for (var c7 = 5; c7 < 10; c7++) LBD[c6][c7] = LAUX[L][c6-1][c7-5];

                //BOUNDARYS(L,1:6,:)=LBD(1:6,:);
                for (var c8 = 0; c8 < 6; c8++)
                    for (var c9 = 0; c9 < 10; c9++) BOUNDARYS[L][c8][c9] = LBD[c8][c9];

                //BOUNDARYS(L,7:10,:)=SS;
                for (var c10 = 6; c10 < 10; c10++)
                    for (var c11 = 0; c11 < 10; c11++) BOUNDARYS[L][c10][c11] = SS[c10-6][c11];

                //BOUNDARYS(L,:,:)=(.inv.BOUNDARYS(L,:,:)).x.LBD;
                var invBOUNDARYS = matrix.inverseCopy( BOUNDARYS[L] );
                BOUNDARYS[L] = matrix.multiply(invBOUNDARYS, LBD);
                //for (var c12 = 0; c12 < 10; c12++)
                //    for (var c13 = 0; c13 < 10; c13++) BOUNDARYS[L][c12][c13] = matrix.multiply(invBOUNDARYS, LBD);
            }
        }

//        function BOUNDARYCONDITIONS(){
//            var MatMult = BBLH.MatMult;
//
//            var L;
//            var LBD;    // of real[10,10]
//            var SS;     // of real[4,10]
//
//            var A,B;    // float
//
//            LBD = MatMult.createArray(10, 10);
//            SS = MatMult.createArray(5, 10);
//
//            BOUNDARYS = MatMult.createArray(NL, 10, 10);
//            MatMult.fillArray(BOUNDARYS, 0);
//
//            for (L = NL-2; L >= 0; L--){
//                A = C[L] / C[L+1];
//                B = LRC[L] / LRC[L+1];
//
//                MatMult.fillArray(SS, 0);
//
//                SS[0][0]=1;	SS[0][5]=-A;
//                SS[1][1]=1;	SS[1][6]=-A;
//                SS[2][2]=1;	SS[2][7]=-B;
//
//                SS[4][4]=1;	SS[4][9]=-B;
//                SS[3][3]=1;	SS[3][8]=-B;
//
//                MatMult.fillArray(LBD, 0);
//
//                //LBD(1:2,1:5)=LAUX(L+1,1:2,1:5);
//                for (var c4 = 0; c4 < 2; c4++)
//                    for (var c5 = 0; c5 < 5; c5++) LBD[c4][c5] = LAUX[L+1][c4][c5];
//
//                //LBD(3:5,6:10)=LAUX(L,3:5,1:5);
//                for (var c6 = 2; c6 < 5; c6++)
//                    for (var c7 = 5; c7 < 10; c7++) LBD[c6][c7] = LAUX[L][c6][c7-5];
//
//                //BOUNDARYS(L,1:5,:)=LBD(1:5,:);
//                for (var c8 = 0; c8 < 5; c8++)
//                    for (var c9 = 0; c9 < 10; c9++) BOUNDARYS[L][c8][c9] = LBD[c8][c9];
//
//                //BOUNDARYS(L,6:10,:)=SS;
//                for (var c10 = 5; c10 < 10; c10++)
//                    for (var c11 = 0; c11 < 10; c11++) BOUNDARYS[L][c10][c11] = SS[c10-5][c11];
//
//                //BOUNDARYS(L,:,:)=(.inv.BOUNDARYS(L,:,:)).x.LBD;
//                var invBOUNDARYS = matrix.inverseCopy( BOUNDARYS[L] );
//                BOUNDARYS[L] = matrix.multiply(invBOUNDARYS, LBD);
//                //for (var c12 = 0; c12 < 10; c12++)
//                //    for (var c13 = 0; c13 < 10; c13++) BOUNDARYS[L][c12][c13] = matrix.multiply(invBOUNDARYS, LBD);
//            }
//        }

        function MTRXPROC(){
            //var BBLH = require('../BBLH');
            var MatMult = BBLH.MatMult;

            var J, L;
            var M, F, LAY, LAX; // [5,5] of float
            var E; // [3,5] of float
            var LBD; // [2,5] of float
            var CG, SG;

            LAUX = MatMult.createArray(NL, 5, 5);
            LG = MatMult.createArray(NL, 5, 5);
            MatMult.fillArray(LG, 0);

            F = MatMult.createArray(5, 5);
            MatMult.fillArray(F, 0);

            MatMult.fillArray(Q, 0);
            LAX = MatMult.createArray(5, 5);
            LAY = MatMult.createArray(5, 5);
            M = MatMult.createArray(5, 5);

            LBD = MatMult.createArray(2, 5);
            E = MatMult.createArray(3, 5);

            for (L = 0; L < NL; L++) {
                LG[L][0][0] = C[L];
                LG[L][1][1] = C[L];
                LG[L][2][2] = LRC[L];
                LG[L][3][3] = LRC[L];
                LG[L][4][4] = LRC[L];

                SG = Math.sqrt(LB[L]);
                CG = 1 - 2 * LB[L];

                MatMult.fillArray(Q[L], 0);
                MatMult.fillArray(LAX, 0);
                MatMult.fillArray(LAY, 0);
                MatMult.fillArray(M, 0);
                M[0][0] = 1;
                M[1][1] = SG;
                M[3][3] = -1;
                M[4][4] = -SG;
                LAX[0][0] = 1;
                LAX[1][4] = 1;
                LAX[3][0] = 1;
                LAX[3][2] = 1;
                LAX[4][4] = 1;
                LAX[0][2] = -1;
                LAX[2][3] = 1;
                LAX[4][1] = SG;
                LAX[1][1] = -SG;
                LAX[2][2] = -CG;

                LAY[1][4] = 1;
                LAY[0][3] = -1;
                LAY[2][2] = 1;
                LAY[0][1] = 1;
                LAY[3][1] = 1;
                LAY[3][3] = 1;
                LAY[4][4] = 1;
                LAY[1][0] = -SG;
                LAY[4][0] = SG;
                LAY[2][3] = -CG;

                Q[L][0][2] = -1;
                Q[L][3][0] = -1;
                Q[L][2][0] = -CG;
                Q[L][1][4] = -2;
                Q[L][4][1] = LB[L];
                Q[L][0][3] = 1;

                // FIXP(L,:,:)=.5*(ABS(M)+M);
                FIXP[L] = matrix.scalarSafe(( matrix.addition(matrix.abs(M), M) ), 0.5);
                // FIYP(L,:,:)=FIXP(L,:,:);
                FIYP[L] = matrix.deepCopy(FIXP[L]);
                FIXM[L] = matrix.scalarSafe(( matrix.addition(matrix.abs(M), matrix.negative(M)) ), 0.5);
                // FIYM(L,:,:)=FIXM(L,:,:);
                FIYM[L] = matrix.deepCopy(FIXM[L]);
                FIXP[L] = matrix.multiply(FIXP[L], LAX);
                FIXM[L] = matrix.multiply(FIXM[L], LAX);
                FIYP[L] = matrix.multiply(FIYP[L], LAY);
                FIYM[L] = matrix.multiply(FIYM[L], LAY);
                //LAX=.Inv.LAX;
                LAX = matrix.inverse(LAX);
                LAY = matrix.inverse(LAY);
                FIXP[L] = matrix.multiply(LAX, FIXP[L]);
                FIXM[L] = matrix.multiply(LAX, FIXM[L]);
                FIYP[L] = matrix.multiply(LAY, FIYP[L]);
                FIYM[L] = matrix.multiply(LAY, FIYM[L]);
                // TODO compare results between Fortran and JS
                FIX[L] = matrix.addition(FIXP[L], FIXM[L]);
                FIY[L] = matrix.addition(FIYP[L], FIYM[L]);

                MatMult.fillArray(LBD, 0);
                MatMult.fillArray(M, 0);
                MatMult.fillArray(E, 0);

                if (INDEX == 0) {
                    LBD[0][2] = 1;
                    LBD[1][4] = 1;
                } else if (INDEX == 1) {
                    LBD[0][0] = 1;
                    LBD[1][1] = 1;
                } else if (INDEX == 2 || INDEX == 3) {
                    LBD[0][0] = 1;
                    LBD[1][2] = -FRIC;
                    LBD[1][4] = 1;
                } else {
                    console.log("Unknown INDEX value:", INDEX);
                }

                E[0][2] = 1;
                E[1][3] = 1;
                E[2][4] = 1;
                LAX = matrix.inverse(LAX);
                E = matrix.multiply(E, LAX);

                for (J = 0; J < 5; J++) {
                    if (J < 2) {
                        for (var k2 = 0; k2 < LBD[J].length; k2++) {
                            F[J][k2] = LBD[J][k2];
                        }
                    } else {
                        for (var k3 = 0; k3 < E[J - 2].length; k3++) {
                            F[J][k3] = E[J - 2][k3];
                        }
                    }
                }

                F = matrix.inverse(F);
                MatMult.fillArray(M, 0);

                for (J = 2; J < 5; J++) {
                    for (var k4 = 0; k4 < E[J - 2].length; k4++) {
                        M[J][k4] = E[J - 2][k4];
                    }
                }

                FG[L] = matrix.multiply(F, M);

                LAUX[L] = matrix.deepCopy(LAX);
            }   // for L
        }

        // Complex
        function SIMPS(F, N, M, T, H){
            function FS(value) {
                // FS=(F(T)**N)*EXP(IM*M*T);
                // probably SOLVED, probably F could return complex value so... there is huge bug place probably
                var ans = (new Complex(Math.pow(F(value), N), 0)).multiply(new Complex(Math.cos(M * T), Math.sin(M * T)));
                //console.log("last FS from value:", value, " is ", ans);
                return ans;
            }

            // SOLVED, returned value isn't complex, but it should be. Now it is.
            var p1 = new Complex(H/6, 0);
            var p2 = FS(T);
            var p3 = (new Complex(4,0)).multiply( FS(T + H/2) );
            var p4 = FS(T + H);
            var p5 = p2.add(p3).add(p4);
            var p6 = p1.multiply(p5);
            return p6;

            //return ( (new Complex(H/6, 0)).multiply( FS(T).add( (new Complex(4, 0)).multiply(FS(T + H/2))).add( FS(T + H) )  ) );
        }

        function FF(T){
            if (EPUR == 0) {
                if (T < 0) {
                    return 0;
                } else {
                    return -S0;
                }
            } else if (EPUR == 1) {
                if ((T < 0) || (T > TPLUS)){
                    return 0;
                } else {
                    return -S0 * Math.exp(-ALEF * (T-TH)) * Math.sin(BETTA * T) / Math.sin(BETTA * TH);
                }
            } else if (EPUR == 2) {
                if (T < 0) {
                    return 0;
                } else {
                    // !FF=-S0*SIN(BETTA*T)*EXP(-A2*(A1*T-1)**2);
                    // TODO I should use string below !FF=-S0*SIN(BETTA*T)*EXP(-A2*(A1*T-1)**2);
                    //return -S0 * T * T * Math.sin(BETTA*T) * Math.exp(-A1 * T); // this string is from old version (took me 2 days to find it =/ )
                    return -S0 * Math.sin(BETTA*T) * Math.exp(-A2*Math.pow(A1*T-1,2));
                }
            } else {
                console.log("Unknown value of EPUR in FF", EPUR);
                return 0;
            }
        }
        BBLHstart.FF = FF;

        function WAVEEPURE(){
            var TMAX = 50;
            var T = 0;

            var waveEpure = [];
            data.waveEpure = waveEpure;

            var EpurePath = 'BBLHdat/_Epure.dat'; // looks like path depends on app.js for server side
            //noinspection JSUnresolvedFunction
            var fd = fs.openSync(EpurePath, 'w');
            var recBuffer = new Buffer('T, ' + 'F\n');
            //noinspection JSUnresolvedFunction
            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);

            var value;
            if (EPUR == 1) {
                while (true){
                    if (T > TPLUS) break;
                    if (needRealValues){
                        value = -C0 * C0 * LRO[0] * FF(T); // atm * 1E-05 / 0.981;
                    } else {
                        value = -FF(T);
                    }
                    recBuffer = new Buffer(T.toFixedDef() + ' ' + (value).toFixedDef() + '\n');
                    //noinspection JSUnresolvedFunction
                    fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);

                    waveEpure.push({
                        T: T.toFixed(5),
                        value: value.toFixedDef()
                    });

                    T = T + TPLUS/50;
                }
            } else if (EPUR == 2) {
                while (true) {
                    if (T > TMAX) break;
                    // WRITE(50,'(5X,E10.4,3X,E11.4)') T,TENS(LC*T)    !C2*C2*RO2*TENS(LC*T)*1E-06
                    if (needRealValues){
                        value = C0*C0*LRO[0]*FF(LC*T); // atm *1E-05/0.981;
                    } else {
                        value = FF(LC*T);
                    }
                    recBuffer = new Buffer(T.toFixedDef() + ' ' + (value).toFixedDef() + '\n');
                    //noinspection JSUnresolvedFunction
                    fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);

                    waveEpure.push({
                        T: T.toFixedDef(),
                        value: value.toFixedDef()
                    });

                    T = T + TMAX/1000;
                }
            } else {
                console.log("Unknown value of EPUR:", EPUR);
            }

            //noinspection JSUnresolvedFunction
            fs.closeSync(fd);
        }

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBLHstart;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBLHstart;
            });
        }
        // included directly via <script> tag
        else {
            root.BBLHstart = BBLHstart;
        }

    }(Buffer));
    //})(typeof exports === 'undefined'? this['BBLHstart']={} : exports);

});
