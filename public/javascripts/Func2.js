/**
 * Created by jaric on 22.10.2014.
 */

(function(exports){
    function RTET(TT){
        var RTET;
        // REAL,INTENT(IN) :: TT
        var N = 8, N1 = 1.3, N2 = 1.2, A = 2.05, B = 2.05, C = 4.5, PI2 = 2 / Math.PI, EPS = B / A, VORTEX = 0;
        var T0, T, FI, M, EPS1; // float

        T0 = Math.PI * VORTEX / 180;    // TODO it is zero always, isn't it???
        // SOLVED, VORTEX could be changed, MANUALLY
        EPS1 = B * Math.cos(T0) / C;
        // SOLVED, если окружность, то return, иначе комментируем эту строчку
        RTET = 2.2; return RTET;

        T = TT;
        if (T > 2 * Math.PI) T = T - 2 * Math.PI;

        if ( (T > 2 * Math.PI) && (T < 3 * Math.PI / 2)) {
            RTET = B * Math.pow( ( Math.pow(Math.abs(Math.sin(T)), N) + Math.pow(EPS * Math.abs(Math.cos(T)), N) ), (-1.0/N));
        } else {
            if (T >= 3 * Math.PI / 2) T = T - 2 * Math.PI;
            if (T < T0) {
                FI = (T-T0) / (1+PI2*T0);
                M = N2;
            } else {
                FI = (T-T0) / (1-PI2*T0);
                M = N1;
            }
            RTET = B* Math.pow(Math.pow(Math.abs(Math.sin(FI)), M) + Math.pow(EPS1 * Math.abs(Math.cos(FI)), M), (-1.0/M));
        }
        return RTET;
    }
    exports.RTET = RTET;

    // values A, B would be changed
    function RCURB(T, A, B) {
        var ans = { A: null, B: null};
        var R, DR1, DR2, R0, R1, DT = 0.001;
        R = RTET(T);
        R1 = RTET(T + DT);
        R0 = RTET(T - DT);
        DR1 = (R1 - R0) / (2*DT);
        DR2 = (R1 - 2*R + R0) / (DT*DT);
        DR2 = Math.abs((-DR2 + R)*R + 2*DR1*DR1);
        B = Math.sqrt(R*R + DR1*DR1);
        A = DR2 / (Math.pow(B,3));
        ans.A = A;
        ans.B = B;
        return ans;
        // return A, B;
        // DERIV(RTET,1,T,0.02,0.5); DERIV(RTET,2,T,0.02,0.5);
    }
    exports.RCURB = RCURB;

    function ATN(T){
        var DR1, DT = 0.001;
        DR1 = (RTET(T + DT) - RTET(T - DT)) / (2*DT);
        // DR1=DERIV(RTET,1,T,0.02,0.1);
        return T - Math.atan(DR1 / RTET(T));
    }
    exports.ATN = ATN;

})(typeof exports === 'undefined'? this['FUNC2']={} : exports);
