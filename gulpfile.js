var gulp          = require('gulp');
var tsconfig      = require('gulp-tsconfig-files');
var exec          = require('child_process').execSync;
var install       = require('gulp-install');
var runSequence   = require('run-sequence');
var del           = require('del');
var uglify        = require('gulp-uglify');
var useref        = require('gulp-useref');
var rename        = require('gulp-rename');
var debug         = require('gulp-debug');
var concat        = require('gulp-concat');
var plumber       = require('gulp-plumber');
var watch         = require('gulp-watch');
var changed       = require('gulp-changed');
var templateCache = require('gulp-angular-templatecache');
var deploy        = require('gulp-gh-pages');
var purify        = require('gulp-purifycss');
var concatCss     = require('gulp-concat-css');
var sass          = require('gulp-sass');

/** Destination of the client/server distribution */
var dest = 'dist/';
var path2csWeb = '../csWeb';

function run(command, cb) {
  console.log('Run command: ' + command);
  try {
    exec(command);
    cb();
  } catch (err) {
    console.log('### Exception encountered on command: ' + command);
    console.log(err.stdout.toString());
    console.log('####################################');
    cb();
    throw err;
  }
}

/** Create a new distribution by copying all required CLIENT files to the dist folder. */
gulp.task('dist_client', function() {
    // Copy client side files
    // Copy app, images, css, data and swagger
    gulp.src('public/app/**/*.js*')
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/app/'));
    gulp.src('public/css/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/css/'));
    gulp.src('public/data/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/data/'));
    gulp.src('public/swagger/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/swagger/'));
    gulp.src('./public/images/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/images/'));
    // Copy index files and favicon
    gulp.src(['./public/*.html', './public/favicon.ico', './public/mode-json.js'])
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/'));
    // Copy bower components of csweb, and others (ignoring any linked csweb files)
    gulp.src('public/bower_components/csweb/dist-bower/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/bower_components/csweb/dist-bower/'));
    gulp.src(['public/bower_components/**/*.*', '!public/bower_components/csweb/**/*.*'])
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'public/bower_components/'));
});

/** Create a new distribution by copying all required SERVER files to the dist folder. */
gulp.task('dist_server', function() {
    // Copy server side files
    gulp.src(['./server.js', './server.js.map', './configuration.json', './LICENSE'])
        .pipe(plumber())
        .pipe(gulp.dest(dest));
    // Copy npm modules of csweb, and others (ignoring any linked csweb files)
    gulp.src(['node_modules/**/*.*', '!node_modules/csweb/**/*.*'])
        .pipe(plumber())
        .pipe(changed(dest + 'node_modules/'))
        .pipe(gulp.dest(dest + 'node_modules/'));
   gulp.src('node_modules/csweb/dist-npm/package.json')
        .pipe(plumber())
        .pipe(gulp.dest(dest + 'node_modules/csweb/'));
    return gulp.src('node_modules/csweb/dist-npm/**/*.*')
        .pipe(plumber())
        .pipe(changed(dest + 'node_modules/csweb/dist-npm/'))
        .pipe(gulp.dest(dest + 'node_modules/csweb/dist-npm/'));
});

/** Create a new distribution by copying all required CLIENT+SERVER files to the dist folder. */
gulp.task('dist', ['dist_client', 'dist_server']);

gulp.task('update_tsconfig', function() {
  return gulp.src(['./**/*.ts',
            '!./node_modules/**/*.ts',
            '!./dist/**/*.*',
            '!./public/bower_components/**/*.d.ts',
        ],
      {base: ''})
    .pipe(tsconfig({
      path:         'tsconfig.json',
      relative_dir: '',
    }));
});

gulp.task('tsc', function(cb) {
    //var cmd = 'tsc -w -p ' + path2csWeb + 'csServerComp & tsc -w -p ' + path2csWeb + 'csComp & tsc -w -p .'
    return run("tsc -w -p .", cb);
});

// Install required npm and bower installs for example folder
gulp.task('install', function(cb) {
  return gulp.src([
      './package.json',       // npm install
      './public/bower.json',  // bower install
    ])
    .pipe(install(cb));
});

/** Initialiaze the project */
gulp.task('init', function(cb) {
  runSequence(
    'update_tsconfig',
    'build-css',
    cb
  );
});

// Gulp task upstream...
// Configure gulp scripts
// Output application name
var appName = 'csWebApp';

gulp.task('clean', function(cb) {
    // NOTE Careful! Removes all generated javascript files and certain folders.
    del([
        'dist',
        'public/**/*.js',
        'public/**/*.js.map'
    ], {
        force: true
    }, cb);
});

/** Deploy it to the github pages */
gulp.task('deploy-githubpages', function() {
    return gulp.src(dest + 'public/**/*')
        .pipe(deploy({
            branch: 'master',
            cacheDir: '.deploy'
        }));
});

gulp.task('build-css', function() {
    return gulp.src('public/css/style.scss')
        // .pipe(sourcemaps.init())
        .pipe(sass())
        // .pipe(cachebust.resources())
        // .pipe(sourcemaps.write('public/css/'))
        .pipe(gulp.dest('public/css'));
});

var watchOptions = {
    interval: 750, // default 100
    debounceDelay: 1000, // default 500
    mode: 'watch'
};

gulp.task('watch', function (cb) {
    gulp.watch('public/css/*', watchOptions, ['build-css']);
    gulp.watch('public/css/styles/*.scss', watchOptions, ['build-css']);
});

// var watchTS = gulp.watch('./**/*.ts');
// watchTS.on('added', function(event) {
//   console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
//   update_tsconfig
// });

// gulp.task('watch', function() {
    // gulp.watch(path2csWeb + 'csServerComp/ServerComponents/**/*.js', ['copy_csServerComp']);
    // gulp.watch(path2csWeb + 'csServerComp/Scripts/**/*.ts', ['copy_csServerComp_scripts']);
    //gulp.watch(path2csWeb + 'csServerComp/ServerComponents/**/*.d.ts', ['built_csServerComp.d.ts']);
    // gulp.watch(path2csWeb + 'csServerComp/ServerComponents/dynamic/ClientConnection.d.ts', ['built_csServerComp.d.ts']);

    // gulp.watch(path2csWeb + 'csComp/includes/**/*.scss', ['sass']);
    // gulp.watch(path2csWeb + 'csComp/js/**/*.js', ['built_csComp']);
    // gulp.watch(path2csWeb + 'csComp/js/**/*.d.ts', ['built_csComp.d.ts']);
    // gulp.watch(path2csWeb + 'csComp/**/*.tpl.html', ['create_templateCache']);
    // gulp.watch(path2csWeb + 'csComp/includes/**/*.css', ['include_css']);
    // gulp.watch(path2csWeb + 'csComp/includes/**/*.js', ['include_js']);
    // gulp.watch(path2csWeb + 'csComp/includes/images/*.*', ['include_images']);
// });

//gulp.task('all', ['create_templateCache', 'copy_csServerComp', 'built_csServerComp.d.ts', 'copy_csServerComp_scripts', 'built_csComp', 'built_csComp.d.ts', 'include_css', 'include_js', 'include_images', 'copy_example_scripts', 'sass']);

gulp.task('deploy', ['dist_client', 'deploy-githubpages']);

gulp.task('default', ['init', 'watch']);
