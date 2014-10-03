/**
 * Created by jaric on 19.09.2014.
 */

(function(exports){

    //!
    function oINV() {
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
        var a = A[1];
        return MATMUL(a,X);
    }


    //function importLanguage(language){ return -1; }
    //exports.importLanguage = importLanguage;

})(typeof exports === 'undefined'? this['MatMult']={} : exports);