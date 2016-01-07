var gulp = require('gulp'),
	rimraf = require('rimraf'),
	usemin = require('gulp-usemin'),
	uglify = require('gulp-uglify');
	minifyHtml = require('gulp-minify-html'),
	minifyCss = require('gulp-minify-css'),
	imagemin = require('gulp-imagemin'),
	refresh = require('gulp-livereload'),
	gutil = require('gulp-util'),
	jshint = require('gulp-jshint'),
	express = require('express'),
	bodyParser = require('body-parser'),
	lr = require('tiny-lr'),
	open = require('open'),
	server = lr();

var src = {
	folder:'./src',
	js:'src/assets/js/**',
	css:'src/assets/css/**',
	img:'src/assets/img/**',
	fonts:'bower_components/font-awesome/fonts/**',
	index:'src/index.html'
};

var dest = {
	folder:'./dist',
	js:'dist/assets/js',
	css:'dist/assets/css',
	img:'dist/assets/img',
	fonts:'dist/assets/fonts',
	data:'dist/assets/data'
};

var tmp = './tmp';

// start a dev server
gulp.task('server', function() {
	var app = express();
	app.use(express.static(dest.folder));
	/*app.use('/bower_components', express.static(__dirname + '/bower_components'));
	app.use('/tmp', express.static(__dirname + '/tmp'));*/
	app.use(bodyParser());
	app.listen(8080, function() {
		gutil.log('Listening on 8080');
	});
});

gulp.task('open', function() {
	open('http://localhost:8080/');
});

// minify css, js, html
gulp.task('usemin', function(){
	gulp.src(src.index)
		.pipe(usemin({
			css: [minifyCss(), 'concat'],
			html: [minifyHtml({empty: true})],
			vendor: [uglify()],
			app: [uglify()]
		}))
		.pipe(gulp.dest(dest.folder))
		.pipe(refresh(server));
});

// minify images
gulp.task('img', function() {
	gulp.src(src.img)
		.pipe(imagemin())
		.pipe(gulp.dest(dest.img))
		.pipe(refresh(server));
});

// copy fonts
gulp.task('fonts', function() {
	gulp.src(src.fonts)
		.pipe(gulp.dest(dest.fonts))
		.pipe(refresh(server));
});

// copy CNAME file
gulp.task('CNAME', function() {
	gulp.src('CNAME')
		.pipe(gulp.dest(dest.folder));
});

// livereload server
gulp.task('livereload', function(){
	server.listen(35729, function(err){
		if(err) return gutil.log(gutil.colors.bold.red(err));
	});
});

// jshint
gulp.task('lint', function() {
	gulp.src(src.js)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// default task
gulp.task('default', function() {
	rimraf(dest.folder, function() {
		//rimraf(tmp, function() {
			gulp.run('img', 'usemin', 'fonts', 'CNAME', 'server', 'livereload', 'open');
		//});
	});

	gulp.watch([src.js, src.css, src.index], function() {
		gulp.run('usemin');
	});
	gulp.watch(src.img, function() {
		gulp.run('img');
	});
});