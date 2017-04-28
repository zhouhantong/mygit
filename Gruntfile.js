var fs = require("fs")
var path = require('path')

var REVISION = (Date.now() % (36 * 36 * 36 * 36 - 1)).toString(36)
var uglifyCompressOptions = {
  global_defs: {
    DEBUG: false,
    DEVMODE: true
  },
  dead_code: true
};
var uglifyCompressOptionsProc = {
  global_defs: {
    DEBUG: false,
    DEVMODE: false
  },
  dead_code: true
};
var jsFiles = [{
  src: [
    "<%= dir.work %>app.js",
    "<%= dir.work %>js/**/*.js"
  ],
  dest: "<%= dir.build %>main.js"
}, {
  src: ["<%= dir.work %>lib/util/*.js"],
  dest: "<%= dir.build %>lib/util.js"
}, {
  src: [
    "<%= dir.work %>lib/core/vee.js",
    "<%= dir.work %>lib/core/md5.js",
    "<%= dir.work %>lib/core/spin.js",
    "<%= dir.work %>lib/core/animation.js",
    "<%= dir.work %>lib/core/Loading.js",
    "<%= dir.work %>lib/core/viewport.js",
    "<%= dir.work %>lib/core/core.js",
    "<%= dir.work %>lib/core/aha.js"
  ],
  dest: "<%= dir.build %>lib/core.js"
}, {
  expand: true,
  cwd: "<%= dir.work %>",
  src: ["**/*.js", "!app.js", "!js/**/*.js", "!lib/{util,core}/*.js"],
  dest: "<%= dir.build %>"
}]

var excludes = [
  'imgcms',
  'forum-img',
  'assets',
  'pages',
  'resources',
  'build',
  'admin',
  'cloud',
  'cs',
  'qc',
  'dh',
  'cms',
  'qqcms',
  'dm',
  'dmweb',
  'wxc',
  'wxcweb',
  'wxcweb1',
  'wxcweb2',
  'hfz',
  'sqdm',
  'sywxc',
  'lmh',
  'hryx',
  'i33sc',
  'setting'
];

module.exports = function(grunt) {
  var pkg = grunt.file.readJSON("package.json")
  var dir = {
    src: 'src/',
    work: 'work/build/',
    build: 'build/'
  }

  function filterByMTime(src) {
    var file = src.replace(new RegExp('^' + dir.src), '')
    var dest = dir.work + file
    if (/\.styl$/i.test(dest)) {
      dest = dest.replace(/\.styl$/i, '.css')
    }
    try {
      var destStat = fs.statSync(dest)
    } catch (e) {
      return true
    }
    var srcStat = fs.statSync(src)
    var srcMTime = srcStat.mtime.getTime()
    var destMTime = destStat.mtime.getTime()
    return srcMTime > destMTime
  }

  function toWorkDir(options) {
    var result = {
      filter: filterByMTime,
      cwd: dir.src,
      dest: dir.work,
      expand: true
    }
    for (var property in options)
      if (options.hasOwnProperty(property)) {
        result[property] = options[property]
      }
    return result
  }

  grunt.initConfig({
    pkg: pkg,
    dir: dir,
    meta: {
      file: 'main',
      banner: '/* <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy/m/d") %>\n' + '   <%= pkg.homepage %>\n' + '   Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> */\n'
    },

    clean: {
      work: dir.work,
      build: dir.build
    },

    babel: {
      options: pkg.babel,
      build: toWorkDir({
        src: ["**/*.js", "!{setting,main}.js", "!**/*.debug.js"]
      })
    },

    uglify: {
      options: {
        compress: uglifyCompressOptions,
        mangle: true,
        preserveComments: false,
        report: "min",
        banner: "<%= meta.banner %>"
      },
      build: {
        files: jsFiles
      },
      proc: {
        options: {
          compress: uglifyCompressOptionsProc
        },
        files: jsFiles
      }
    },

    stylus: {
      build: {
        files: [
          toWorkDir({
            src: "css/main.styl",
            ext: ".css"
          }),
          toWorkDir({
            src: ["**/*.styl", "!css/*"],
            ext: ".css"
          })
        ]
      }
    },

    parseCssImg: {
      build: {
        cwd: dir.work,
        src: "**/*.css",
        dest: dir.work,
        expand: true
      }
    },

    vhtml: {
      build: {
        cwd: dir.src,
        src: "**/*.html",
        dest: dir.build,
        expand: true
      },
      proc: {
        cwd: dir.src,
        src: "**/*.html",
        dest: dir.build,
        expand: true
      }
    },

    imagemin: {
      build: toWorkDir({
        src: "**/*.{jpg,jpeg,png}"
      })
    },

    copy: {
      build: {
        files: [{
          cwd: dir.src,
          src: '**/*.{json,gif,mp3,eot,svg,ttf,woff,ico}',
          dest: dir.build,
          expand: true
        }, {
          cwd: dir.work,
          src: '**/*.{jpg,jpeg,png,css}',
          dest: dir.build,
          expand: true
        }]
      }
    },

    compress: {
      options: {
        mode: "gzip",
        level: 9,
        pretty: true
      },
      build: {
        cwd: dir.build,
        src: '**/*.{js,css,html}',
        dest: dir.build,
        rename: function(dest, src) {
          return dest + src + '.gz';
        },
        expand: true
      }
    },

    push: {
      options: {
        args: ['-ltDvz'],
        exclude: excludes,
        recursive: true,
        compareMode: 'checksum',
        allowVersions: ["3.0"]
      },
      build: {
        options: {
          dest: '/var/www/weixin-demo/hfz_test/htdocs/${target}/',
          host: 'weixin@180.153.108.150',
          src: 'build/${target}/'
        }
      },
      proc: {
        options: {
          dest: '/var/www/weixin/goodhfz_${versions}/htdocs/${target}/',
          host: 'goodhfz@119.84.8.87',
          src: 'build/${target}/'
        }
      }
    },

    rsync: {
      options: {
        args: ['-ltDvz'],
        exclude: excludes,
        recursive: true,
        compareMode: 'checksum',
        src: 'build/'
      },
      dev: {
        options: {
          dest: '/var/www/weixin-demo/hfz_test/htdocs/',
          host: 'weixin@180.153.108.150'
            // syncDestIgnoreExcl: true
        }
      },
      proc: {
        options: {
          dest: '/var/www/weixin/goodhfz/htdocs/',
          host: 'goodhfz@119.84.8.87'
            // syncDestIgnoreExcl: true
        }
      },
      pcdev: {
        options: {
          dest: '/var/www/weixin-demo/hfz_test/htdocs/setting/',
          host: 'weixin@180.153.108.150',
          src: 'setting/'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerMultiTask('vhtml', 'parse html files', function(name) {
    var fs = require('fs');
    var UglifyJS = require('uglify-js');
    var minify = require('html-minifier').minify
    var config = grunt.config.get();
    var compressOptions = this.target == 'proc' ? uglifyCompressOptionsProc :
      uglifyCompressOptions;
    var minifyOptions = {
      minifyCSS: true,
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      // removeRedundantAttributes: true,
      removeOptionalTags: true
    }
    var unlinkFiles = [];

    this.files.forEach(function(file) {
      var src = file.src[0];
      var content = minify(fs.readFileSync(src, 'utf8'), minifyOptions);
      var liburl = '/lib/'

      function parseProperties(str) {
        var properties = {}
        str.replace(/([\w\-]*)=['"]?([^'"\s]*)['"]?/gi, function(matched, key, value) {
          properties[key] = value
        });
        return properties;
      }

      // SEO
      // content = content.replace(/<title>/,
      //                             '<meta name="apple-itunes-app" content="app-id=580446011">'
      //                           + '<meta name="keywords" content="电影摇摇,电影票,电影,在线选座,电子券,团购,移动应用,LBS,地理位置">'
      //                           + '<meta name="description" content="电影摇摇是一款基于地理位置的移动生活应用，摇一摇，推荐一部近在咫尺又符合个人喜好的电影，实时查看影院放映排期，支持在线选座、电子券、团购等。更多功能，等待您的发现…">'
      //                           + '<title>'
      //                           );

      content = content.replace(/<script>([\s\S]*?)<\/script>/ig, function(all, js) {
        var code;
        try {
          code = UglifyJS.minify(js, {
            fromString: true,
            mangle: true,
            preserveComments: false,
            compress: compressOptions
          }).code;
        } catch (e) {
          grunt.fail.fatal(e.message + ' in file ' + file.dest +
            ' [' + e.line + ':' + e.col + '] ');
        }
        return '<script>' + code + '</script>';
      });

      content = content.replace(/<script\s[^>]*?src=[^>]*?><\/script>/ig, function(matched) {
        if (/dev=['"]?yes['"]?/i.test(matched)) { // remove dev script
          return '';
        } else if (/src=['"]?(.*?)([\w\-]+)\.js/i.test(matched)) {
          var path = RegExp.$1
          var name = RegExp.$2
          if (path && /[\.\/]*lib\/(.*)/.test(path)) {
            if (/^util\//.test(RegExp.$1)) {
              return ''
            }
            return matched.replace(path + name + '.js', liburl + RegExp.$1 + name + '.js?_=' + REVISION)
          } else if ((!path || /^[\.\/]+$/.test(path)) && (name == 'main' || name == 'init')) {
            var str = matched.substring(8, matched.length - 10);
            var data = {};
            var requires = [];
            str.replace(/([\w\-]*)=['"]?([^'"\s]*)['"]?/gi, function(matched, key, value) {
              data[key] = value.replace(/\s/g, '');
            })
            if (!data['data-base-url'] && data.src) {
              data['data-base-url'] = data.src.replace(/[\w\-]+\.js$/i, '')
            }

            if (data['data-require']) {
              requires = data['data-require'].replace(/[\,\;]/g, '\n').split('\n').map(function(module) {
                function buildUrl(path) {
                  var EXP_URL = /^(?:\.{0,2}|(?:\w+:)?\/)\//i;
                  var EXP_EXT = /(?:\.js|\.css|\.jpg|\.jpeg|\.png|\.gif)$/i;

                  if (!EXP_URL.test(path)) {
                    path = (data['data-base-url'] || '') + path;
                  }

                  if (!EXP_EXT.test(path)) {
                    path += '.js';
                  }

                  var pos = path.lastIndexOf('/');
                  var name
                  if (pos < 0) {
                    name = path
                    path = ''
                  } else {
                    name = path.substring(pos + 1)
                    path = path.substring(0, pos + 1)
                  }

                  if (path && /[\.\/]*lib\/(.*)/.test(path)) {
                    path = RegExp.$1
                    if (/^util\//.test(path)) {
                      // name = 'tools.js'
                      return ''
                    }
                    return liburl + path + name
                  }

                  return path + name;
                }
                return buildUrl(module.trim())
              })
            }

            return '<script src=' + (data['data-base-url'] || '') + 'setting.js?_=' + REVISION + '></script>' +
              '<script src=' + liburl + 'core.js?_=' + REVISION +
              ' data-base-url=' + (data['data-base-url'] || './') +
              ' data-require=""></script>' +
              '<script src=' + liburl + 'util.js?_=' + REVISION + '></script>' +
              requires.map(function(path) {
                return path ? '<script src=' + path + '?_=' + REVISION + '></script>' : ''
              }).join('') +
              '<script src=' + (data['data-base-url'] || '') +
              'main.js?_=' + REVISION + '></script>';
          } else {
            console.log(src)
            console.log(' ', matched)
            console.log('   ', path, name)
          }
        } else {
          console.log(src)
          console.log(' ', matched)
        }
        return matched;
      })

      var controller = src.replace(/\.html$/i, '.js');
      content = content.replace(/<article\s(.*?)>/gi, function(matched) {
        if (matched.indexOf('vpage') >= 0) {
          var properties = parseProperties(RegExp.$1)
          if (properties.controller) {
            controller = src.replace(/[\w\-]+\.html/i, properties.controller + '.js');
          }
        } else {
          console.log(src)
          console.log(' ', matched)
        }
        return matched;
      })

      content = content.replace(/<link[^>]*?['"\/=]*\.css[^>]*?>/ig, function(matched) {
        var m = new RegExp('(href=)(.*?)( )(rel)', ["ig"]).exec(matched);
        var css = m[2].replace(/"|'/g, "");
        return matched.replace(css, css.split("?")[0] + '?_=' + REVISION);
      });

      content = content.replace(/(\.jpg|\.jpeg|\.png|\.gif)[^\?]/ig, function(matched){
        return matched.replace(/\.jpg|\.jpeg|\.png|\.gif/ig, function(suffix){
          return suffix + "?_=" + REVISION;
        })
      })

      controller = controller.replace(new RegExp('^' + dir.src), dir.build)
      if (fs.existsSync(controller)) {
        var jsContent = fs.readFileSync(controller, 'utf8');
        content += '<script>' + jsContent + '</script>';
        unlinkFiles.push(controller);
      }

      function mkdir(dir) {
        if (fs.existsSync(dir)) {
          return
        }
        var parentDir = path.dirname(dir)
        if (!fs.existsSync(parentDir)) {
          mkdir(parentDir)
        }
        fs.mkdirSync(dir)
      }
      mkdir(path.dirname(file.dest))

      fs.writeFileSync(file.dest, content);

      // grunt.log.writeln("File", file.dest, "processed.");
    });

    unlinkFiles.forEach(function(file) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
      }
    })

    grunt.log.writeln("Processed", this.files.length, "html files")
  });

  grunt.registerMultiTask('push', 'push files', function() {
    var rsync = require("rsyncwrapper");
    var done = this.async();
    var options = this.options();
    var args = this.args;
    var target = this.target;

    if (!options.onStdout) {
      options.onStdout = function(data) {
        grunt.log.write(data.toString("utf8"));
      };
    }

    if (args.length == 0 || !options.allowVersions.some(function(item) {
        return item === args[0] || target === "build";
      })) {
      grunt.log.error();
      grunt.log.writeln("!!!!!!版本不存在，不允许发布");
      done(false);
      return;
    }

    switch (args.length) {
      case 1:
        options.dest = options.dest.replace("${versions}", this.args[0]).replace("${target}", "");
        options.src = options.src.replace("${target}", "");
        break;
      case 2:
        options.dest = options.dest.replace("${versions}", this.args[0]).replace("${target}", this.args[1]);
        options.src = options.src.replace("${target}", this.args[1]);
        break;
      default:
        return;
    }
    grunt.log.writelns("rsyncing " + options.src + " >>> " + options.dest);

    try {
      rsync(options, function(error, stdout, stderr, cmd) {
        grunt.log.writeln("Shell command was: " + cmd);
        if (error) {
          grunt.log.error();
          grunt.log.writeln(error.toString().red);
          done(false);
        } else {
          grunt.log.ok();
          done(true);
        }
      });
    } catch (error) {
      grunt.log.writeln("\n" + error.toString().red);
      done(false);
    }
  });

  grunt.registerMultiTask('parseCssImg', 'parse css img', function() {
    this.files.forEach(function(file){
      var src = file.src[0];
      var content = fs.readFileSync(src, 'utf8');
      content = content.replace(/(\.jpg|\.jpeg|\.png|\.gif)[^\?]/ig, function(matched){
        return matched.replace(/\.jpg|\.jpeg|\.png|\.gif/ig, function(suffix){
          return suffix + "?_=" + REVISION;
        })
      })
      fs.writeFileSync(file.dest, content);
    })
  });

  grunt.registerTask('build:dev', [
    'clean:build',
    'babel:build',
    'stylus:build',
    'parseCssImg:build',
    'imagemin:build',
    'uglify:build',
    'vhtml:build',
    'copy:build',
    'compress:build'
  ])

  grunt.registerTask('build:proc', [
    'clean:build',
    'babel:build',
    'stylus:build',
    'parseCssImg:build',
    'imagemin:build',
    'uglify:proc',
    'vhtml:proc',
    'copy:build',
    'compress:build'
  ])

  grunt.registerTask('deploy:dev', ['rsync:dev']);
  grunt.registerTask('deploy:proc', ['rsync:proc']);
  grunt.registerTask('deploy:pc', ['rsync:pcdev']);

  grunt.registerTask('dev', ['build:dev']);
  grunt.registerTask('proc', ['build:proc']);
  grunt.registerTask('default', ['build:dev']);

  grunt.registerTask('release', [
    'build:proc',
    'push:proc:3.0'
  ]);
};