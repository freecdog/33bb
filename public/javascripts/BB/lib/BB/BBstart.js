/**
 * Created by jaric on 22.10.2014.
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

        // TODO remove SPLIT parametr totally (BBinput, BBstart), at least now we don't need to use special layer between object and environment
        // TODO move to config RTET vars (from N to NOEDGE)

        'use strict';

        var BBstart = {};
        console.log("BBstart is starting");

        // global on the server, window in the browser
        var root, previous_BBstart;

        root = this;
        if (root != null) {
            previous_BBstart = root.BBstart;
        }

        //var BB = require('../BB');
        //var FUNC2 = BB.FUNC2;
        //var MatMult = BB.MatMult;

        var numbers = require('numbers');
        var fs = require('fs');

        //var Buffer = Buffer || function (inp){
        //    return inp;
        //};

        //var FUNC2 = require('./FUNC2.js');
        //var MatMult = require('./MatMult.js');
        //var Datatone = require('./Datatone.js').Datatone;

        var BB;// = require('BB'); console.warn("start BB", BB);
        var data;

        var Complex = numbers.complex;
        var matrix = numbers.matrix;
        // var calculus = numbers.calculus;    // calculus contains adaptiveSimpson, but doesn't need now

        // TODO probably my method should be here, but not in numbers.matrix code, also I should test values, so now it stays commented
        //matrix.scalarSafe = function(arr, value){
        //    var result = new Array(arr.length);
        //
        //    if (!arr[0].length) {
        //        // This array is vector.
        //        for (var c in arr) {
        //            result[c] = arr[c] * value;
        //        }
        //    } else {
        //        for (var k = 0; k < arr.length; k++) {
        //            result[k] = new Array(arr[0].length);
        //        }
        //
        //        for (var i = 0; i < arr.length; i++) {
        //            for (var j = 0; j < arr[i].length; j++) {
        //                result[i][j] = value * arr[i][j];
        //            }
        //        }
        //    }
        //
        //    return result;
        //}

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

        var SPLIT; // boolean
        var FILL = "";  // string
        var ALFA,B,FRIC,RO2,C2,S0,A1,A2,TH,
            T0,TPLUS,STEP,STEPX,
            KAP,KAP1,DTT,ALEF,BETTA,
            S,VOL,JC,RISQ,TET0,TET1,TET2,TET3,L1,L,LC,
            DFI,FI0,DX,DT,TM,KP,KPA,KPFI,XDESTR;    // float
        var H = Math.PI / 180;
        var DF = [],TAR = [],COURB = [],FAR = [],LONG = [],TP = []; // of float
        var ITP = []; // of integer
        var Q,FIX,FIXP,FIXM,
            FIY,FIYM,FIYP,
            FU,FG,FR,FL; // [5, 5] of float
        var ZC,ALIM,IM = new Complex(0.0,1.0); // complex
        var NT,NTP,JTP,NFI,NBX,NTIME,NXDST,INDEX,EPUR,DELTA; // integer

        var rtetN, rtetN1, rtetN2, rtetA, rtetB, rtetC, rtetVortex, rtetNoEdge;

        var splitT0 = 0;

        var needRealValues;

        function STARTPROC(params, callback){
            var startProcProfiler = new Date();
            console.log("STARTPROC has start work");

            params = params || {};
            callback = callback || function(){};

            BB = require('../BB');
            var Datatone = BB.Datatone;
            var MatMult = BB.MatMult;

            data = new Datatone();

            var RC0,RC1,RC2,B1,B2, M0,C0,C1,RO0,LS,X,RZ,GAMMA,POIS,BET,OMG; // float //FI,
            var GAPOIS = false;
            var I;

            var fileData;
            var lastIndex;
            function jParse(varType, shift, symb, len, src){
                shift = shift || 1;
                symb = symb || '=';
                len = len || 10;
                src = src || fileData;

                var pnt = src.indexOf(symb, lastIndex) + shift;
                var ans;
                if (varType == 'float')
                    ans = parseFloat(src.substr(pnt, len));
                else if (varType == 'int')
                    ans = parseInt(src.substr(pnt, len));
                else if (varType == 'bool')
                    ans = charToBoolean(src.substr(pnt, len));
                else
                    ans = src.substr(pnt, len);
                //lastIndex = pnt + shift + len;
                lastIndex = pnt + ans.toString().length;

                return ans;
            }
            // TODO, create specialized module and move method into it
            function loadFromJSONFile(extendedObject, filePath){
                console.log('reading from',filePath);
                var fs = require('fs');

                try {
                    //noinspection JSUnresolvedFunction
                    fileData = fs.readFileSync(filePath, {encoding: "utf8"});
                    // some hack with first symbol =/
                    fileData = fileData.replace(/^\uFEFF/, '');
                    // parsing file to JSON object
                    var jsonData = JSON.parse(fileData);

                    if (jsonData){
                        var objectFieldsCounter = 0;
                        for (var property in jsonData) {
                            if (jsonData.hasOwnProperty(property)) {
                                objectFieldsCounter++;

                                extendedObject[property] = jsonData[property];
                            }
                        }
                        console.log("Loaded fields:", objectFieldsCounter);
                        //console.log("Current object:", extendedObject);
                    } else {
                        console.log('No json data in file');
                    }
                } catch (e) {
                    console.log("error:", e);
                }
            }

            var inputData = {};
            function loadData(source){

                if (source == 'json'){
                    loadFromJSONFile(inputData, 'public/dat/BBinput.json');
                }
                else if (source == 'dat'){
                    // helpful method for reading
                    lastIndex = 0;

                    var BBinputPath = 'BBdat/BBinput.dat'; // looks like path depends on app.js for server side
                    //noinspection JSUnresolvedFunction
                    fileData = fs.readFileSync(BBinputPath, {encoding: 'utf8'});
                    //fs.readFile(BBinputPath, {encoding: 'utf8'}, function(err, fileData){
                    //if (err) throw err;
                    console.log(fileData);
                    console.log("=============================");
                    inputData.ALFA = jParse('int');

                    inputData.SPLIT = jParse('bool', 4, '=', 1);
                    inputData.RZ = jParse('float');
                    inputData.X = jParse('float');
                    inputData.RO2 = jParse('float');
                    inputData.C2 = jParse('float');
                    inputData.GAPOIS = jParse('bool', 3, '=', 1);
                    inputData.POIS = jParse('float');
                    inputData.GAMMA = jParse('float');
                    inputData.XDESTR = jParse('float');

                    inputData.EPUR  = jParse('int');

                    jParse('float', 1, '*', 1);

                    if (inputData.SPLIT) {
                        inputData.waveShapes = [];
                        inputData.waveShapes[0].LS = jParse('float');
                        inputData.waveShapes[0].RC1 = jParse('float');
                        inputData.waveShapes[0].C1 = jParse('float');
                        inputData.waveShapes[0].C0 = jParse('float');
                        inputData.waveShapes[0].RO0 = jParse('float');
                        inputData.waveShapes[0].FILL = jParse('str', 2, '=', 5);
                    }

                    jParse('float', 1, '*', 1);

                    inputData.INDEX = jParse('int');
                    inputData.FRIC = jParse('float');
                    inputData.M0 = jParse('float');

                    jParse('float', 1, '*', 1);

                    inputData.TM = jParse('float');
                    inputData.DT = jParse('float');
                    inputData.DFI = jParse('float');

                    inputData.DX = jParse('float');
                    inputData.NTP = jParse('float');    // probably it would be redefined by length of printPoints array

                    //inputData.TP = new Array(inputData.NTP+2);
                    inputData.printPoints = [];
                    for (var itTP = 0; itTP < inputData.NTP; itTP++) {
                        if (itTP == 0)
                            inputData.printPoints.push(jParse('float'));
                            //inputData.TP[itTP + 1] = jParse('float');
                        else
                            inputData.printPoints.push(jParse('float', 1, ',', 10));
                            //inputData.TP[itTP + 1] = jParse('float', 1, ',', 10);
                    }
                    inputData.OMG = jParse('float');
                    inputData.BET = jParse('float');
                    inputData.STEP = jParse('float');
                    inputData.STEPX = jParse('float');
                    inputData.DELTA = jParse('int');

                    console.log("NO DATA FOR RTET, NO DATA FOR RTET, NO DATA FOR RTET");
                }
                else {
                    // default config
                    inputData = {
                        // TODO ALFA==15 leads to an error
                        ALFA: 0,
                        SPLIT: false,
                        RZ: 2.55E-02,   // TODO what is it?
                        // TODO with X > 12, waveepure draw nothing
                        X: 10,  // meters to explosion,  X only matters when EPUR == 1 or SPLIT == true
                        RO2: 2.7E03,    // TODO what material is it? It seems like very hardness ground Грунт 2700kg/m3, open link with Harry http://baurum.ru/_library/?cat=earthworks_general&id=686
                        C2: 5.8E03,     // TODO what is it? Poperechnaya skorost'? Why 5800?
                        GAPOIS: false,  // TODO what is it and POIS, GAMMA and B variables?
                        POIS: 0.35,
                        GAMMA: 0.6,
                        XDESTR: 4.0,

                        EPUR: 2,

                        waveShapes: [
                            {
                                LS:0.67, RC1: 2.24E06, C1: 1.3E03, C0: 4.42E03, RO0: 2.8E03, FILL: 'ГЛИНА'
                            },
                            {
                                LS: 2.0, RC1: 1.01E06, C1: 0.64E03, C0: 4.42E03, RO0: 2.8E03, FILL: 'ПЕСОК'
                            },
                            {
                                LS: 0.67, RC1: 1.01E06, C1: 0.64E03, C0: 4.42E03, RO0: 2.8E03, FILL: 'ПЕСОК'
                            },
                            {
                                LS: 2.0, RC1: 2.24E06, C1: 1.3E03, C0: 4.42E03, RO0: 2.8E03, FILL: 'ГЛИНА'
                            }
                        ],

                        INDEX: 0,
                        FRIC: 0,
                        M0: 1.5,

                        TM: 1.1,
                        DT: 0.05,
                        DFI: 5.0,
                        DX: 0.05,
                        //NTP: 7,
                        //printPoints: [ 0,15,30,45,60,75,90 ],
                        //NTP: 13,
                        //printPoints: [ 0,15,30,45,60,75,90, 105,120,135,150,165,180 ],
                        //NTP: 25,
                        //printPoints: [ 0,15,30,45,60,75,90, 105,120,135,150,165,180, 195,210,225,240,255,270, 285,300,315,330,345,360 ],
                        NTP: 73,
                        printPoints: [ 0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90, 95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180, 185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270, 275,280,285,290,295,300,305,310,315,320,325,330,335,340,345,350,355,360 ],
                        OMG: 0.98,
                        BET: 0.7,
                        STEP: 0.1,
                        STEPX: 0.1,
                        DELTA: 1,

                        rtetN: 2,
                        rtetN1: 1.3,
                        rtetN2: 1.2,
                        rtetA: 2.05,    // vertical
                        rtetB: 4.05,    // horizontal
                        rtetC: 4.5,
                        rtetVortex: 0,
                        rtetNoEdge: true,

                        needRealValues: true

                    };
                    //inputData.printPoints = [];
                    //for (var NTPi = 0; NTPi <= 360; NTPi=NTPi+3) inputData.printPoints.push(NTPi);
                    //inputData.NTP = inputData.printPoints.length;

                }

                // apply user input config
                if (params.userInput) {
                    if (params.userData !== undefined && params.userData !== null){
                        for (var param in params.userData){
                            if (!params.userData.hasOwnProperty(param)) continue;
                            inputData[param] = params.userData[param];
                        }
                    }
                }

                ALFA = inputData.ALFA;

                SPLIT = inputData.SPLIT;
                RZ = inputData.RZ;
                X = inputData.X;
                RO2 = inputData.RO2;
                C2 = inputData.C2;
                GAPOIS = inputData.GAPOIS;
                POIS = inputData.POIS;
                GAMMA = inputData.GAMMA;
                XDESTR = inputData.XDESTR;

                EPUR = inputData.EPUR;

                if (SPLIT){
                    LS = inputData.waveShapes[0].LS;
                    RC1 = inputData.waveShapes[0].RC1;
                    C1 = inputData.waveShapes[0].C1;
                    C0 = inputData.waveShapes[0].C0;
                    RO0 = inputData.waveShapes[0].RO0;
                    FILL = inputData.waveShapes[0].FILL;
                }

                INDEX = inputData.INDEX;
                FRIC = inputData.FRIC;
                M0 = inputData.M0;

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

                OMG = inputData.OMG;
                BET = inputData.BET;
                STEP = inputData.STEP;
                STEPX = inputData.STEPX;
                DELTA = inputData.DELTA;

                rtetN = inputData.rtetN;
                rtetN1 = inputData.rtetN1;
                rtetN2 = inputData.rtetN2;
                rtetA = inputData.rtetA;
                rtetB = inputData.rtetB;
                rtetC = inputData.rtetC;
                rtetVortex = inputData.rtetVortex;
                rtetNoEdge = inputData.rtetNoEdge;

                needRealValues = inputData.needRealValues;
            }
            loadData('null');    // json, dat, null (default config). I'm using 'null', because in client version there is no local file with settings
            data.inputData = inputData;

            // TODO I need simple configurator for client side.
            // At first launch, client will take configuration from server BBinput.json
            // and save it to localStorage, after will take config from localStorage.
            // Also there should be button to restore settings to default values.
            console.log((new Date()) - startProcProfiler, "ms to complete loadData");

            ALFA = ALFA * Math.PI / 180;
            ALIM = new Complex(Math.cos(ALFA), Math.sin(ALFA));

            if (GAPOIS) {
                B = GAMMA * GAMMA;
                POIS = 0.5 * (1 - 2*B) / (1 - B);
            } else {
                B = 0.5 * (1 - 2*POIS) / (1 - POIS);
                GAMMA = Math.sqrt(B);
            }

            RC2 = C2 * RO2;

            if (EPUR == 0) {
                S0 = 1;
            } else if (EPUR == 1) {
//                X = X / RZ;
//                S0 = 545 / (C2 * (Math.pow(X, 1.1)) );
                A1 = (0.325 + 0.16E-06 * RC2) * 1E-03;
                A2 = (0.47 - 0.113E-07 * RC2) * 1E-04;
                B1 = 178 + 3.49E-06 * RC2;
                B2 = -0.125 - 0.218E-07 * RC2;
                TH = RZ * (A1 + A2 * X);
                BETTA = (B1 + B2*X) / RZ;
                ALEF = BETTA / Math.tan(BETTA * TH);
                TPLUS = Math.PI / BETTA;
                // Moved here from the start of EPUR==1, so values would be more clear
                X = X / RZ;
                S0 = 545 / (C2 * (Math.pow(X, 1.1)) );
            } else if (EPUR == 2) {
                if (needRealValues){
                    // for calculation SHOULD be in MPa
//                    S0=9.6*1E06/(C2*RC2);
                    S0=0.96*1E06/(C2*RC2);  // because 100atm is too much
                } else {
                    S0 = 1;
                }
                BETTA = 900;
                A1 = 7.917;
                A2 = 48.611;
                A2 = A1 * A1 / A2;
                A1 = 1E03 / A1;

                // This 3 commented strings were from another version of BB
                //S0 = 0.19836 * 1E12 / (C2 * RC2);
                //BETTA = 875;
                //A1 = 325;
            } else {
                console.error('unknown EPUR value');
            }

            // TODO ask Harry about S0. FF(S0), TENS(FF), WAVEEPURE(TENS); INITLOAD(TENS), COUNTOUT(TENS).
            if (needRealValues){
                // TODO Shouldn't we use (1e-05/0.981 or 9.869*1e-06 [1/101325 google] )
                // for calculation SHOULD be in MPa
                console.log('S0 =', S0 *C2*RC2*1E-05/0.981);
            } else {
                console.log('S0 =', S0);
            }
            if (SPLIT) {
                RC0 = RO0 * C0;
                KAP1 = (RC1 - RC0) / (RC1 + RC0);
                KAP1 = KAP1 * KAP1;
                KAP = 1 - KAP1;
                splitT0 = RZ * (LS/C1 + (X-LS)/C2);
                DTT = 2 * LS * RZ / C1;
            }

            M0 = 1 / M0;

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

            LC = L / C2;
            if (INDEX > 0) {
                KPFI = 1 / Math.PI;
                KPA = 1 / Math.PI;
                if (INDEX > 3) {
                    KP = M0 / JC;
                    KPA = M0 * KPA;
                    KPFI = M0 / JC;
                }
            }

            DFI = DFI * Math.PI / 180;

            ITP = new Array(NTP+2);

            STEPFI();
            console.log((new Date()) - startProcProfiler, "ms passed when STEPFI finished");

            T0 = 1.1 * XDESTR;
            NT = Math.round(TM/DT);
            NXDST = Math.round(XDESTR/STEPX);
            NBX = NT + Math.round(XDESTR/DX) + 10;
            NTIME = Math.round((TM+T0)/STEP) + 3;
            STARTOUT();
            console.log((new Date()) - startProcProfiler, "ms passed when STARTOUT finished");
            if (EPUR > 0) WAVEEPURE();
            console.log((new Date()) - startProcProfiler, "ms passed when WAVEEPURE finished");
            MTRXPROC();
            console.log((new Date()) - startProcProfiler, "ms passed when MTRXPROC finished");

            data.NXDST = NXDST;
            data.NTP = NTP;
            data.NFI = NFI;
            data.NBX = NBX;
            data.INDEX = INDEX;
            data.T0 = T0;
            data.L = L;
            data.ALFA = ALFA;
            data.TM = TM;
            data.DT = DT;
            data.STEP = STEP;
            data.DFI = DFI;
            data.DF = DF;
            data.TAR = TAR;
            data.COURB = COURB;
            data.LONG = LONG;
            data.FAR = FAR;
            data.ZC = ZC;
            data.DX = DX;
            data.FIX = FIX;
            data.FIY = FIY;
            data.Q = Q;
            data.DELTA = DELTA;
            data.FIXP = FIXP;
            data.FIXM = FIXM;
            data.FIYP = FIYP;
            data.FIYM = FIYM;
            data.KP = KP;
            data.RISQ = RISQ;
            data.IM = IM;
            data.FU = FU;
            data.FG = FG;
            data.TET0 = TET0;
            data.ITP = ITP;
            data.B = B;
            data.XDESTR = XDESTR;
            data.LC = LC;
            data.STEPX = STEPX;
            data.NTIME = NTIME;
            data.KPFI = KPFI;
            data.KPA = KPA;
            data.ALIM = ALIM;
            data.C2 = C2;
            data.TP = TP;
            data.RC2 = RC2;
            data.S0 = S0;
            data.RO2 = RO2;
            data.needRealValues = needRealValues;

            // jmemOut init
            // 10 files
            // Tmax / step + 1 , time steps
            // .max(NTP+1, NXDST) max of angle and coord steps
            // [] last one should be filled by values
            data.memOut = MatMult.createArray(5, Math.round(T0/STEP) + Math.round(TM / STEP)+1,  Math.max(NTP+1, NXDST) +1, 1);   // clear memory output before new iteration
            for (var moi in data.memOut){
                if (!data.memOut.hasOwnProperty(moi)) continue;

                for (var moj in data.memOut[moi]){
                    if (!data.memOut[moi].hasOwnProperty(moj)) continue;

                    for (var mok in data.memOut[moi][moj]){
                        if (!data.memOut[moi][moj].hasOwnProperty(mok)) continue;

                        data.memOut[moi][moj][mok] = [];
                    }
                }
            }

            console.log("STARTPROC has end work", (new Date()) - startProcProfiler, "ms to complete STARTPROC");

            callback();
        }
        //exports.STARTPROC = STARTPROC;
        BBstart.STARTPROC = STARTPROC;

        // TODO do it asynchronously
        function GEOMPROC(){
            //var BB = require('../BB');
            var FUNC2 = BB.FUNC2;
            var RTET = FUNC2.RTET;

            var K; // integer
            var T,TETA,TK,H,RT, A,B,T1,T2,AK; // float
            var MOM; // Complex
            var ROOT = false;

            console.log("GEOMPROC has start work");

            var CavformPath = 'BBdat/_Cavform.dat'; // looks like path depends on app.js for server side
            // fs.open
            //noinspection JSUnresolvedFunction
            var fd = fs.openSync(CavformPath, 'w');
            // SOLVED, writing to console? WRITE(30,'(6(5X,A))')  ' TETA ', '   R   ','COS(FI)','SIN(FI) ','COS(PSI) ','SIN(PSI) '
            // write to file here
            var recBuffer = new Buffer('TETA, ' + 'R, ' + 'COS(FI), ' + 'SIN(FI), ' + 'COS(PSI), ' + 'SIN(PSI)\n');
            //noinspection JSUnresolvedFunction
            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
            S = 0;
            JC = 0;
            MOM = new Complex(0.0,0.0);
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
                // SIMPLE simpson defined in BBstart, but we can improve it.

                S = S + SIMPS(RTET, 2, 0, TETA, H).re;  // .re because S and JC is float values
                JC = JC + SIMPS(RTET, 4, 0, TETA, H).re;
                MOM = MOM.subtract( (SIMPS(RTET, 3, 1, TETA, H)).divide(new Complex(3,0)) );      // TODO interval from 1 to 0 (TETA initialized with ZERO)
                RT = RTET(TETA);

                var cfTETA = TETA*180/Math.PI;
                var cfCosATNTETA = Math.cos(FUNC2.ATN(TETA));
                var cfSinATNTETA = Math.sin(FUNC2.ATN(TETA));
                var cfCosATNTETAMinusALFA = Math.cos(FUNC2.ATN(TETA)-ALFA);
                var cfSinATNTETAMinusALFA = Math.sin(FUNC2.ATN(TETA)-ALFA);
                //WRITE(30,'(6(4X,F7.3))')  TETA*180/PI,RT,COS(ATN(TETA)),SIN(ATN(TETA)),COS(ATN(TETA)-ALFA),SIN(ATN(TETA)-ALFA);
                recBuffer = new Buffer(
                    (cfTETA).toFixedDef() + " " +
                    (RT).toFixedDef() + " " +
                    (cfCosATNTETA).toFixedDef() + " " +
                    (cfSinATNTETA).toFixedDef() + " " +
                    (cfCosATNTETAMinusALFA).toFixedDef() + " " +
                    (cfSinATNTETAMinusALFA).toFixedDef() +
                    "\n" );
                //noinspection JSUnresolvedFunction
                fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);

                cavform.push({
                    TETA: Math.round(cfTETA),
                    radius: RT,
                    cfCosATNTETA: cfCosATNTETA,
                    cfSinATNTETA: cfSinATNTETA,
                    cfCosATNTETAMinusALFA: cfCosATNTETAMinusALFA,
                    cfSinATNTETAMinusALFA: cfSinATNTETAMinusALFA
                });

                TETA = TETA + H;
            }
            // fs.close
            //noinspection JSUnresolvedFunction
            fs.closeSync(fd);
            console.log(CavformPath, "file written");

            S = S / 2;
            // L - характерный размер
            L = Math.sqrt(S / Math.PI);

            data.geomprocS = S;
            data.geomprocL = L;

            //WRITE(*,'()');
            //WRITE(*,'(2(A,F6.3))') '        S= ',S,'  L= ',L
            //WRITE(*,'()');
            console.log("S =", S, "L =", L);
            // TODO meters? XDESTR is given in non-dimensional scale, while rtetB in meters (probably meters?)
            data.TMrecommended = 2 * XDESTR + (2 * data.rtetB) / data.geomprocL;
            console.log("Recommended time for calculations is", data.TMrecommended, " plus a little extra to be sure");

            JC = 0.25 * JC / (Math.pow(L, 4));
            ZC = MOM.divide(new Complex(S, 0));
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

                AK = AK + Math.PI / 2;
                if (K == 0) TET0 = TK;
                else if (K == 1) TET1 = TK;
                else if (K == 2) TET2 = TK;
                else if (K == 3) TET3 = TK;
            }

            if (TET0 >= (2*Math.PI)) TET0 = TET0 - 2 * Math.PI;
            L1 = (RTET(TET0) * Math.cos(TET0-ALFA) - RTET(TET2) * Math.cos(TET2-ALFA)) / L;
            //ZC = ZC / L * Math.exp(-IM*ALFA);
            ZC = (ZC.divide(new Complex(L, 0))).multiply(new Complex(Math.cos(-ALFA), Math.sin(-ALFA))); // ЦЕНТР МАСС
            // TODO Is it works properly?
            JC = JC - ( Math.PI * ((ZC.multiply(ZC.conjugate())).re) ); // МОМЕНТ ИНЕРЦИИ ОТНОСИТЕЛЬНО ЦЕНТРА МАСС
            RISQ = JC / Math.PI;			 // КВАДРАТ РАДИУСА ИНЕРЦИИ

            console.log("GEOMPROC has end work");
        }

        function STEPFI(){
            //var BB = require('../BB');
            var FUNC2 = BB.FUNC2;

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
            NFI = 0;
            K1 = 0;
            while (true) {
                if (TET>TET0+2*Math.PI) break;
                K0 = K1 + 1;
                ROM = L;
                for (I=1; I <= NI; I++) {
                    var courbTet, longTet, rcurbTetAns;
                    rcurbTetAns = FUNC2.RCURB(TET,RO,LL);
                    RO = rcurbTetAns.A;
                    LL = rcurbTetAns.B;
                    RO=1/RO;
                    if (RO < ROM) ROM = RO;
                    TET = TET + H;
                }
                K = Math.round(Math.min(L/ROM, DFI/H));
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
            TAR = new Array(NFI+1 +1);
            COURB = new Array(NFI+1 +1);
            FAR = new Array(NFI+1 +1);
            LONG = new Array(NFI+1 +1);
            for (I = 0; I <= NFI+1; I++){
                DF[I] = ADF[I];
                TETA = ATAR[I];
                TAR[I] = TETA;
                var courbTeta, longTeta, rcurbTetaAns;
                rcurbTetaAns = FUNC2.RCURB(TETA, courbTeta, longTeta);
                COURB[I] = rcurbTetaAns.A;
                LONG[I] = rcurbTetaAns.B;
                FAR[I] = FUNC2.ATN(TETA) - ALFA;
            }
            // TODO there are small differs in FAR but not too big, I think. Reasons are RCURB and RTET functions
            I = 0;
            J = JTP;
            var firstStepITP = true;
            while (firstStepITP || J != JTP){
                firstStepITP = false;

                if (J == NTP+2) {
                    J = 1;
                    if (J == JTP) break;
                }
                TET = Math.PI * TP[J]/180;
                for (M = I; M <= NFI + 1; M++){
                    // TODO there is still bug (ALFA==15), TAR[90] has value 0 which is less than TET so no angle for ITP[10]
                    // Harry's solution solve this well, should take a look on it
                    if (TET <= TAR[M]){
                        I = M + 1;
                        ITP[J] = M;
                        break;
                    }
                }
                J++;
            }
            //while (true){
            //    if (J == NTP+2) {
            //        J = 1;
            //        if (J == JTP) break;
            //    }
            //    TET = Math.PI * TP[J]/180;
            //    for (M = I; M <= NFI + 1; M++){
            //        if (TET <= TAR[M]){
            //            I = M + 1;
            //            ITP[J] = M;
            //            break;
            //        }
            //    }
            //    J++;
            //    if (J == JTP) break;
            //}
            for (J = 1; J <= JTP-1; J++){
                TP[J] = TP[J] - 360;
            }
        }

        function MTRXPROC(){
            //var BB = require('../BB');
            var MatMult = BB.MatMult;

            var J;
            var M, F, LAY, LAX; // [5,5] of float
            var E; // [3,5] of float
            var LBD; // [2,5] of float
            var CG, SG;

            F = MatMult.createArray(5, 5);
            MatMult.fillArray(F, 0);

            SG = Math.sqrt(B);
            CG = 1 - 2*B;
            // It may be changed to matrix.zeros(5,5) (from numbers.js)
            Q = MatMult.createArray(5, 5);
            MatMult.fillArray(Q, 0);
            LAX = MatMult.createArray(5, 5);
            MatMult.fillArray(LAX, 0);
            LAY = MatMult.createArray(5, 5);
            MatMult.fillArray(LAY, 0);
            M = MatMult.createArray(5, 5);
            MatMult.fillArray(M, 0);
            M[0][0] = 1;
            M[1][1] = SG;
            M[3][3] = -1;
            M[4][4] = -SG;
            // TODO array numerates from 1, but not from 0 !!!!!!!!!!!!!!!!!!!!!!!
            //M[5][5] = -SG;
            LAX[0][0] = 1;  LAX[1][4] = 1;  LAX[3][0] = 1;  LAX[3][2] = 1;  LAX[4][4] = 1;
            LAX[0][2] = -1; LAX[2][3] = -1;
            LAX[4][1] = SG;
            LAX[1][1] = -SG;
            LAX[2][2] = CG;
            LAY[1][4] = -1; LAY[0][3] = -1; LAY[2][2] = -1;
            LAY[0][1] = 1;  LAY[3][1] = 1;  LAY[3][3] = 1;  LAY[4][4] = 1;
            LAY[1][0] = SG; LAY[4][0] = SG;
            LAY[2][3] = CG;
            Q[0][2] = -1;   Q[3][0] = -1;
            Q[2][0] = -CG;  Q[1][4] = -2;   Q[4][1] = B;    Q[0][3] = 1;

            //FIXP = .5 * (Math.abs(M)+M);
            // TODO ABS(M), it is just ABS for every value in matrix, isn't it?
            FIXP = matrix.scalarSafe(( matrix.addition(matrix.abs(M), M) ), 0.5);
            //FIYP=FIXP;
            // TODO Is it copy of values from FIXP to FIYP, but not links exchange?
            FIYP = matrix.deepCopy(FIXP);
            FIXM = matrix.scalarSafe(( matrix.addition( matrix.abs(M), matrix.negative(M) ) ), 0.5);
            FIYM = matrix.deepCopy(FIXM);
            FIXP = matrix.multiply(FIXP, LAX);
            FIXM = matrix.multiply(FIXM, LAX);
            FIYP = matrix.multiply(FIYP, LAY);
            FIYM = matrix.multiply(FIYM, LAY);
            // TODO Is it correct interpritation? Inverse matrix?
            //LAX=.Inv.LAX;
            LAX = matrix.inverse(LAX);
            LAY = matrix.inverse(LAY);
            FIXP = matrix.multiply(LAX, FIXP);
            FIXM = matrix.multiply(LAX, FIXM);
            FIYP = matrix.multiply(LAY, FIYP);
            FIYM = matrix.multiply(LAY, FIYM);
            FIX = matrix.addition(FIXP, FIXM);
            FIY = matrix.addition(FIYP, FIYM);

            LBD = MatMult.createArray(2, 5);
            MatMult.fillArray(LBD, 0);
            MatMult.fillArray(M, 0);
            E = MatMult.createArray(3, 5);
            MatMult.fillArray(E, 0);

            if (INDEX == 0) {
                LBD[0][2] = 1;
                LBD[1][4] = 1;
            } else if (INDEX == 1 || INDEX == 4) {
                LBD[0][0] = 1;
                LBD[1][1] = 1;
            } else if (INDEX == 2 || INDEX == 3 || INDEX == 5) {
                LBD[0][0] = 1;
                LBD[1][2] = -FRIC;
                LBD[1][4] = 1;
            } else {
                console.log("Unknown INDEX value:", INDEX);
            }

            E[0][2] = 1; E[1][3] = 1; E[2][4] = 1;
            LAX = matrix.inverse(LAX);
            E = matrix.multiply(E, LAX);

            for (J = 1 -1; J <= 2 -1; J++){
                for (var k1 = 0; k1 < LBD[J].length; k1++){
                    M[J][k1] = -LBD[J][k1];
                }
            }

            for (J = 1 -1; J <= 5 -1; J++){
                if (J < 2){
                    for (var k2 = 0; k2 < LBD[J].length; k2++) {
                        F[J][k2] = LBD[J][k2];
                    }
                } else {
                    for (var k3 = 0; k3 < E[J-2].length; k3++) {
                        F[J][k3] = E[J-2][k3];
                    }
                }
            }

            F = matrix.inverse(F);
            FU = matrix.multiply(F, M);
            MatMult.fillArray(M, 0);

            for (J = 3 -1; J <= 5 -1; J++){
                for (var k4 = 0; k4 < E[J-2].length; k4++) {
                    M[J][k4] = E[J-2][k4];
                }
            }

            FG = matrix.multiply(F, M);
        }

        // Complex
        function SIMPS(F, N, M, T, H){
            // T, H real
            // N, M integer

            //function F(T) {
                // TODO interfface F(T), how it works?
                // may be it is for changing value by special rule (function)
                // probably SOLVED, but not sure, so TO DO is still here. F is one parametrs, so function is parametr
            //}

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

        function TENS(T){
            var Q, S, TT; // float
            if (SPLIT) {
                S = 0; Q = 1; TT = T - splitT0;
                while (true){
                    if (TT <= 0) break;
                    S = S + Q * FF(TT);
                    Q = Q * KAP1;
                    TT = TT - DTT;
                }
                return KAP * S;
            } else {
                return FF(T);
            }
        }
        //exports.TENS = TENS;
        BBstart.TENS = TENS;

        function WAVEEPURE(){
            var TMAX = 50;
            var T = 0;

            var waveEpure = [];
            data.waveEpure = waveEpure;

            var EpurePath = 'BBdat/_Epure.dat'; // looks like path depends on app.js for server side
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
                        value = -C2 * C2 * RO2 * TENS(T) * 1E-05 / 0.981;
                    } else {
                        value = TENS(T);
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
                        value = C2*C2*RO2*TENS(LC*T)*1E-05/0.981;
                    } else {
                        value = TENS(LC*T);
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

        function STARTOUT(){
            var I, J, K, JNT; // integer
            var X; // float
            var ARS1 = ['ACC1.dat', 'ACC2.dat', 'V_1.dat','V_2.dat','S11.dat','S22.dat','S12.dat'];
            var ARS2 = ['V01.dat','V02.dat','S011.dat','S022.dat','S012.dat'];
            var STR = [];

            var fds1 = [];
            var fds2 = [];
            var recBuffer, recStr;
            var path;

            var iStart = 9;
            for (I = iStart; I <= 15; I++) {
                path = 'BBdat/_' + ARS1[I-iStart]; // looks like path depends on app.js for server side
                //noinspection JSUnresolvedFunction
                fds1.push( fs.openSync(path, 'w') );

                // TODO H. have clear file loop here, but I don't think it's necessary here.

                X = 0;
                for (K = 1; K <= NTP + 1; K++) {
                    STR.push(TP[K]);
                }

                // TODO STR(JTP)=STR(JTP)//'*';  what is this???

                for (J=0; J <= NXDST; J++){
                    JNT = J * NTIME + 1;
                    // TODO moved cursor of file. But general idea is put current value of X and T values in the heads.

                    recBuffer = new Buffer('X= ' + X.toFixedDef() + '\n');
                    //noinspection JSUnresolvedFunction
                    fs.writeSync(fds1[I-iStart], recBuffer, 0, recBuffer.length, null);

                    recStr = '';
                    for (var c1 = 0, lenStr = STR.length; c1 < lenStr; c1++) recStr += STR[c1] + ' ';
                    recBuffer = new Buffer('T ' + recStr + '\n');
                    //noinspection JSUnresolvedFunction
                    fs.writeSync(fds1[I-iStart], recBuffer, 0, recBuffer.length, null);

                    X = X + STEPX;
                }

                //fs.closeSync(fds1[I-iStart]);
            }

            STR = [];
            for (I = 16; I <= 20; I++){
                path = 'BBdat/_' + ARS2[I-16]; // looks like path depends on app.js for server side
                //noinspection JSUnresolvedFunction
                fds2.push( fs.openSync(path, 'w') );

                // TODO H. have clear file loop here, but I don't think it's necessary here.

                for (K = 0; K <= NXDST; K++) {
                    //STR.push(TP[K]);
                    STR.push((K * STEPX).toFixedDef());
                }

                for (J = 1; J <= NTP + 1; J++) {
                    // TODO moved coursor of file. But general idea is put current value of T and Thetta values in the heads.

                    JNT = (J-1) * NTIME + 1;

                    recBuffer = new Buffer('TETA= ' + TP[J].toFixedDef() + '\n');
                    //noinspection JSUnresolvedFunction
                    fs.writeSync(fds2[I-16], recBuffer, 0, recBuffer.length, null);

                    recStr = '';
                    for (var c2 = 0, lenStr2 = STR.length; c2 < lenStr2; c2++) recStr += STR[c2] + ' ';
                    recBuffer = new Buffer('T ' + recStr + '\n');
                    //noinspection JSUnresolvedFunction
                    fs.writeSync(fds2[I-16], recBuffer, 0, recBuffer.length, null);
                }

                //fs.closeSync(fds2[I-16]);
            }

            data.fds1 = fds1;
            data.fds2 = fds2;
        }

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBstart;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBstart;
            });
        }
        // included directly via <script> tag
        else {
            root.BBstart = BBstart;
        }

    }(Buffer));
    //})(typeof exports === 'undefined'? this['BBstart']={} : exports);

});
