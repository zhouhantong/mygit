var Concurrency = Object.extend(function() {

  function next(c) {
    return function() {
      --c.n
      if (c.q.length > 0) {
        run(c)
      }
    }
  }

  function run(c) {
    if (c.n < c.max) {
      ++c.n
      var data = c.q.shift()
      data[0](data[1], next(c))
    }
  }

  return {
    q: [],
    n: 0,
    init: function(maxThreadNum) {
      this.max = maxThreadNum
    },
    add: function(fn, data) {
      this.q.push([fn, data])
      run(this)
    }
  }

})