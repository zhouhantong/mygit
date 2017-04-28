window.commonListItem = [];

function getListItem(id, callback) {
  api.request.get('/global/Select/listItem', {
    obj: {titleid: id}
  }).then(function (response) {
    var msg = response.data
    if (msg.total > 0) {
      msg.list.forEach(function (item) {
        window.commonListItem.push(item.itemtext)
      })
    } else {
      window.commonListItem = ["大品牌", "轻轨房", "学区房"];
    }
    callback();
  })
}