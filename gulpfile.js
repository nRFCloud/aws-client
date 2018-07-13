const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');

gulp.task('compiledev', () => {
	return gulp.src('./src/index.ts')
		.pipe(gulpWebpack(require('./webpack.dev.js'), webpack))
		.pipe(gulp.dest('dist/'));
});

gulp.task('builddev', ['compiledev'], () => {

	return gulp.src(['./dist/aws-wrapper.js', './src/aws-iot-sdk-browser-bundle.min.js'])
		.pipe(concat('aws-wrapper.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('compileprod', () => {
	return gulp.src('./src/index.ts')
		.pipe(gulpWebpack(require('./webpack.prod.js'), webpack))
		.pipe(gulp.dest('dist/'));
});

gulp.task('buildprod', ['compileprod'], () => {
	return gulp.src(['./dist/aws-wrapper.min.js', './src/aws-iot-sdk-browser-bundle.min.js'])
		.pipe(concat('aws-wrapper.min.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('default', ['buildprod'], () => {
	return gulp.src('./dist/aws-wrapper.min.js')
		.pipe(uglify())
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy', () => {
	return gulp.src('./dist/aws-wrapper.min.js')
		.pipe(gulp.dest('../nrfcloud-web-frontend/dist'));
});

gulp.task('copydev', () => {
	return gulp.src('./dist/aws-wrapper.js')
		.pipe(gulp.dest('../nrfcloud-web-frontend/dist'));
});
