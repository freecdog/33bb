/**
 * Created by jaric on 22.10.2014.
 */

(function(exports){

    var FUNC2 = require('./Func2.js');
    var MatMult = require('./MatMult.js');

    // JS dependencies
    var numbers = require('numbers');
    var Complex = numbers.complex;
    var calculus = numbers.calculus;
    var matrix = numbers.matrix;

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
    }

    var SPLIT = new Boolean();
    var FILL = "";
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
        FU,FG,FR,FL; // (5,5) of float [ [[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]] ]
    var ZC,ALIM,IM = new Complex(0.0,1.0); // complex
    var NT,NTP,JTP,NFI,NBX,NTIME,NXDST,INDEX,EPUR,DELTA; // integer

    // SOLVED CONTAINS, does it mean something for js? Is it for variables namespace? No it's just place where subroutines take places

    // SOVLED, why don't you convert BBinput.dat to json???
    // reading of BBinput.dat file
    function STARTPROC(){
        var RC0,RC1,RC2,B1,B2, M0,C0,C1,RO0,LS,X,RZ,GAMMA,POIS,BET,OMG; // float //FI,
        var GAPOIS = new Boolean();
        var I;

        console.log("STARTPROC has start work");

        var BBinputPath = 'BBdat/BBinput.dat'; // looks like path depends on app.js for server side
        fs.readFile(BBinputPath, {encoding: 'utf8'}, function(err, data){
            console.log("STARTPROC has sdfgsdfgsdfgsdfg", err);
            if (err) throw err;
            console.log(data);
            console.log("=============================");
            // pos is list of used positions
            var pos = {};
            pos.ALFA = data.indexOf('=',0)+1;
            ALFA = parseInt( data.substr( pos.ALFA, 10 ) );
            ALFA = ALFA * Math.PI / 180;
            // SOVLED DO DO... exp for Complex.  Euler's formula: exp(ix) = cos(x) + i * sin(x). Is it correct that ALIM is complex value?
            //ALIM = Math.exp(IM * ALFA);
            ALIM = new Complex(Math.cos(ALFA), Math.sin(ALFA));
            pos.SPLIT = data.indexOf('=',pos.ALFA)+4;
            SPLIT = charToBoolean(data.substr( pos.SPLIT, 1)); //Boolean(data.substr( pos.SPLIT, 1 ));
            pos.RZ = data.indexOf('=',pos.SPLIT)+1;
            RZ = parseFloat(data.substr( pos.RZ, 10 ));
            pos.X = data.indexOf('=',pos.RZ)+1;
            X = parseFloat(data.substr( pos.X, 10 ));
            pos.RO2 = data.indexOf('=',pos.X)+1;
            RO2 = parseFloat(data.substr( pos.RO2, 10 ));
            pos.C2 = data.indexOf('=',pos.RO2)+1;
            C2 = parseFloat(data.substr( pos.C2, 10 ));
            pos.GAPOIS = data.indexOf('=',pos.C2)+3;
            GAPOIS = charToBoolean(data.substr( pos.GAPOIS, 1));
            pos.POIS = data.indexOf('=',pos.GAPOIS)+1;
            POIS = parseFloat(data.substr( pos.POIS, 10 ));
            pos.GAMMA = data.indexOf('=',pos.POIS)+1;
            GAMMA = parseFloat(data.substr( pos.GAMMA, 10 ));
            pos.XDESTR = data.indexOf('=',pos.GAMMA)+1;
            XDESTR = parseFloat(data.substr( pos.XDESTR, 10 ));

            pos.EPUR = data.indexOf('=',pos.XDESTR)+1;
            EPUR = parseInt( data.substr( pos.EPUR, 10 ) );

            pos.checkpoint1 = data.indexOf('*',pos.EPUR)+1;

            console.log("STARTPROC has read half of values");

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
                pos.LS = data.indexOf('=',pos.checkpoint1)+1;
                LS = parseFloat(data.substr( pos.LS, 10 ));
                pos.RC1 = data.indexOf('=',pos.LS)+1;
                RC1 = parseFloat(data.substr( pos.RC1, 10 ));
                pos.C1 = data.indexOf('=',pos.RC1)+1;
                C1 = parseFloat(data.substr( pos.C1, 10 ));
                pos.C0 = data.indexOf('=',pos.C1)+1;
                C0 = parseFloat(data.substr( pos.C0, 10 ));
                pos.RO0 = data.indexOf('=',pos.C0)+1;
                RO0 = parseFloat(data.substr( pos.RO0, 10 ));
                pos.FILL = data.indexOf('=',pos.RO0)+2;
                FILL = data.substr( pos.FILL, 5 );
                // TODO use json configs

                RC0 = RO0 * C0;
                KAP1 = (RC1 - RC0) / (RC1 + RC0);
                KAP1 = KAP1 * KAP1;
                KAP = 1 - KAP1;
                T0 = RZ * (LS/C1 + (X-LS)/C2);
                DTT = 2 * LS * RZ / C1;
            }

            pos.checkpoint2 = data.indexOf('*',pos.checkpoint1)+1;
            pos.INDEX = data.indexOf('=',pos.checkpoint2)+1;
            INDEX = parseInt( data.substr( pos.INDEX, 10 ) );
            pos.FRIC = data.indexOf('=',pos.INDEX)+1;
            FRIC = parseFloat(data.substr( pos.FRIC, 10 ));
            pos.M0 = data.indexOf('=',pos.FRIC)+1;
            M0 = parseFloat(data.substr( pos.M0, 10 ));

            pos.checkpoint3 = data.indexOf('*',pos.M0);

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

            pos.TM = data.indexOf('=',pos.checkpoint3)+1;
            TM = parseFloat(data.substr( pos.TM, 10 ));
            pos.DT = data.indexOf('=',pos.TM)+1;
            DT = parseFloat(data.substr( pos.DT, 10 ));
            pos.DFI = data.indexOf('=',pos.DT)+1;
            DFI = parseFloat(data.substr( pos.DFI, 10 ));
            DFI = DFI * Math.PI / 180;
            pos.DX = data.indexOf('=',pos.DFI)+1;
            DX = parseFloat(data.substr( pos.DX, 10 ));
            pos.NTP = data.indexOf('=',pos.DX)+1;
            NTP = parseInt(data.substr( pos.NTP, 10 ));
            TP = new Array(NTP+2);
            ITP = new Array(NTP+2);
            //READ(2,*)	(TP(I), I=1,NTP);
            // ТОЧКИ ДЛЯ ПЕЧАТИ ПО УГЛУ(ГРАД)=	 0,15,30,45,60,75,90
            // SOLVED what is final values of [0, 15, 30 ...] or [0, 0, 15, 30 ...] ? It seems that [0, 0, 15, 30 ...]
            // I probably understand arrays correctly, so it is as it is.
            pos.TP = data.indexOf('=',pos.NTP)+1;
            pos.lastTPcomma = pos.TP;
            for (var itTP = 0; itTP < NTP; itTP++) {
                if (itTP != 0) pos.lastTPcomma = data.indexOf(',', pos.lastTPcomma)+1;
                TP[itTP+1] = parseFloat(data.substr( pos.lastTPcomma, 10 ));
            }
            pos.OMG = data.indexOf('=',pos.TP)+1;
            OMG = parseFloat(data.substr( pos.OMG, 10 ));
            pos.BET = data.indexOf('=',pos.OMG)+1;
            BET = parseFloat(data.substr( pos.BET, 10 ));
            pos.STEP = data.indexOf('=',pos.BET)+1;
            STEP = parseFloat(data.substr( pos.STEP, 10 ));
            pos.STEPX = data.indexOf('=',pos.STEP)+1;
            STEPX = parseFloat(data.substr( pos.STEPX, 10 ));
            pos.DELTA = data.indexOf('=',pos.STEP)+1;
            DELTA = parseInt(data.substr( pos.DELTA, 10 ));

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
        });

        console.log("STARTPROC has end work");
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
        var fd = fs.openSync(CavformPath, 'w');
        // SOLVED, writing to console? WRITE(30,'(6(5X,A))')  ' TETA ', '   R   ','COS(FI)','SIN(FI) ','COS(PSI) ','SIN(PSI) '
        // write to file here
        var recBuffer = new Buffer('TETA, ' + 'R, ' + 'COS(FI), ' + 'SIN(FI), ' + 'COS(PSI), ' + 'SIN(PSI)\n');
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
                (TETA*180/Math.PI).toFixedDef().toString() + " " +
                (RT).toFixedDef().toString() + " " +
                (Math.cos(FUNC2.ATN(TETA))).toFixedDef().toString() + " " +
                (Math.sin(FUNC2.ATN(TETA))).toFixedDef().toString() + " " +
                (Math.cos(FUNC2.ATN(TETA)-ALFA)).toFixedDef().toString() + " " +
                (Math.sin(FUNC2.ATN(TETA)-ALFA)).toFixedDef().toString() +
                "\n" );
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
        NI = Math.round(DFI/H);
        NFI = 0;
        K1 = 0;
        while (true) {
            if (TET>TET0+2*Math.PI) break;
            K0 = K1 + 1;
            ROM = L;
            for (I=1; I <= NI; I++) {
                FUNC2.RCURB(TET,RO,LL);
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
            FUNC2.RCURB(TETA, COURB[I], LONG[I]);
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
        var M, F, LAY, LAX // [5,5] of float
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

    function STARTOUT(){
        console.error('STARTOUT DO NOTHING!!!');
    }

    function WAVEEPURE(){
        console.error('WAVEEPURE DO NOTHING!!!');
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

})(typeof exports === 'undefined'? this['BBstart']={} : exports);
