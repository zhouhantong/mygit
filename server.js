#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var http = require('http')
var querystring = require('querystring')
var stylus = require('stylus')
var babel = require("babel-core")
//var DEV_HOST = 'localhost'
var DEV_HOST = 'web.dev.goodhfz.com'

var listen = process.argv[2] | 0 || 8000

var options = JSON.parse(fs.readFileSync('package.json'))

http.createServer(function (req, res) {

    var timestamp = Date.now()
    var contentLength = 0
    var reqData
    var log = ''
    var fn = {
        log: function () {
            log += ' ' + Array.prototype.slice.call(arguments).join(' ')
        },
        error: function (err, statusCode, body) {
            res.writeHead(statusCode, {'Content-Type': 'text/html'})
            res.write('<h1>' + statusCode + ' ' + (body || '') + '</h1>')
            res.write('<pre>' + err + '</pre>')
            fn.end(function () {
                err && console.log('\033[35m' + (err.message || err) + '\033[0m')
            })
        },
        notFound: function () {
            fn.error(null, 404, 'Not found')
        },
        end: function (callback) {
            res.end(function () {
                var msg = time() + ' ' + req.method + ' ' + uri.pathname + log +
                    ' - ' + res.statusCode +
                    ' \033[36m' + kb(contentLength) +
                    ' \033[37m' + ms(Date.now() - timestamp) +
                    '\033[0m'
                if (res.statusCode >= 400) {
                    msg = '\033[31m' + msg + '\033[0m'
                } else if (res.statusCode >= 300) {
                    msg = '\033[33m' + msg + '\033[0m'
                }
                console.log(msg)
                if (reqData && (reqData = querystring.parse(reqData))) {
                    for (var property in reqData) if (reqData.hasOwnProperty && reqData.hasOwnProperty(property)) {
                        console.log('\033[37m' + property + '\033[0m\033[32m',
                            reqData[property],
                            '\033[0m')
                    }
                }
                callback && callback()
            })
        },

        readFile: function (file) {
            fs.exists(file, function (exists) {
                if (!exists) {
                    return fn.notFound()
                }
                fs.stat(file, function (err, stats) {
                    if (err) {
                        return fn.error(err, 500, 'Internal Server Error')
                    }

                    if (stats.isDirectory()) {
                        return fn.error(null, 403, 'Forbidden')
                    }

                    if (stats.isFile()) {
                        var headers = {
                            'Content-Length': contentLength = stats.size
                        }
                        var ext = path.extname(file).replace(/^\.*/, '')
                        if (mime[ext]) {
                            headers['Content-Type'] = mime[ext]
                        } else {
                            headers['Content-Type'] = mime['*']
                        }
                        res.writeHead(200, headers);

                        var rs = fs.createReadStream(file)
                        rs.on('error', function (err) {
                            fn.error(err, 500, 'Internal Server Error')
                        })
                        rs.on('end', function () {
                            fn.end()
                        })
                        rs.pipe(res)
                    } else {
                        fn.notFound()
                    }
                })
            })
        },

        get: function (uri, file) {
            function Handler() {
                this.matched = false
                this.when = function (repexp, callback) {
                    if (!this.matched && repexp.test(uri.pathname)) {
                        this.matched = true
                        callback(uri, file)
                    }
                    return this
                }
                this.end = function () {
                    if (!this.matched) {
                        this.matched = true
                        fn.readFile(file)
                    }
                }
            }

            return new Handler()
        },

        redirect: function (options) {
            var cacheable = /\.(jpg|jpeg|png|gif)$/i.test(options.path);
            cacheable = false;
            if (cacheable) {
                var cachefile = 'work/cache/' + options.hostname.replace(/^http:\/\//i, '') + options.path;
                try {
                    if (fs.statSync(cachefile).isFile()) {
                        fn.readFile(cachefile);
                        fn.log('[cached]');
                        return
                    }
                } catch (e) {
                }
            }

            var submitData = options.body
            if (options.body) {
                delete options.body
            }
            var clientReq = http.request(options, function (clientRes) {
                if (cacheable) {
                    var buffer = new Buffer(1024 * 1024 * 2);
                }
                res.writeHead(200, clientRes.headers)
                clientRes.on('data', function (chunk) {
                    if (cacheable) {
                        chunk.copy(buffer, contentLength);
                    }
                    contentLength += chunk.length
                    res.write(chunk)
                })
                clientRes.on('end', function () {
                    if (cacheable) {
                        if (mkdirs(path.dirname(cachefile))) {
                            var content = new Buffer(contentLength);
                            buffer.copy(content, 0, 0, contentLength);
                            fs.writeFileSync(cachefile, content);
                            content = null;
                        }
                        buffer = null;
                    }
                    fn.end()
                })
            })
            clientReq.on('error', function (err) {
                fn.error(err, 500, 'Internal Server Error')
            })
            if (submitData) {
                clientReq.write(submitData)
            }
            clientReq.end()
        }
    }

    var uri = req.url
    if (uri == '/' || uri == '') {
        uri = '/index.html'
    }
    uri = require('url').parse(uri)

    // fn.log(req.method, 'http://' + req.headers.host + uri.pathname)

    switch (req.method) {
        case 'GET':
            reqData = uri.query
            fn.get(uri, path.normalize('./src/' + uri.pathname))
                .when(/^\/(?:forumpic|qc-webapp)\//i, function (uri, file) {
                    fn.redirect({
                        hostname: DEV_HOST,
                        method: req.method,
                        path: uri.path
                    })
                })
                .when(/\.js$/i, function (uri, file) {
                    fs.exists(file, function (exists) {
                        if (!exists) {
                            return fn.notFound()
                        }
                        fs.stat(file, function (err, stats) {
                            if (err) {
                                return fn.error(err, 500, 'Internal Server Error')
                            }
                            var content = loadFromCache(file, stats.mtime)
                            if (content) {
                                fn.log('[cached]')
                                res.writeHead(200, {
                                    'Content-Type': 'application/javascript',
                                    'Content-Length': contentLength = content.length
                                });
                                res.write(content)
                                fn.end()
                                return
                            }
                            fs.readFile(file, function (err, data) {
                                if (err) {
                                    return fn.error(err, 500, 'Internal Server Error')
                                }
                                var code
                                if (uri.pathname !== '/lib/core/vee.js') {
                                    options.babel.sourceMaps = 'inline'
                                    options.babel.sourceFileName = path.basename(file) + ' [sm]'
                                    var result = babel.transform(data, options.babel)
                                    code = new Buffer(result.code)
                                } else {
                                    code = fs.readFileSync(file)
                                }
                                res.writeHead(200, {
                                    'Content-Type': 'application/javascript',
                                    'Content-Length': contentLength = code.length
                                });
                                res.write(code)
                                fn.end()
                                saveToCache(file, code, stats.mtime)
                            })
                        })
                    })
                })
                .when(/\.css$/i, function (uri, file) {
                    var stylusFile = file.replace(/\.css$/i, '.styl')
                    fs.exists(stylusFile, function (exists) {
                        if (!exists) {
                            return fn.readFile(file)
                        }
                        fn.log('[stylus]')
                        fs.stat(stylusFile, function (err, stats) {
                            if (err) {
                                return fn.error(err, 500, 'Internal Server Error')
                            }
                            var content = loadFromCache(file, stats.mtime)
                            if (content) {
                                fn.log('[cached]')
                                res.writeHead(200, {
                                    'Content-Type': 'text/css',
                                    'Content-Length': contentLength = content.length
                                });
                                res.write(content)
                                fn.end()
                                return
                            }
                            fs.readFile(stylusFile, function (err, data) {
                                if (err) {
                                    return fn.error(err, 500, 'Internal Server Error')
                                }
                                stylus('' + data)
                                    .set('filename', stylusFile)
                                    .set('sourcemap', {
                                        inline: true,
                                        basePath: path.dirname(stylusFile)
                                    })
                                    .include(__dirname + path.sep + path.dirname(stylusFile))
                                    .render(function (err, css) {
                                        if (err) {
                                            return fn.error(err, 500, 'Internal Server Error')
                                        }
                                        css = new Buffer(css)
                                        res.writeHead(200, {
                                            'Content-Type': 'text/css',
                                            'Content-Length': contentLength = css.length
                                        });
                                        res.write(css)
                                        fn.end()
                                        saveToCache(file, css, stats.mtime)
                                    })
                            })
                        })
                    })
                })
                .end()
            break
        case 'POST':
        case 'PUT':
        case 'DELETE':
            var data = '';
            req.on('data', function (chunk) {
                data += chunk;
            })
            req.on('end', function () {
                fn.redirect({
                    hostname: DEV_HOST,
                    method: req.method,
                    path: uri.path,
                    body: reqData = data,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': data.length
                    }
                })
            })
            break
        default:
            fn.error(null, 405, 'Method Not Allowed')
    }

}).listen(listen, function () {
    console.log('http server listen', listen);
});

function time() {
    var date = new Date()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    var ms = date.getMilliseconds()
    if (ms < 10) {
        ms = '00' + ms
    } else if (ms < 100) {
        ms = '0' + ms
    }
    return '' + hour + ':' +
        (minute < 10 ? '0' + minute : minute) + ':' +
        (second < 10 ? '0' + second : second) + '.' + ms
}

function kb(length) {
    if (length >= 1024) {
        return Math.round(length / 102.4) / 10 + 'KB'
    } else {
        return length + 'B'
    }
}

function ms(time) {
    if (time >= 1000) {
        return Math.round(time / 10) / 100 + 's'
    } else {
        return time + 'ms'
    }
}

function mkdirs(dir) {
    try {
        var stat = fs.statSync(dir);
        return stat.isDirectory()
    } catch (e) {
        if (mkdirs(path.dirname(dir))) {
            fs.mkdirSync(dir);
            return true
        }
    }
}

var _caches = {}
function saveToCache(file, content, time) {
    _caches[file] = {content: content, time: time}
}
function loadFromCache(file, time) {
    if (file in _caches) {
        var item = _caches[file]
        if (item.time >= time) {
            return item.content
        }
    }
    return false
}

var mime = {
    '*': 'application/octet-stream',
    'html': 'text/html',
    'htm': 'text/html',
    'shtml': 'text/html',
    'css': 'text/css',
    'xml': 'text/xml',
    'gif': 'image/gif',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript',
    'atom': 'application/atom+xml',
    'rss': 'application/rss+xml',
    'mml': 'text/mathml',
    'txt': 'text/plain',
    'jad': 'text/vnd.sun.j2me.app-descriptor',
    'wml': 'text/vnd.wap.wml',
    'htc': 'text/x-component',
    'png': 'image/png',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'wbmp': 'image/vnd.wap.wbmp',
    'ico': 'image/x-icon',
    'jng': 'image/x-jng',
    'bmp': 'image/x-ms-bmp',
    'svg': 'image/svg+xml',
    'svgz': 'image/svg+xml',
    'webp': 'image/webp',
    'woff': 'application/font-woff',
    'jar': 'application/java-archive',
    'war': 'application/java-archive',
    'ear': 'application/java-archive',
    'json': 'application/json',
    'hqx': 'application/mac-binhex40',
    'doc': 'application/msword',
    'pdf': 'application/pdf',
    'ps': 'application/postscript',
    'eps': 'application/postscript',
    'ai': 'application/postscript',
    'rtf': 'application/rtf',
    'm3u8': 'application/vnd.apple.mpegurl',
    'xls': 'application/vnd.ms-excel',
    'eot': 'application/vnd.ms-fontobject',
    'ppt': 'application/vnd.ms-powerpoint',
    'wmlc': 'application/vnd.wap.wmlc',
    'kml': 'application/vnd.google-earth.kml+xml',
    'kmz': 'application/vnd.google-earth.kmz',
    '7z': 'application/x-7z-compressed',
    'cco': 'application/x-cocoa',
    'jardiff': 'application/x-java-archive-diff',
    'jnlp': 'application/x-java-jnlp-file',
    'run': 'application/x-makeself',
    'pl': 'application/x-perl',
    'pm': 'application/x-perl',
    'prc': 'application/x-pilot',
    'pdb': 'application/x-pilot',
    'rar': 'application/x-rar-compressed',
    'rpm': 'application/x-redhat-package-manager',
    'sea': 'application/x-sea',
    'swf': 'application/x-shockwave-flash',
    'sit': 'application/x-stuffit',
    'tcl': 'application/x-tcl',
    'tk': 'application/x-tcl',
    'der': 'application/x-x509-ca-cert',
    'pem': 'application/x-x509-ca-cert',
    'crt': 'application/x-x509-ca-cert',
    'xpi': 'application/x-xpinstall',
    'xhtml': 'application/xhtml+xml',
    'xspf': 'application/xspf+xml',
    'zip': 'application/zip',
    'mid': 'audio/midi',
    'midi': 'audio/midi',
    'kar': 'audio/midi',
    'mp3': 'audio/mpeg',
    'ogg': 'audio/ogg',
    'm4a': 'audio/x-m4a',
    'ra': 'audio/x-realaudio',
    '3gpp': 'video/3gpp',
    '3gp': 'video/3gpp',
    'ts': 'video/mp2t',
    'mp4': 'video/mp4',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    'flv': 'video/x-flv',
    'm4v': 'video/x-m4v',
    'mng': 'video/x-mng',
    'asx': 'video/x-ms-asf',
    'asf': 'video/x-ms-asf',
    'wmv': 'video/x-ms-wmv',
    'avi': 'video/x-msvideo'
}