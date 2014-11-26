/**
 * Created by jaric on 26.11.2014.
 */

requirejs.config({
    baseUrl: 'javascripts',
    paths: {
        numbers: 'numbers/src/numbers',
        async: 'async/lib/async'
    }
});

requirejs([
    'numbers',
    'async'
    //'FUNC2',
    //'MatMult'
], function(asd,dsa){
    console.log(asd, dsa);
});

/*
requirejs([
    'numbers',
    'FUNC2',
    'async',
    'MatMult',
    'BBstart',
    'BBcount',
    'BBup'
]);*/