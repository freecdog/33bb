/**
 * Created by jaric on 22.10.2014.
 */

(function(exports){

    var FUNC2 = require('./Func2.js');
    var MatMult = require('./MatMult.js');
    var Datatone = require('./Datatone.js').Datatone;
    var data;

    // JS dependencies
    var numbers = require('numbers');
    var Complex = numbers.complex;
    var matrix = numbers.matrix;
    // var calculus = numbers.calculus;    // calculus contains adaptiveSimpson, but doesn't need now

    var fs = require('fs');

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

    // SOLVED CONTAINS, does it mean something for js? Is it for variables namespace? No it's just place where subroutines take places

    // SOVLED, why don't you convert BBinput.dat to json???
    // reading of BBinput.dat file
    function STARTPROC(){
        data = new Datatone();

        var RC0,RC1,RC2,B1,B2, M0,C0,C1,RO0,LS,X,RZ,GAMMA,POIS,BET,OMG; // float //FI,
        var GAPOIS = new Boolean();
        var I;

        // Test
        //Singletone.prototype.asd = { f: 123};
        //Singletone.prototype.gasdg = 52351;
        //var data = new Singletone();
        //Singletone.prototype.dfijh = "-458293";
        //Singletone.prototype.igjdfoijdfg = 333;

        //var data = new Datatone();
        //Datatone.prototype.asd = { f: 123};
        //Datatone.prototype.gasdg = 52351;
        //Datatone.prototype.dfijh = "-458293";
        //Datatone.prototype.igjdfoijdfg = 333;

        //var data2 = new Datatone();
        //Datatone.prototype.g3g = { zxc: 632};
        //Datatone.prototype.gasdg = 999;
        //data2.qwe = { ewq: 97979797};
        //data.asd.f = 321;

        console.log("STARTPROC has start work");

        var BBinputPath = 'BBdat/BBinput.dat'; // looks like path depends on app.js for server side
        //noinspection JSUnresolvedFunction
        var filedata = fs.readFileSync(BBinputPath, {encoding: 'utf8'});
        //fs.readFile(BBinputPath, {encoding: 'utf8'}, function(err, filedata){
        //if (err) throw err;
        console.log(filedata);
        console.log("=============================");
            // pos is list of used positions
            //var pos = {};
        ALFA = jParse('int');
            //pos.ALFA = filedata.indexOf('=',0)+1;
            //ALFA = parseInt( filedata.substr( pos.ALFA, 10 ) );
        ALFA = ALFA * Math.PI / 180;
        // SOVLED DO DO... exp for Complex.  Euler's formula: exp(ix) = cos(x) + i * sin(x). Is it correct that ALIM is complex value?
        //ALIM = Math.exp(IM * ALFA);
        ALIM = new Complex(Math.cos(ALFA), Math.sin(ALFA));
        SPLIT = jParse('bool', 4, '=', 1);
            //pos.SPLIT = filedata.indexOf('=',pos.ALFA)+4;
            //SPLIT = charToBoolean(filedata.substr( pos.SPLIT, 1)); //Boolean(data.substr( pos.SPLIT, 1 ));
        RZ = jParse('float');
            //pos.RZ = filedata.indexOf('=',pos.SPLIT)+1;
            //RZ = parseFloat(filedata.substr( pos.RZ, 10 ));
        X = jParse('float');
            //pos.X = filedata.indexOf('=',pos.RZ)+1;
            //X = parseFloat(filedata.substr( pos.X, 10 ));
        RO2 = jParse('float');
            //pos.RO2 = filedata.indexOf('=',pos.X)+1;
            //RO2 = parseFloat(filedata.substr( pos.RO2, 10 ));
        C2 = jParse('float');
            //pos.C2 = filedata.indexOf('=',pos.RO2)+1;
            //C2 = parseFloat(filedata.substr( pos.C2, 10 ));
        GAPOIS = jParse('bool', 3, '=', 1);
            //pos.GAPOIS = filedata.indexOf('=',pos.C2)+3;
            //GAPOIS = charToBoolean(filedata.substr( pos.GAPOIS, 1));
        POIS = jParse('float');
            //pos.POIS = filedata.indexOf('=',pos.GAPOIS)+1;
            //POIS = parseFloat(filedata.substr( pos.POIS, 10 ));
        GAMMA = jParse('float');
            //pos.GAMMA = filedata.indexOf('=',pos.POIS)+1;
            //GAMMA = parseFloat(filedata.substr( pos.GAMMA, 10 ));
        XDESTR = jParse('float');
            //pos.XDESTR = filedata.indexOf('=',pos.GAMMA)+1;
            //XDESTR = parseFloat(filedata.substr( pos.XDESTR, 10 ));

        EPUR  = jParse('int');
            //pos.EPUR = filedata.indexOf('=',pos.XDESTR)+1;
            //EPUR = parseInt( filedata.substr( pos.EPUR, 10 ) );

        jParse('float', 1, '*', 1);
            //pos.checkpoint1 = filedata.indexOf('*',pos.EPUR)+1;

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
            X = X / RZ;
            S0 = 545 / (C2 * (Math.pow(X, 1.1)) );
            A1 = (0.325 + 0.16E-06 * RC2) * 1E-03;
            A2 = (0.47 - 0.113E-07 * RC2) * 1E-04;
            B1 = 178 + 3.49E-06 * RC2;
            B2 = -0.125 - 0.218E-07 * RC2;
            TH = RZ * (A1 + A2 * X);
            BETTA = (B1 + B2*X) / RZ;
            ALEF = BETTA / Math.tan(BETTA * TH);
            TPLUS = Math.PI / BETTA;
        } else if (EPUR == 2) {
            // S0=9.6*1E06/(C2*RC2);
            // BETTA=900;
            // A1=7.917;
            // A2=48.611;
            // A2=A1*A1/A2;
            // A1=1E03/A1;
            S0 = 0.19836 * 1E12 / (C2 * RC2);
            BETTA = 875;
            A1 = 325;
        } else {
            console.error('unknown EPUR value');
        }

        // write to console? There wasn't opened any file for writing, was it?
        // It's just writing to console
        console.log('\n');
        console.log('S0 =', S0);
        if (SPLIT) {
            LS = jParse('float');
                //pos.LS = filedata.indexOf('=',pos.checkpoint1)+1;
                //LS = parseFloat(filedata.substr( pos.LS, 10 ));
            RC1 = jParse('float');
                //pos.RC1 = filedata.indexOf('=',pos.LS)+1;
                //RC1 = parseFloat(filedata.substr( pos.RC1, 10 ));
            C1 = jParse('float');
                //pos.C1 = filedata.indexOf('=',pos.RC1)+1;
                //C1 = parseFloat(filedata.substr( pos.C1, 10 ));
            C0 = jParse('float');
                //pos.C0 = filedata.indexOf('=',pos.C1)+1;
                //C0 = parseFloat(filedata.substr( pos.C0, 10 ));
            RO0 = jParse('float');
                //pos.RO0 = filedata.indexOf('=',pos.C0)+1;
                //RO0 = parseFloat(filedata.substr( pos.RO0, 10 ));
            FILL = jParse('str', 2, '=', 5);
                //pos.FILL = filedata.indexOf('=',pos.RO0)+2;
                //FILL = filedata.substr( pos.FILL, 5 );
            // TODO use json configs

            RC0 = RO0 * C0;
            KAP1 = (RC1 - RC0) / (RC1 + RC0);
            KAP1 = KAP1 * KAP1;
            KAP = 1 - KAP1;
            T0 = RZ * (LS/C1 + (X-LS)/C2);
            DTT = 2 * LS * RZ / C1;
        }

        jParse('float', 1, '*', 1);
            //pos.checkpoint2 = filedata.indexOf('*',pos.checkpoint1)+1;
        INDEX = jParse('int');
            //pos.INDEX = filedata.indexOf('=',pos.checkpoint2)+1;
            //INDEX = parseInt( filedata.substr( pos.INDEX, 10 ) );
        FRIC = jParse('float');
            //pos.FRIC = filedata.indexOf('=',pos.INDEX)+1;
            //FRIC = parseFloat(filedata.substr( pos.FRIC, 10 ));
        M0 = jParse('float');
            //pos.M0 = filedata.indexOf('=',pos.FRIC)+1;
            //M0 = parseFloat(filedata.substr( pos.M0, 10 ));

        jParse('float', 1, '*', 1);
            //pos.checkpoint3 = filedata.indexOf('*',pos.M0);

        M0 = 1 / M0;

        GEOMPROC();

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

        TM = jParse('float');
            //pos.TM = filedata.indexOf('=', pos.checkpoint3) + 1;
            //TM = parseFloat(filedata.substr(pos.TM, 10));
        DT = jParse('float');
            //pos.DT = filedata.indexOf('=', pos.TM) + 1;
            //DT = parseFloat(filedata.substr(pos.DT, 10));
        DFI = jParse('float');
            //pos.DFI = filedata.indexOf('=', pos.DT) + 1;
            //DFI = parseFloat(filedata.substr(pos.DFI, 10));
        DFI = DFI * Math.PI / 180;
        DX = jParse('float');
            //pos.DX = filedata.indexOf('=', pos.DFI) + 1;
            //DX = parseFloat(filedata.substr(pos.DX, 10));
        NTP = jParse('float');
            //pos.NTP = filedata.indexOf('=', pos.DX) + 1;
            //NTP = parseInt(filedata.substr(pos.NTP, 10));

        TP = new Array(NTP+2);
        ITP = new Array(NTP+2);
        // READ(2,*) (TP(I), I=1,NTP);
        // SOLVED what is final values of [0, 15, 30 ...] or [0, 0, 15, 30 ...] ? It seems that [0, 0, 15, 30 ...]
        // I probably understand arrays correctly, so it is as it is.
        for (var itTP = 0; itTP < NTP; itTP++) {
            if (itTP == 0)
                TP[itTP + 1] = jParse('float');
            else
                TP[itTP + 1] = jParse('float', 1, ',', 10);
        }
            //pos.TP = filedata.indexOf('=', pos.NTP) + 1;
            //pos.lastTPcomma = pos.TP;
            //for (var itTP = 0; itTP < NTP; itTP++) {
            //    if (itTP != 0) pos.lastTPcomma = filedata.indexOf(',', pos.lastTPcomma) + 1;
            //    TP[itTP+1] = parseFloat(filedata.substr(pos.lastTPcomma, 10));
            //}
        OMG = jParse('float');
            //pos.OMG = filedata.indexOf('=', pos.TP) + 1;
            //OMG = parseFloat(filedata.substr(pos.OMG, 10));
        BET = jParse('float');
            //pos.BET = filedata.indexOf('=', pos.OMG) + 1;
            //BET = parseFloat(filedata.substr(pos.BET, 10));
        STEP = jParse('float');
            //pos.STEP = filedata.indexOf('=', pos.BET) + 1;
            //STEP = parseFloat(filedata.substr(pos.STEP, 10));
        STEPX = jParse('float');
            //pos.STEPX = filedata.indexOf('=', pos.STEP) + 1;
            //STEPX = parseFloat(filedata.substr(pos.STEPX, 10));
        DELTA = jParse('int');
            //pos.DELTA = filedata.indexOf('=', pos.STEPX) + 1;
            //DELTA = parseInt(filedata.substr(pos.DELTA, 10));

        STEPFI();

        T0 = 1.1 * XDESTR;
        // SOLVED, Harry said that NINT == Round, also MIFI book tells the same.
        NT = Math.round(TM/DT);
        NXDST = Math.round(XDESTR/STEPX);
        NBX = NT + Math.round(XDESTR/DX) + 10;
        NTIME = Math.round((TM+T0)/STEP) + 3;
        STARTOUT();
        if (EPUR > 0) WAVEEPURE();
        MTRXPROC();
        //});

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

        console.log("STARTPROC has end work");

        // helpfull method for reading
        var lastIndex = 0;
        function jParse(varType, shift, symb, len, src){
            shift = shift || 1;
            symb = symb || '=';
            len = len || 10;
            src = src || filedata;

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

    }
    exports.STARTPROC = STARTPROC;

    // TODO do it asynchronous
    function GEOMPROC(){
        var K; // integer
        var T,TETA,TK,H,RT, A,B,T1,T2,AK; // float
        var MOM; // Complex
        var ROOT = new Boolean();

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

        var RTET = FUNC2.RTET;
        while(true){
            if (TETA > 2 * Math.PI) break;
            // SOLVED, SIMPS from what part of code is it? http://en.wikipedia.org/wiki/Simpson's_rule
            // The only I have is numbers.calculus.adaptiveSimpson(), http://en.wikipedia.org/wiki/Adaptive_Simpson's_method
            // seems like that adaptiveSimpson(RTET, 0, TETA, H), what is for 2nd parameter? Is it for number of steps N?
            // adaptiveSimpson don't have number of steps. Number of steps depends on eps
            // SIMPLE simpson defined in BBstart, but we can improve it.

            // SOLVED real + complex == real + complex.RE , isn't it?
            // It is correct.
            S = S + SIMPS(RTET, 2, 0, TETA, H).re;  // .re because S and JC is float values
            JC = JC + SIMPS(RTET, 4, 0, TETA, H).re;
            // SOLVED, What type returns SIMPS function float or Complex?
            // SIMPS are defined in BBstart, it is complex
            MOM = MOM.subtract( (SIMPS(RTET, 3, 1, TETA, H)).divide(new Complex(3,0)) );      // TODO interval from 1 to 0 (TETA initialized with ZERO)
            RT = RTET(TETA);
            //WRITE(30,'(6(4X,F7.3))')  TETA*180/PI,RT,COS(ATN(TETA)),SIN(ATN(TETA)),COS(ATN(TETA)-ALFA),SIN(ATN(TETA)-ALFA);
            recBuffer = new Buffer(
                (TETA*180/Math.PI).toFixedDef() + " " +
                (RT).toFixedDef() + " " +
                (Math.cos(FUNC2.ATN(TETA))).toFixedDef() + " " +
                (Math.sin(FUNC2.ATN(TETA))).toFixedDef() + " " +
                (Math.cos(FUNC2.ATN(TETA)-ALFA)).toFixedDef() + " " +
                (Math.sin(FUNC2.ATN(TETA)-ALFA)).toFixedDef() +
                "\n" );
            //noinspection JSUnresolvedFunction
            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
            TETA = TETA + H;
        }

        S = S / 2;
        // L - характерный размер
        L = Math.sqrt(S / Math.PI);
        //WRITE(*,'()');
        //WRITE(*,'(2(A,F6.3))') '        S= ',S,'  L= ',L
        //WRITE(*,'()');
        console.log("S =", S, "L =", L);

        JC = .25 * JC / (Math.pow(L, 4));
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
                    if ((Math.abs(T2 - T1) < .0001) || ROOT) break;
                    T = .5 * (T1 + T2);
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
                    TK = .5 * (T1 + T2);
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
        // SOLVED, DO DO... exp for Complex.  Euler's formula: exp(ix) = cos(x) + i * sin(x). Is it correct that ALIM is complex value?
        // from upper exapmple, ALIM = Math.exp(IM * ALFA); ALIM = new Complex(Math.cos(ALFA), Math.sin(ALFA));
        //ZC = ZC / L * Math.exp(-IM*ALFA);
        ZC = (ZC.divide(new Complex(L, 0))).multiply(new Complex(Math.cos(-ALFA), Math.sin(-ALFA))); // ЦЕНТР МАСС
        // SOLVED, JC initialized as float, why there is
        // because it is real value
        JC = JC - Math.PI * ((ZC.multiply(ZC.conjugate())).re); // МОМЕНТ ИНЕРЦИИ ОТНОСИТЕЛЬНО ЦЕНТРА МАСС
        RISQ = JC / Math.PI;			 // КВАДРАТ РАДИУСА ИНЕРЦИИ

        // fs.close
        //noinspection JSUnresolvedFunction
        fs.closeSync(fd);
        console.log(CavformPath, "file written");
        console.log("GEOMPROC has end work");
    }

    function STEPFI(){
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
        I = 0;
        J = JTP;
        while (true){
            if (J == NTP+2) {
                J = 1;
                if (J == JTP) break;
            }
            TET = Math.PI * TP[J]/180;
            for (M = I; M <= NFI + 1; M++){
                if (TET <= TAR[M]){
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

    function MTRXPROC(){
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
            return (new Complex(Math.pow(F(value), N), 0)).multiply(new Complex(Math.cos(M * T), Math.sin(M * T)));
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
                return -S0 * T * T * Math.sin(BETTA*T) * Math.exp(-A1 * T);
            }
        } else {
            console.log("Unknown value of EPUR in FF", EPUR);
            return 0;
        }
    }

    function TENS(T){
        var Q, S, TT; // float
        if (SPLIT) {
            S = 0; Q = 1; TT = T - T0;
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
    exports.TENS = TENS;

    function WAVEEPURE(){
        var TMAX = 50;
        var T = 0;

        var CavformPath = 'BBdat/_Epure.dat'; // looks like path depends on app.js for server side
        //noinspection JSUnresolvedFunction
        var fd = fs.openSync(CavformPath, 'w');
        var recBuffer = new Buffer('T, ' + 'F\n');
        //noinspection JSUnresolvedFunction
        fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);

        if (EPUR == 1) {
            while (true){
                if (T > TPLUS) break;
                recBuffer = new Buffer(T.toFixedDef() + ' ' + (-C2*C2*RO2*TENS(T)*1E-06).toFixedDef() + '\n');
                //noinspection JSUnresolvedFunction
                fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
                T = T + TPLUS/50;
            }
        } else if (EPUR == 2) {
            while (true) {
                if (T > TMAX) break;
                recBuffer = new Buffer(T.toFixedDef() + ' ' + (C2*C2*RO2*TENS(LC*T)*1E-06).toFixedDef() + '\n');
                //noinspection JSUnresolvedFunction
                fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
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
        var ARS1 = ['V_1.dat','V_2.dat','S11.dat','S22.dat','S12.dat'];
        var ARS2 = ['V01.dat','V02.dat','S011.dat','S022.dat','S012.dat'];
        var STR = [];

        var fds1 = [];
        var fds2 = [];
        var recBuffer, recStr;
        var path;

        for (I = 11; I <= 15; I++) {
            path = 'BBdat/_' + ARS1[I-11]; // looks like path depends on app.js for server side
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
                fs.writeSync(fds1[I-11], recBuffer, 0, recBuffer.length, null);

                recStr = '';
                for (var c1 = 0, lenStr = STR.length; c1 < lenStr; c1++) recStr += STR[c1] + ' ';
                recBuffer = new Buffer('T ' + recStr + '\n');
                //noinspection JSUnresolvedFunction
                fs.writeSync(fds1[I-11], recBuffer, 0, recBuffer.length, null);

                X = X + STEPX;
            }

            //fs.closeSync(fds1[I-11]);
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

        data = new Datatone();
        data.fds1 = fds1;
        data.fds2 = fds2;
    }


})(typeof exports === 'undefined'? this['BBstart']={} : exports);
