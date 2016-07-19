/**
 * Created by jaric on 19.09.2014.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {
    //(function(exports){

        var MatMult = {};

        // global on the server, window in the browser
        var root, previous_MatMult;

        root = this;
        if (root != null) {
            previous_MatMult = root.MatMult;
        }

        //!
        function oINV() {
            // type overriding Inv, InvC
            return -1;
        }

        function oTR() {
            return -1;
        }

        function ox() {
            return -1;
        }

        // CONTAINS

        // A, B [] of REAL
        function VectorTimesVector(A,B){
            return DOT_PRODUCT(A,B);
        }

        // A, B [][] of REAL
        function MatTimesMat(A,B){
            //REAL, DIMENSION( SIZE(A,1), SIZE(B,2) ) :: MatTimesMat
            return MATMUL(A,B);
        }

        // A, B [][] of COMPLEX
        function MatTimesMatC(A,B){
            //COMPLEX, DIMENSION( SIZE(A,1), SIZE(B,2) ) :: MatTimesMat
            return MATMUL(A,B);
        }

        // A [][] of real, X [] of real
        function MatTimesVector(A,X){
            // http://mephi-v05.narod.ru/files/infa1.pdf
            //  real a(3, 6, *), b(0:*)
            //  print *, size(a, 2) ! 6
            //var a = A[1];
            // TODO, should be vector as I understand
            return MATMUL(A,X);
        }

        function MatTimesVectorC(A, X){
            //COMPLEX, DIMENSION(:,:),INTENT(IN) :: A
            //COMPLEX, DIMENSION(:),INTENT(IN)  :: X
            //COMPLEX, DIMENSION( SIZE(A,1) ) :: MatTimesVectorC
            // TODO, should be vector as I understand
            return MATMUL(A,X);
        }

        function Tr(Mat){
            //REAL, DIMENSION(:,:),INTENT(IN) :: Mat
            //REAL, DIMENSION( SIZE(Mat,2), SIZE(Mat,1) ) :: Tr
            //Tr=RESHAPE(Mat,(/SIZE(Mat,2), SIZE(Mat,1)/),ORDER=(/2,1/))
            return RESHAPE(Mat,[]); // TODO what to do with ORDER( [2,1] )????
        }

        function Inv(Mat){
            //REAL, DIMENSION(:,:),INTENT(IN) :: Mat
            //REAL, DIMENSION( SIZE(Mat,1), SIZE(Mat,1) ) :: Inv  ! must be square
            //REAL(KIND(0.D0)), DIMENSION( SIZE(Mat,1), 2 * SIZE(Mat,1) ) :: A ! augmented
            var A;
            //REAL(KIND(0.D0)), DIMENSION(:), ALLOCATABLE :: TempRow      ! spare row
            var TempRow;
            //REAL(KIND(0.D0))  :: PivElt, TarElt
            var PivElt, TarElt;
            var N;
            var PivRow, TarRow,I,K;
            N = getArraySize(Mat)[0];
            A = createArray(N, N);
            var i;
            for (i = 0; i < N; i++){
                // ??? what is for
                A[i][N+i] = 1;
            }
            for (PivRow = 0; PivRow < N; PivRow++){
                PivElt = A[PivRow][PivRow];
                K = PivRow;
                for (i = PivRow+1; i < n; i++){
                    if (Math.abs(PivElt) < Math.abs(A[i][PivRow])) {
                        K = i
                        PivElt = A[i][PivRow];
                    }
                }
            }
            if (PivElt == 0){
                console.error("Couldn't find a non-zero pivot: solution rubbish");
                return null;
            } else {
                // IF (K/=PivRow)	"/="  === "!="
                if (K != PivRow){
                    TempRow = new Array(2*n);
                    for (var j = 0; j < 2*n; j++) { }
                }
            }
        }

        // creates array with specific length createArray(2,3) -> [[,,],[,,]]
        function createArray(length){
            var arr = new Array(length || 0), i = length;

            if (arguments.length > 1) {
                var args = Array.prototype.slice.call(arguments, 1);
                while(i--) arr[length-1 - i] = createArray.apply(this, args);
            }

            return arr;
        }
        MatMult.createArray = createArray;
        //exports.createArray = createArray;

        // getting array of dimension sizes from first elements
        function getArraySize(arr, ans){
            ans = ans || [];

            var recToStr = Object.prototype.toString.call( arr );
            if (recToStr === '[object Array]' ) {
                ans.push(arr.length);

                getArraySize(arr[0], ans);
            }
            return ans;
        }
        MatMult.getArraySize = getArraySize;
        //exports.getArraySize = getArraySize;

        // fill array with specified value
        function fillArray(arr, value){
            var sizes = getArraySize(arr);
            var sizesLen = sizes.length;

            function recur(lvl, indexes){
                indexes = indexes || [];

                if (lvl != sizesLen) {
                    for (var i = 0; i < sizes[lvl]; i++){
                        indexes.push(i);
                        recur(lvl + 1, indexes);
                        indexes.pop();
                    }
                } else {
                    var indexesLength = indexes.length;
                    var pntr;
                    for (var j = 0; j < indexesLength; j++) {
                        if (j == 0) pntr = arr[ indexes[j] ];
                        else if (j+1 != indexesLength) pntr = pntr[ indexes[j] ];
                        else pntr[ indexes[j] ] = value;
                    }
                }
            }

            recur(0);
        }
        MatMult.fillArray = fillArray;
        //exports.fillArray = fillArray;

        // created for arrays that was spliced, or that which numeration starts from [1], but not from [0]. Sad :/
        function fillArraySafe(arr, value){
            var sizes = getArraySize(arr);
            var sizesLen = sizes.length;

            function recur(lvl, indexes){
                indexes = indexes || [];

                if (lvl != sizesLen) {
                    for (var i = 0; i < sizes[lvl]; i++){
                        indexes.push(i);
                        recur(lvl + 1, indexes);
                        indexes.pop();
                    }
                } else {
                    var indexesLength = indexes.length;
                    var pntr;
                    for (var j = 0; j < indexesLength; j++) {
                        if (j == 0) pntr = arr[ indexes[j] ];
                        else if (j+1 != indexesLength) pntr = pntr[ indexes[j] ];
                        else pntr[ indexes[j] ] = value;
                    }
                }
            }

            recur(0);
        }
        MatMult.fillArraySafe = fillArraySafe;
        //exports.fillArraySafe = fillArraySafe;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = MatMult;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return MatMult;
            });
        }
        // included directly via <script> tag
        else {
            root.MatMult = MatMult;
        }

    }());

});
