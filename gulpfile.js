//define components
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	rename = require('gulp-rename'),
	plumber = require("gulp-plumber"),
	notify = require("gulp-notify"),
	browserSync = require('browser-sync'),
	source = require("vinyl-source-stream"),
	buffer = require("vinyl-buffer"),
	sourcemaps = require("gulp-sourcemaps"),

	//template processing
	pug = require('gulp-pug'),

	//css processing
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	cssnano = require('cssnano'),
	stylus = require("gulp-stylus"),
	rupture = require("rupture"),

	// JS processing
	browserify = require("browserify"),
	uglify = require("gulp-uglify"),

	//define directories
	out = 'www/wp-content/themes/_custom',
	dev = 'dev/';

// Browser sync
gulp.task('browserSync', function() {
    browserSync.init({
        proxy: "http://www.sgtoursint.club",
        //open: false
        open: "localhost:3000"
        //browser: "google chrome"
    });
});

//copy media
gulp.task('mediaCp', function() {
	gulp.src('dev/!(_common)**/**/*.{png,jpg,svg}')
		.pipe(rename({dirname:''}))
		.pipe(gulp.dest(out + '/m'));
	gulp.src('dev/_common/**/*.{png,jpg,svg}')
		.pipe(rename({dirname:''}))
		.pipe(gulp.dest(out));
	gulp.src('dev/_common/**/*.{ttf,otf,eot}')
		.pipe(rename({dirname:''}))
		.pipe(gulp.dest(out + '/f'))
		.pipe(browserSync.stream());
});

// Prepare templates
gulp.task('tplPrep', function() {
	gulp
		.src(dev + '*.pug')
		.pipe( plumber({
			errorHandler: notify.onError('PUG error: <%= error.message %>')
		}))
		.pipe(pug({ pretty: true }))
		.pipe(rename( function(path) {
			path.extname = '.php';
			return path;
		}))
		.pipe(gulp.dest(out))
		.pipe(browserSync.stream());
});

// Prepare CSS
gulp.task('cssPrep', function() {
	gulp
		.src(dev + 'style.styl')
		.pipe(plumber({
			errorHandler: notify.onError("CSS module error: <%= error.message %>")
		}))
		.pipe(stylus({
			use: [rupture()]
		}))
		.pipe(postcss([
			autoprefixer(),
			cssnano()
		]))
		.pipe(gulp.dest(out))
		.pipe(browserSync.stream());
});

// Prepare JavaScript app
gulp.task( "jsAppPrep", function() {
	// set up the browserify instance on a task basis
	var b = browserify({
		entries: dev + "app.js",
		debug: true
	});
	// return browserify
	return b.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		// Add transformation tasks to the pipeline here.
		.pipe( uglify() )
		.pipe( plumber( {
			errorHandler: notify.onError( "JS app error: <%= error.message %>" )
		}) )
		.pipe( rename( function(path){
			path.extname = ".min.js";
			return path;
		} ) )
		.pipe( sourcemaps.write("./") )
		.pipe( gulp.dest( out + "/j/" ) )
		.pipe( browserSync.stream() );
});

// Prepare JavaScript bundle
gulp.task( "jsBundlePrep", function() {
	// set up the browserify instance on a task basis
	var b = browserify({
		entries: dev + "bundle.js",
		debug: true
	});
	// return browserify
	return b.bundle()
		.pipe(source("bundle.js"))
		.pipe(plumber( {
			errorHandler: notify.onError( "JS bundle error: <%= error.message %>" )
		}) )
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		// Add transformation tasks to the pipeline here.
		.pipe( uglify() )
		.pipe( rename( function(path){
			path.extname = ".min.js";
			return path;
		}))
		.pipe( sourcemaps.write("./") )
		.pipe( gulp.dest( out + "/j/" ) )
		.pipe( browserSync.stream() );
});

// Watch & process
gulp.task('watch', function() {
	gulp.watch( [ dev + "app.js", dev + "**/*.js" ], ["jsAppPrep"] );
	gulp.watch( dev + "bundle.js", ["jsBundlePrep"] );
	gulp.watch(dev + '**/*.{pug,mod,svg}', ['tplPrep']);
	gulp.watch(dev + '**/*.styl', ['cssPrep']);
});

gulp.task( 'default', [ 'mediaCp', 'tplPrep', 'cssPrep', 'jsBundlePrep', 'jsAppPrep', 'watch', 'browserSync' ] );
