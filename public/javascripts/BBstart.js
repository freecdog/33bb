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

    var fs = require('fs');

    // helpful methods
    function charToBoolean(char){
        return char[0].toLowerCase() == 't';  // if first letter is T than true else false
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

    // SOVED CONTAINS, does it mean something for js? Is it for variables namespace? No it's just place where subroutines take places

    // SOVLED, why don't you convert BBinput.dat to json???
    // reading of BBinput.dat file
    function STARTPROC(){
        var RC0,RC1,RC2,B1,B2, M0,C0,C1,RO0,LS,X,RZ,GAMMA,POIS,BET,OMG; // float //FI,
        var GAPOIS = new Boolean();
        var I;

        var BBinputPath = 'BBdat/BBinput.dat'; // looks like path depends on app.js for server side
        fs.readFile(BBinputPath, {encoding: 'utf8'}, function(err, data){
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

            pos.checkpoint1 = data.indexOf('*',pos.EPUR);

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
                // SOLVED very weak parse ability
                // everytihng will be just fine when I will use json configs
                FILL = data.substr( pos.FILL, 5 );

                RC0 = RO0 * C0;
                KAP1 = (RC1 - RC0) / (RC1 + RC0);
                KAP1 = KAP1 * KAP1;
                KAP = 1 - KAP1;
                T0 = RZ * (LS/C1 + (X-LS)/C2);
                DTT = 2 * LS * RZ / C1;
            }

            pos.checkpoint2 = data.indexOf('*',pos.FILL);
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
            TP = new Array(NTP+1);
            ITP = new Array(NTP+1);
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
            if (EPUR>0) WAVEEPURE();
            MTRXPROC();
        });
    }

    exports.STARTPROC = STARTPROC;

    function GEOMPROC(){
        var K; // integer
        var T,TETA,TK,H,RT, A,B,T1,T2,AK; // float
        var MOM; // Complex
        var ROOT = new Boolean();

        var CavformPath = 'BBdat/Cavform.dat'; // looks like path depends on app.js for server side
        fs.open(CavformPath, 'w', function(err, fd){
            // SOLVED, writing to console? WRITE(30,'(6(5X,A))')  ' TETA ', '   R   ','COS(FI)','SIN(FI) ','COS(PSI) ','SIN(PSI) '
            // write to file here
            var recBuffer = new Buffer(' TETA ' + '   R   ' + 'COS(FI)' + 'SIN(FI) ' + 'COS(PSI) ' + 'SIN(PSI) ');
            fs.writeSync(fd, recBuffer, 0, recBuffer.length, null);
            S = 0;
            JC = 0;
            MOM = new Complex(0.0,0.0);
            H = Math.PI/180;
            TETA = 0;

            var RTET = FUNC2.RTET;
            while(true){
                if (TETA > 2 * Math.PI) break;
                // TODO SIMPS from what part of code is it? http://en.wikipedia.org/wiki/Simpson's_rule
                // The only I have is numbers.calculus.adaptiveSimpson(), http://en.wikipedia.org/wiki/Adaptive_Simpson's_method
                // seems like that adaptiveSimpson(RTET, 0, TETA, H), what is for 2nd parameter? Is it for number of steps N?
                // adaptiveSimpson don't have number of steps. Number of steps depends on eps

                S = S + calculus.adaptiveSimpson(RTET,0,TETA,H);
                //S = S + SIMPS(RTET,2,0,TETA,H);
                JC = JC + calculus.adaptiveSimpson(RTET,0,TETA,H);
                //JC = JC + SIMPS(RTET,4,0,TETA,H);
                // TODO What type returns SIMPS function float or Complex?
                // SOLVED, SIMPS are defined in BBstart, it is complex
                MOM = MOM.subtract(new Complex(calculus.adaptiveSimpson(RTET,1,TETA,H)/3, 0));      // TODO interval from 1 to 0 (TETA initialized with ZERO)
                //MOM = MOM - SIMPS(RTET,3,1,TETA,H)/3;
                RT = RTET(TETA);
                //WRITE(30,'(6(4X,F7.3))')  TETA*180/PI,RT,COS(ATN(TETA)),SIN(ATN(TETA)),COS(ATN(TETA)-ALFA),SIN(ATN(TETA)-ALFA);
                TETA = TETA+H;
            }

            S = S / 2;
            // L - характерный размер
            L = Math.sqrt(S / Math.PI);
            //WRITE(*,'()');
            //WRITE(*,'(2(A,F6.3))') '        S= ',S,'  L= ',L
            //WRITE(*,'()');
            JC = .25 * JC / (Math.pow(L, 4));
            ZC = MOM / S;
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
                    B = Math.atan(T) - AK;  // TODO atan (-Pi/2,Pi/2) vs atan2(-Pi, Pi). Original: B=ATN(T)-AK;
                    ROOT = (B==0);
                }

                if (ROOT) {
                    TK = T;
                } else {
                    T1 = T - H;
                    T2 = T;
                    while (true) {
                        if ((Math.abs(T2 - T1) < .0001) || ROOT) break;
                        T = .5 * (T1 + T2);
                        B = Math.atan(T) - AK; // TODO atan (-Pi/2,Pi/2) vs atan2(-Pi, Pi). Original: B=ATN(T)-AK;
                        ROOT = (B==0);
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
            // TODO DO DO... exp for Complex.  Euler's formula: exp(ix) = cos(x) + i * sin(x). Is it correct that ALIM is complex value?
            // from upper exapmple, ALIM = Math.exp(IM * ALFA); ALIM = new Complex(Math.cos(ALFA), Math.sin(ALFA));
            //ZC = ZC / L * Math.exp(-IM*ALFA);
            ZC = (ZC.divide(new Complex(L, 0))).multiply(new Complex(Math.cos(-ALFA), Math.sin(-ALFA))); // ЦЕНТР МАСС
            // TODO JC initialized as float, why there is
            // SOLVED coz it is real value
            JC = JC - Math.PI * ((ZC.multiply(ZC.conjugate())).re); // МОМЕНТ ИНЕРЦИИ ОТНОСИТЕЛЬНО ЦЕНТРА МАСС
            RISQ = JC / Math.PI;			 // КВАДРАТ РАДИУСА ИНЕРЦИИ

            fs.close(fd, function(){
                // done;
                console.log(CavformPath, "file written");
            });
        });
    }

    function STEPFI(){
        var I,J,NI,K,K0,K1,M; // integer
        var RO,ROM,TET,LL,TETA; // real
        var ADF, ATAR; // of real
        NI = Math.round(2*Math.PI/H)+10;
        ADF = new Array(NI + 1); // TODO, original ALLOCATE(ADF(0:NI),ATAR(0:NI)); , is it correct JS interpretation
        ATAR = new Array(NI + 1);
        for (var i = 0; i <= NI; i++) {
            ADF[i] = 0;
            ATAR[i] = 0;
        }
        TET=180*TET0/Math.PI;
        for (J = 1; J <= NTP; J++) {
            if (TP[J] >= TET) {
                if (TP[J] == TET) {
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
                // TODO, originally there is EXIT, is it correct? So,
                // it will breaks for loop and count only for J == 1
                // SOLVED, just put the break here as in main part
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
                RCURB(TET,RO,LL);
                RO=1/RO;
                if (RO < ROM) ROM = RO;
                TET = TET + H;
            }
            K = Math.round(Math.min(L/ROM, DFI/H));
            K1 = K0 + K - 1;
            NFI = NFI + K;
            // TODO what is it?
            // ADF(K0:K1)=MAX(DFI/K,H);
            // SOLVED
            for (var adfi = K0; adfi <= K1; adfi++) {
                ADF[adfi] = Math.max(DFI / K, H);
            }
            for (I = K0; I <= K1; I++) {
                ATAR[I] = ATAR[I-1] + 0.5*(ADF[I-1] +  ADF[i]);
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
            RCURB(TETA, COURB[I], LONG[I]);
            FAR[I] = ATN(TETA) - ALFA;
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
                if (TET <+ TAR[M]){
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

    function STARTOUT(){
        console.error('STARTOUT DO NOTHING!!!');
    }

    function WAVEEPURE(){
        console.error('WAVEEPURE DO NOTHING!!!');
    }

    function MTRXPROC(){
        console.error('MTRXPROC DO NOTHING!!!');
    }

})(typeof exports === 'undefined'? this['BBstart']={} : exports);
