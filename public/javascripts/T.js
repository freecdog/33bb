/**
 * Created by jaric on 01.12.2014.
 */

/*
requirejs.config({
    //baseUrl: 'javascripts',
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        FUNC2: 'FUNC2/FUNC2',
        MatMult: 'MatMult/MatMult'
    }
});

requirejs([
    'numbers',
    'FUNC2'
], function(numbers, FUNC2){
    console.warn(numbers, FUNC2);

    console.log(0, FUNC2.ATN(1).toFixed(3));
    console.log(1, numbers.basic.sum([1,2,3]));
    console.log(2, numbers.matrix.multiply([[2,3]], [[4],[5]]));
    console.log(3, numbers.matrix.multiply([[2],[3]], [[4,5]]));
    var Complex = numbers.complex;
    console.log(4, new Complex(-5, -6));
    console.log(5, numbers.matrix.scalarSafe([[1,2],[3,4]], 3));
});
*/

requirejs.config({
    //baseUrl: 'javascripts',
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BB/lib/node_modules/async/lib/async',
        fs: 'BB/lib/node_modules/fsFake/fsFake',
        BB: 'BB/lib/BB'
        //BB: 'BB/lib/BB'
        //async: 'async/lib/async'
    }
    //shim: {
        //'BB': {
        //    exports: 'BB'
        //},
        //'numbers': {
        //    exports: 'numbers'
        //}
    //}
});

/*
requirejs([
    'BB'
], function(BB){
    var BBup = BB.BBup;
    BBup.run();
});
*/

requirejs(['BB', 'BB/BBup'], function(BB, BBup){
    //var BBup = BB.BBup;
    BBup.run();
});