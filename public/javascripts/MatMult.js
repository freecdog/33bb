/**
 * Created by jaric on 19.09.2014.
 */

// TODO should ask
// INTERFACE OPERATOR(.x.)
// // порядок вызова процедур? Полагаю все требуют две переменные на вход, как результат передается от одной к другой
// MODULE PROCEDURE MatTimesMat, MatTimesVector,MatTimesMatC, MatTimesVectorC,VectorTimesVector
// END INTERFACE
//
// // В функции Tr не понятен порядок вызовов или указание ORDER?
// Tr=RESHAPE(Mat,(/SIZE(Mat,2), SIZE(Mat,1)/),ORDER=(/2,1/))
//
// // размерность?
// COMPLEX, DIMENSION(:,:),INTENT(IN) :: A, B
// // размеры таблицы взяты из размера А по столбцам, у B по рядам?
// COMPLEX, DIMENSION( SIZE(A,1), SIZE(B,2) ) :: MatTimesMatC
//
// // что значат слеши?
// Tr=RESHAPE(Mat,(/SIZE(Mat,2), SIZE(Mat,1)/),ORDER=(/2,1/))
//
// // разница между :: и пробелом?
// INTEGER :: N           ! number of equations
// INTEGER PivRow, TarRow,I,K
(function(exports){

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

    /*
    // creates array with specific length createArray(2,3) -> [[,,],[,,]]
    function createArray(length){
        var arr = new Array(length || 0), i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = createArray.apply(this, args);
        }

        return arr;
    }
    exports.createArray = createArray;

    // creates array with specific length given from createArrayFromSizeArray([2,3]) -> [[,,],[,,]]
    function createArrayFromSizeArray(sizeArr){
        // isn't the method slow?
        var recToStr = Object.prototype.toString.call( sizeArr );
        if (recToStr !== '[object Array]' ) return [];

        var arr = new Array(sizeArr[0] || 0), i = sizeArr[0];

        if (sizeArr.length > 1) {
            var args = Array.prototype.slice.call(sizeArr, 1);
            //while(i--) arr[sizeArr[0]-1 - i] = createArrayFromSizeArray.apply(this, args);
            while(i--) arr[sizeArr[0]-1 - i] = createArrayFromSizeArray.call(this, args);
        }

        return arr;
    }
    exports.createArrayFromSizeArray = createArrayFromSizeArray;

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
    exports.getArraySize = getArraySize;

    function TransMatrix(A)       //На входе двумерный массив
    {
        var m = A.length, n = A[0].length, AT = [];
        for (var i = 0; i < n; i++)
        { AT[i] = [];
            for (var j = 0; j < m; j++) AT[i][j] = A[j][i];
        }
        return AT;
    }
    function SumMatrix(A,B)       //На входе двумерные массивы одинаковой размерности
    {
        var m = A.length, n = A[0].length, C = [];
        for (var i = 0; i < m; i++)
        { C[i] = [];
            for (var j = 0; j < n; j++) C[i][j] = A[i][j]+B[i][j];
        }
        return C;
    }
    function multMatrixNumber(a,A)  // a - число, A - матрица (двумерный массив)
    {
        var m = A.length, n = A[0].length, B = [];
        for (var i = 0; i < m; i++)
        { B[i] = [];
            for (var j = 0; j < n; j++) B[i][j] = a*A[i][j];
        }
        return B;
    }
    function MultiplyMatrix(A,B)
    {
        var rowsA = A.length, colsA = A[0].length,
            rowsB = B.length, colsB = B[0].length,
            C = [];
        if (colsA != rowsB) return false;
        for (var i = 0; i < rowsA; i++) C[i] = [];
        for (var k = 0; k < colsB; k++)
        { for (var i = 0; i < rowsA; i++)
        { var t = 0;
            for (var j = 0; j < rowsB; j++) t += A[i][j]*B[j][k];
            C[i][k] = t;
        }
        }
        return C;
    }
    function MatrixPow(n,A)
    {
        if (n == 1) return A;     // Функцию MultiplyMatrix см. выше
        else return MultiplyMatrix( A, MatrixPow(n-1,A) );
    }
    function Determinant(A)   // Используется алгоритм Барейса, сложность O(n^3)
    {
        var N = A.length, B = [], denom = 1, exchanges = 0;
        for (var i = 0; i < N; ++i)
        { B[i] = [];
            for (var j = 0; j < N; ++j) B[i][j] = A[i][j];
        }
        for (var i = 0; i < N-1; ++i)
        { var maxN = i, maxValue = Math.abs(B[i][i]);
            for (var j = i+1; j < N; ++j)
            { var value = Math.abs(B[j][i]);
                if (value > maxValue){ maxN = j; maxValue = value; }
            }
            if (maxN > i)
            { var temp = B[i]; B[i] = B[maxN]; B[maxN] = temp;
                ++exchanges;
            }
            else { if (maxValue == 0) return maxValue; }
            var value1 = B[i][i];
            for (var j = i+1; j < N; ++j)
            { var value2 = B[j][i];
                B[j][i] = 0;
                for (var k = i+1; k < N; ++k) B[j][k] = (B[j][k]*value1-B[i][k]*value2)/denom;
            }
            denom = value1;
        }
        if (exchanges%2) return -B[N-1][N-1];
        else return B[N-1][N-1];
    }
    function MatrixRank(A)
    {
        var m = A.length, n = A[0].length, k = (m < n ? m : n), r = 1, rank = 0;
        while (r <= k)
        { var B = [];
            for (var i = 0; i < r; i++) B[i] = [];
            for (var a = 0; a < m-r+1; a++)
            { for (var b = 0; b < n-r+1; b++)
            { for (var c = 0; c < r; c++)
            { for (var d = 0; d < r; d++) B[c][d] = A[a+c][b+d]; }
                if (Determinant(B) != 0) rank = r;
            }       // Функцию Determinant см. выше
            }
            r++;
        }
        return rank;
    }
    function AdjugateMatrix(A)   // A - двумерный квадратный массив
    {
        var N = A.length, adjA = [];
        for (var i = 0; i < N; i++)
        { adjA[i] = [];
            for (var j = 0; j < N; j++)
            { var B = [], sign = ((i+j)%2==0) ? 1 : -1;
                for (var m = 0; m < j; m++)
                { B[m] = [];
                    for (var n = 0; n < i; n++)   B[m][n] = A[m][n];
                    for (var n = i+1; n < N; n++) B[m][n-1] = A[m][n];
                }
                for (var m = j+1; m < N; m++)
                { B[m-1] = [];
                    for (var n = 0; n < i; n++)   B[m-1][n] = A[m][n];
                    for (var n = i+1; n < N; n++) B[m-1][n-1] = A[m][n];
                }
                adjA[i][j] = sign*Determinant(B);   // Функцию Determinant см. выше
            }
        }
        return adjA;
    }
    function InverseMatrix(A)   // A - двумерный квадратный массив
    {
        var det = Determinant(A);                // Функцию Determinant см. выше
        if (det == 0) return false;
        var N = A.length, A = AdjugateMatrix(A); // Функцию AdjugateMatrix см. выше
        for (var i = 0; i < N; i++)
        { for (var j = 0; j < N; j++) A[i][j] /= det; }
        return A;
    }

    // expand Number class, so we can operate
    Number.prototype.toComplex = function(b) {
        return new Complex(this, b || 0);
    };
    Number.prototype.toImaginary = function() {
        return new Complex(0, this);
    };

    function Complex(a, b) {
        this.a = a;
        this.b = b;
    }

    Complex.prototype = {
        toComplex: function() { return this; },
        toString: function () {
            //return this.a + " + " + this.b + "i";
            return this.a + (this.b >= 0 ? "+" : "") + this.b + "i";
        },
        real: function() { return this.a; },
        imaginary: function() { return this.b; },
        negative: function() {
            return new Complex(-this.a, -this.b);
        },
        conjugate: function() {
            return new Complex(this.a, -this.b);
        },
        plus: function(other) {
            other = other.toComplex();
            return new Complex(this.a + other.a, this.b + other.b);
        },
        add: function(other) {
            other = other.toComplex();
            this.a += other.a;
            this.b += other.b;
        },
        minus: function(other) {
            other = other.toComplex();
            return this.plus(other.negative());
        },
        subtract: function(other) {
            other = other.toComplex();
            this.a -= other.a;
            this.b -= other.b;
        },
        times: function(other) {
            other = other.toComplex();
            return new Complex(this.a * other.a - this.b * other.b, this.a * other.b + this.b * other.a);
        },
        multiply: function(other) {
            other = other.toComplex();
            this.a = this.a * other.a - this.b * other.b;
            this.b = this.a * other.b + this.b * other.a;
        },
        modulus: function() {
            return Math.sqrt(this.mod2());
        },
        mod2: function() {
            return this.a * this.a + this.b * this.b;
        },
        angle: function() {
            return Math.atan2(this.b, this.a);
        },
        equals: function(other, acc) {
            acc = acc || Math.pow(10, -4);
            var d = this.minus(other.toComplex());
            return d.mod2() < acc * acc;
        },
        divide: function(other) {
            other = other.toComplex();
            return new Complex((this.a * other.a + this.b * other.b) / other.mod2(), (this.b * other.a - this.a * other.b) / other.mod2());
        },
        exp: function(){
            // e^(x + iy) = e^x * e^(iy) = e^x(cos(y) + isin(y)
            var scale = Math.exp(this.a);
            var r = scale * Math.cos(this.b);
            var i = scale * Math.sin(this.b);
            var c = new Complex(r, i);
            return c;
        },
        pow: function(pow, k){
            if(arguments.length == 1) k = 0;

             //this^(pow) = (|this|exp(i*this.angle()))^pow
             //= |this|^pow * exp(i*this.angle()*pow)

            var r = Math.pow(this.modulus(), pow);
            var th = (this.angle() + 2 * k * Math.PI) * pow;
            return new Complex(r * Math.cos(th), r * Math.sin(th));
        },
        log: function(k){
            if(arguments.length == 0) k = 0;
            // log(|this|*exp(this.angle())) = log(|this|) + i*(this.angle() + 2PI*k)
            return new Complex(Math.log(this.modulus()), this.angle() + 2 * Math.PI * k);
        }
    };

    exports.Complex = Complex;
    */

    //function importLanguage(language){ return -1; }
    //exports.importLanguage = importLanguage;

})(typeof exports === 'undefined'? this['MatMult']={} : exports);

/* links

1) fortran to c++ converter FABLE, http://cci.lbl.gov/fable/
2) JavaScript complex function graphing tool, http://www.fortwain.com/complex.html (especially http://www.fortwain.com/complex.js)
3) УНИВЕРСАЛЬНЫЙ КАЛЬКУЛЯТОР КОМПЛЕКСНЫХ ЧИСЕЛ ОНЛАЙН, http://abak.pozitiv-r.ru/math/68-kulyator-complex
4) A Look at Fortran 90, http://www.lahey.com/lookat90.htm
5) Современный Фортран (2000 г., МИФИ), http://mephi-v05.narod.ru/files/infa1.pdf
6) Операции над матрицами, http://mathhelpplanet.com/static.php?p=javascript-operatsii-nad-matritsami
7 !!! ) Advanced mathematics toolkit for JavaScript and Node.js, https://github.com/sjkaliski/numbers.js (numbers.complex, matrix operations)

*/
