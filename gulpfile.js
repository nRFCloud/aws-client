const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('builddev', () => {
	return gulp.src(['./dist/aws-wrapper.js', './src/aws-iot-sdk-browser-bundle.min.js'])
		.pipe(concat('aws-wrapper.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('default', () => {
	return gulp.src(['./dist/aws-wrapper.min.js', './src/aws-iot-sdk-browser-bundle.min.js'])
		.pipe(concat('aws-wrapper.min.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy', () => {
	return gulp.src('./dist/aws-wrapper.js')
		.pipe(gulp.dest('../nrfcloud-web-frontend/dist'));
});
