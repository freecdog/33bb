/**
 * Created by jaric on 22.10.2014.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {
    //(function(exports) {
        var FUNC2 = {};

        // global on the server, window in the browser
        var root, previous_FUNC2;

        root = this;
        if (root != null) {
            previous_FUNC2 = root.FUNC2;
        }

        // This method is for creation object form
        function RTET(TT) {
            var RTET;
            // REAL,INTENT(IN) :: TT
            var N = 2, N1 = 1.3, N2 = 1.2, A = 2.05, B = 4.05, C = 4.5,
                PI2 = 2 / Math.PI, EPS = B / A, VORTEX = 0;
            var NOEDGE = true;
            var T0, T, FI, M, EPS1; // float

            T0 = Math.PI * VORTEX / 180;    // solvedTODO it is zero always, isn't it???
            // SOLVED, VORTEX can be changed MANUALLY
            // TODO if VORTEX can be changed manually, it should be moved to configuration or elsewhere
            EPS1 = B * Math.cos(T0) / C;
            // SOLVED, если окружность, то return, иначе комментируем эту строчку
            // TODO if we are using simple circle, we should change radius in configuration file
            RTET = A;
            return RTET;

            function repeatedFunction(angle, power, epsilon){
                return B * Math.pow( (Math.pow(Math.abs(Math.sin(angle)), power) + Math.pow(epsilon * Math.abs(Math.cos(angle)), power)) , (-1.0/power))
            }

            if (NOEDGE){
                RTET = repeatedFunction(TT, N, EPS);
                return RTET;
            }

            T = TT;
            if (T > 2 * Math.PI) T = T - 2 * Math.PI;

            if ((T > Math.PI / 2) && (T < 3 * Math.PI / 2)) {
                RTET = repeatedFunction(T, N, EPS);
            } else {
                if (T >= 3 * Math.PI / 2) T = T - 2 * Math.PI;
                if (T < T0) {
                    FI = (T - T0) / (1 + PI2 * T0);
                    M = N2;
                } else {
                    FI = (T - T0) / (1 - PI2 * T0);
                    M = N1;
                }
                RTET = repeatedFunction(FI, M, EPS1);
            }
            return RTET;

            /*var RTET;
            // REAL,INTENT(IN) :: TT
            var N = 8, N1 = 1.3, N2 = 1.2, A = 2.05, B = 2.05, C = 4.5, PI2 = 2 / Math.PI, EPS = B / A, VORTEX = 0;
            var T0, T, FI, M, EPS1; // float

            T0 = Math.PI * VORTEX / 180;    // solvedTODO it is zero always, isn't it???
            // SOLVED, VORTEX could be changed, MANUALLY
            EPS1 = B * Math.cos(T0) / C;
            // SOLVED, если окружность, то return, иначе комментируем эту строчку
            RTET = 2.2;
            return RTET;

            T = TT;
            if (T > 2 * Math.PI) T = T - 2 * Math.PI;

            if ((T > 2 * Math.PI) && (T < 3 * Math.PI / 2)) {
                RTET = B * Math.pow(( Math.pow(Math.abs(Math.sin(T)), N) + Math.pow(EPS * Math.abs(Math.cos(T)), N) ), (-1.0 / N));
            } else {
                if (T >= 3 * Math.PI / 2) T = T - 2 * Math.PI;
                if (T < T0) {
                    FI = (T - T0) / (1 + PI2 * T0);
                    M = N2;
                } else {
                    FI = (T - T0) / (1 - PI2 * T0);
                    M = N1;
                }
                RTET = B * Math.pow(Math.pow(Math.abs(Math.sin(FI)), M) + Math.pow(EPS1 * Math.abs(Math.cos(FI)), M), (-1.0 / M));
            }
            return RTET;*/
        }

        FUNC2.RTET = RTET;
        //exports.RTET = RTET;

        // values A, B would be changed
        function RCURB(T, A, B) {
            var ans = { A: null, B: null};
            var R, DR1, DR2, R0, R1, DT = 0.001;
            R = RTET(T);
            R1 = RTET(T + DT);
            R0 = RTET(T - DT);
            DR1 = (R1 - R0) / (2 * DT);
            DR2 = (R1 - 2 * R + R0) / (DT * DT);
            DR2 = Math.abs((-DR2 + R) * R + 2 * DR1 * DR1);
            B = Math.sqrt(R * R + DR1 * DR1);
            A = DR2 / (Math.pow(B, 3));
            ans.A = A;
            ans.B = B;
            return ans;
            // return A, B;
            // DERIV(RTET,1,T,0.02,0.5); DERIV(RTET,2,T,0.02,0.5);
        }

        FUNC2.RCURB = RCURB;
        //exports.RCURB = RCURB;

        // TODO it is just returns T, should check RTET also and compare with F90 version
        function ATN(T) {
            var DR1, DT = 0.001;
            DR1 = (RTET(T + DT) - RTET(T - DT)) / (2 * DT);
            // DR1=DERIV(RTET,1,T,0.02,0.1);
            return T - Math.atan(DR1 / RTET(T));
        }

        FUNC2.ATN = ATN;
        //exports.ATN = ATN;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = FUNC2;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return FUNC2;
            });
        }
        // included directly via <script> tag
        else {
            root.FUNC2 = FUNC2;
        }

    }());
    //})(typeof exports === 'undefined'? this['FUNC2']={} : exports);

});
