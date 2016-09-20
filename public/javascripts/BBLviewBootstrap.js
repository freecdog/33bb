/**
 * Created by jaric on 10.08.2016.
 */

requirejs.config({
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BBL/lib/node_modules/async/lib/async',
        fs: 'BBL/lib/node_modules/fsFake/fsFake',
        BBL: 'BBL/lib/BBL',

        THREE: 'three',
        Stats: 'stats',
        dat: 'dat.gui',

        Chart: 'Chart',

        angular: 'angular',
        'bootstrapUI': 'ui-bootstrap-tpls-0.12.0',
        jBBLApp: 'BBLApp/jBBLApp',
        jBBLControllers: 'BBLApp/jBBLControllers'
    },
    shim: {
        'THREE': {
            exports: 'THREE'
        },
        'dat': {
            exports: 'dat'
        },
        'Stats': {
            exports: 'Stats'
        },
        'Chart': {
            exports: 'Chart'
        },
        'angular': {
            exports: 'angular'
        },
        'bootstrapUI': {
            deps:['angular']
        },
        'jBBLApp': {
            deps:['angular']
        },
        'jBBLControllers': {
            deps: ['jBBLApp', 'THREE', 'Stats', 'dat']
        }
    }
});

requirejs(
    ['BBL', 'Chart', 'angular', 'jBBLApp', 'jBBLControllers', 'bootstrapUI'],
    function(BBL, Chart, angular, jBBLApp, jBBLControllers, bootstrapUI) {
        console.log("bbl view bootstrap is starting", angular, jBBLApp, jBBLControllers);

        // init angular application (instead of ng-app directive in view)
        angular.element(document).ready(function() {
            angular.bootstrap(document, [jBBLApp.name]);
        });
    }
);