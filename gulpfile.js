const gulp = require("gulp");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const minifyCss = require("gulp-minify-css");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const postcss = require("gulp-postcss");
const mqpacker = require("css-mqpacker");
const child = require("child_process");
const gutil = require("gulp-util");
const uglify = require("gulp-uglify");
const notify = require("gulp-notify");
const browserSync = require("browser-sync").create();

const config = {
  siteRoot: "./_site",
  publicDir: "./assets",
  sassFilter: "./_css/**/*.?(s)css",
  jsFilter: "./_js/**/*.js"
};

gulp.task("css", () => {
  gulp
    .src(config.sassFilter)
    .pipe(
      sass({
        style: "compressed"
      }).on(
        "error",
        notify.onError(function(error) {
          return "Error: " + error.message;
        })
      )
    )
    .pipe(autoprefixer({ cascade: false, browsers: ["> 0.25%"] }))
    .pipe(concat("all.css"))
    .pipe(gulp.dest(config.publicDir));
});

gulp.task("js", () => {
  gulp
    .src(config.jsFilter)
    .pipe(uglify())
    .pipe(gulp.dest(config.publicDir));
});

gulp.task("jekyll", () => {
  const jekyll = child.spawn("bundle", [
    "exec",
    "jekyll",
    "build",
    "--watch",
    "--drafts"
  ]);

  const jekyllLogger = buffer => {
    buffer
      .toString()
      .split(/\n/)
      .forEach(message => gutil.log("Jekyll: " + message));
  };

  jekyll.stdout.on("data", jekyllLogger);
  jekyll.stderr.on("data", jekyllLogger);
});

gulp.task("default", ["css", "js", "jekyll", "serve"]);

gulp.task("serve", () => {
  browserSync.init({
    files: [config.siteRoot + "/**"],
    port: 4000,
    server: {
      baseDir: config.siteRoot
    }
  });

  gulp.watch(config.sassFilter, ["css"]);
  gulp.watch(config.jsFilter, ["js"]);
});
