/**
 * Created by jaric on 30.05.2017.
 */

requirejs.config({
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BBLH/lib/node_modules/async/lib/async',
        fs: 'BBLH/lib/node_modules/fsFake/fsFake',
        BBLH: 'BBLH/lib/BBLH',

        THREE: 'three',
        Stats: 'stats',
        dat: 'dat.gui',

        Chart: 'Chart',

        angular: 'angular',
        'bootstrapUI': 'ui-bootstrap-tpls-0.12.0',
        jBBLHApp: 'BBLHApp/jBBLHApp',
        jBBLHControllers: 'BBLHApp/jBBLHControllers'
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
        'jBBLHApp': {
            deps:['angular']
        },
        'jBBLHControllers': {
            deps: ['jBBLHApp', 'THREE', 'Stats', 'dat']
        }
    }
});

requirejs(
    ['BBLH', 'Chart', 'angular', 'jBBLHApp', 'jBBLHControllers', 'bootstrapUI'],
    function(BBLH, Chart, angular, jBBLHApp, jBBLHControllers, bootstrapUI) {
        console.log("bblh view bootstrap is starting", angular, jBBLHApp, jBBLHControllers);

        // init angular application (instead of ng-app directive in view)
        angular.element(document).ready(function() {
            angular.bootstrap(document, [jBBLHApp.name]);
        });
    }
);