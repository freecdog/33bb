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
        EPS1 = B * Math.cos(T0) / C;
        RTET = 2.2; // return; // TODO return ?!?!?!??!?! Looks like in FORTRAN return doesn't breaks function with return.

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
})(typeof exports === 'undefined'? this['FUNC2']={} : exports);
