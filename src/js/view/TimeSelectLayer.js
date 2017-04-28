var TimeSelectLayer = View.extend(function () {
  return {
    starttime: null,
    endtime: null,
    viewInit: function (el, context) {
      var self = this
      // var from = el.data('from')
      el.addClass('time-select-layer')
      self.append([{
        classes: 'time-layer',
        components: [{
          classes: 'timebtn selected',
          dataIndex: 1,
          text: '今日'
        }, {
          classes: 'timebtn',
          dataIndex: 2,
          text: '本周'
        }, {
          classes: 'timebtn',
          dataIndex: 3,
          text: '本月'
        }, {
          classes: 'timebtn calendar',
          dataIndex: 4,
        }]
      }, {
        classes: 'select-layer hide',
        components: [{
          classes: 'sdate',
          components: [{
            text: '开始日期'
          }, {
            tag: 'input',
            type: 'date',
            id: 'starttime',
            placeholder: '请选择开始日期',
            value: ''
          }]
        }, {
          classes: 'stxt',
          text: '至'
        }, {
          classes: 'sdate',
          components: [{
            text: '截止日期'
          }, {
            tag: 'input',
            type: 'date',
            id: 'endtime',
            placeholder: '请选择截止日期',
            value: ''
          }]
        }]
      }])

      el.find('.timebtn').singleTap(function (event) {
        el.find('.timebtn').removeClass('selected')
        $(event.target).addClass('selected')
        var tv = $(event.target).data('index') | 0
        el.find('.select-layer').hide()
        var d1 = Fn.getTime(new Date().getTime())
        var d2 = Fn.getTime(new Date().getTime() - ((new Date().getDay() > 0 ? new Date().getDay() : 7) - 1) * 24 * 60 * 60 * 1000)
        var d3 = d1.substr(0, 8) + '01'
        switch (tv) {
          case 1:
            context.reloadData(d1, d1)
            break
          case 2:
            context.reloadData(d2, d1)
            break
          case 3:
            context.reloadData(d3, d1)
            break
          case 4:
            el.find('.select-layer').show()
            var s1 = el.find('#starttime').val()
            var s2 = el.find('#endtime').val()
            if (s1 && s2 && s1 <= s2) {
              context.reloadData(s1, s2)
            }
            break
        }
      })

      el.find('input').on('change', function () {
        self.starttime = el.find('#starttime').val()
        self.endtime = el.find('#endtime').val()
        if (self.starttime && self.endtime) {
          context.reloadData(self.starttime, self.endtime)
        }
      })

      el.find('input').on('blur', function () {
        self.starttime = el.find('#starttime').val()
        self.endtime = el.find('#endtime').val()
        if (self.starttime && self.endtime) {
          if (self.starttime > self.endtime) {
            return v.ui.alert('开始日期不能大于截止日期')
          }
        }
      })

    }

  }
})