//ссылка на сайт с которым работаю
// https://www.youtube.com/watch?v=stFOy0Noahg

// Страницы плагинов:
//   BrowserSync - https: //www.browsersync.io/docs/gulp
//   File Include - https: //www.npmjs.com/package/gulp-fi...
//   Del - https: //www.npmjs.com/package/del
//   Sass - https: //www.npmjs.com/package/gulp-sass
//   Autoprefixer - https: //www.npmjs.com/package/gulp-au...
//   Group CSS media - queries - https: //www.npmjs.com/package/gulp-gr...
//   Rename - https: //www.npmjs.com/package/gulp-re...
//   Clean CSS - https: //www.npmjs.com/package/gulp-cl...
//   Uglify ES - https: //www.npmjs.com/package/gulp-ug...
//   Babel - https: //www.npmjs.com/package/gulp-babel
//   Imagemin - https: //www.npmjs.com/package/gulp-im...
//   WEBP - https: //www.npmjs.com/package/gulp-webp
//   WEBP HTML - https: //www.npmjs.com/package/gulp-we...
//   WEBP CSS - https: //www.npmjs.com/package/gulp-we...
//   Fonter - https: //www.npmjs.com/package/gulp-fo...
//   ttf2woff - https: //www.npmjs.com/package/gulp-tt...
//   ttf2woff2 - https: //www.npmjs.com/package/gulp-tt...
//   SVG Sprite - https: //www.npmjs.com/search?q=gulp-s...

/* 
Решение проблем:
  npm cache clean--force(очистака npm)
  npm i npm - g(установка npm)
 */


// ================================
//подключаемые файлы подчеркиваем _index.html
let project_folder ="public"; //require("path").basename(__dirname); 
let source_folder = "#src";

let fs = require('fs')  //подключение шрифтов к файлам стилей

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css",
    js: project_folder + "/js",
    img: project_folder + "/img",
    fonts: project_folder + "/fonts",
    cssName: "style.css",
    jsName: "script.js",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], //делаем исключение файла _*.html
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/mg/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + project_folder + "/",
  isDev: true
}

// ===========================================
let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  concat = require('gulp-concat'),
  autoprefixer = require("gulp-autoprefixer"),
  group_media = require("gulp-group-css-media-queries"), //собирает все медиа запросы в css файлах и формирует в один и ставит в коннец файла
  clean_css = require("gulp-clean-css"), //чистит и сжимает css
  uglify_js = require("gulp-uglify-es").default, //чистит и сжимает js
  rename = require("gulp-rename"), //переименовывает файл
  imagemin = require("gulp-imagemin"), //сжимает img файл
  webp = require("gulp-webp"), //формат картинки новый
  webphtml = require("gulp-webp-html"), //подключение картинки в html
  webpcss = require("gulp-webp-css"), //подключение картинки в css
  svgSprite = require("gulp-svg-sprite"), //объединяет несколько иконок SVG-каринок в одн файл (делаем отдельную задачу)
  ttf2woff = require("gulp-ttf2woff"), //файлы ttf преобразуются в woff
  ttf2woff2 = require("gulp-ttf2woff2"),
  fonter = require("gulp-fonter"), //преобразует шрифт в otf2 -> ttf (делаем отдельную задачу)
  sourcemaps = require('gulp-sourcemaps'),
  gulpIf = require('gulp-if');
  

  // ===================================
function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false //чтобы не появлялась таб в консоле обновления браузера
  })
} 

// ================================
function html() {
  // gulp.task('html', () => {  
  return src(path.src.html)
    .pipe(fileinclude())  // сборка html файлов
    .pipe(webphtml()) //подключает webp картинку 
    .pipe(dest(path.build.html))

    .pipe(browsersync.stream())
}

// =============================
// обрабатываем файла css
function css() {
  return src(path.src.css)
    .pipe(gulpIf(path.isDev, sourcemaps.init()))
    .pipe(
      scss({
        outputStyle: "expanded"   //чтобы файл не сжимался а можно читать
      })
    )
    .pipe(concat(path.build.cssName))
    .pipe(group_media())  //формирует медиа запросы
    .pipe(
      autoprefixer({
        overrideBrowserlist: ["last 5 versions"], //последние 5 версий браузера
        cascade:true  //стиль написания
      })
  )
    .pipe(gulpIf(path.isDev, sourcemaps.write()))
    .pipe(webpcss()) //подключает webp картинку 
    .pipe(dest(path.build.css)) //вначале выхружаем
    .pipe(clean_css())  //сжимаем
    .pipe(
      rename({
        extname: ".min.css" //переименоваваем
      })    
    )
    .pipe(dest(path.build.css)) //и опять выгружаем

    .pipe(browsersync.stream())
}

// =====================================
function js() {
  return src(path.src.js)
    .pipe(fileinclude())  // сборка js файлов
    .pipe(concat(path.build.jsName))

    .pipe(dest(path.build.js)) //вначале выхружаем
    .pipe(uglify_js()) //сжимаем js
    .pipe(
      rename({
        extname: ".min.js" //переименоваваем
      })
    )
    .pipe(dest(path.build.js)) //и опять выгружаем

    .pipe(browsersync.stream())
}

// ========================================
function images() {
  return src(path.src.img)
    .pipe(
      webp({  //сжимает еще сильнее
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))

    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ remuveVieoBox: false }],
        interlaced: true, //работа с другими форматами
        optimizationLevel: 3 //0 to 7
      })
    )
    .pipe(dest(path.build.img))

    .pipe(browsersync.stream())
}

// =====================================
//отдельная задача для объединение несколько картинок SVG в один файл
gulp.task('svgSprite', function () {
  return gulp.src([source_folder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../icons/icons.svg", //sprite file name
          example: true //создает файл с примерами иконок
        }
      }
    }))
    .pipe(dest(path.build.img))
});

// =======================================
//отдельная задача для преобразования шрифта в otf2 -> ttf
gulp.task('otf2ttf', function () {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']  //получаем формат
    }))
    .pipe(dest(source_folder + '/fonts/')); //выгружаем в эту папку
});

// ======================================
// работа со шрифтами
function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))

}

// =========================================
// ф-ция для подключения шрифтов к файлу стилей
function fontsStyle(params) {
  let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
  if (file_content == '') {
    fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}
//вспомогательная ф-ция для подключения шрифтов к файлу стилей
function cb() {
}

// =================================
//следить за изменениями в файле
function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

// ==========================
// удаляет папку dist - корневая папка
function clean() {
  return del(path.clean);
}

// ====================================
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle); // css  html выполнялись одновременно

let watch = gulp.parallel(build, watchFiles, browserSync);


exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;



