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
    'async',
    'MatMult',
    'Func2',
    'BBstart',
    'BBcount',
    'BBup'
]);