Page.ready(($, query) => {
	return {
		init: function() {
			var from = query.from ? query.from : '';
			var callback = function(data) {
				var json = data.response;
				count = count + json.count;
				if ((count >= json.total_count) || json.count == 0) {
					$('.more').hide();
				} else {
					$('.more').show();
				}
				if (json.total_count > 0) {
					if (!$('.common-nodata-item').hasClass('hide')) {
						$('.common-nodata-item').addClass('hide');
					}
				} else {
					$('.common-nodata-item').removeClass('hide');
				}
				$.createElements(json.businesses.map(function(v, k) {
					var scores = ((query.category == '美食') ? ('<label>口味</label><span>' + v.product_score + '</span>') : '') +
						'<label>环境</label><span>' + v.decoration_score + '</span>' +
						'<label>服务</label><span>' + v.service_score + '</span>';
					var descp = '';
					if (v.regions) descp += v.regions.pop() + ' ';
					if (v.categories) descp += v.categories.pop() + ' ';
					descp = descp.replace(/ $/, '').replace(' ', ' | ') + ' ' + (v.distance <= 0 ? '未知' : v.distance + '米');
					var buttons = [];
					if (v.has_coupon) buttons.push({
						classes: 'btn coupon',
						onTap: function(e) {
							Page.open(v.coupon_url);
						}
					});
					if (v.has_online_reservation) buttons.push({
						classes: 'btn order',
						onTap: function(e) {
							Page.open(v.online_reservation_url);
						}
					});
					var name = v.name;
					if (v.branch_name) name += '(' + v.branch_name + ')';
					name = '<span>' + name + '</span>';
					if (v.has_deal) name += '<span class="tuan"></span>';
					return {
						classes: 'item',
						onTap: function(e) {
							Page.open(v.business_url);
						},
						components: [{
							classes: 'icon',
							tag: 'img',
							src: v.s_photo_url
						}, {
							classes: 'middle',
							components: [{
								html: name
							}, {
								tag: 'img',
								src: v.rating_s_img_url
							}, {
								html: scores,
								classes: 'scores'
							}, {
								text: descp,
								classes: 'desc'
							}, {
								components: buttons
							}]
						}, {
							classes: 'last',
							components: [{
									classes: (query.category == '美食') ? '' : 'hide',
									html: v.avg_price <= 0 ? '未知' : '¥' + v.avg_price + '<label>/人</label>'
								},
								// {text: v.distance <= 0? '未知' : v.distance+'米'},
							]
						}, ],
					};
				}), '.pcontent');

				(function() {
					var p = $('#local-detail-page');
					p.find('#page-intro').vendor('transform', 'translate(0,1px)');
				}).defer(200);
			};
			$('#ptitle').text(query.category);
			$('select').on('change', function() {
				page = 1;
				query['page'] = page;
				query[this.name] = this.value;
				if (this.name == 'sort') {
					$('.sort-value').text(this.options[this.selectedIndex].innerHTML);
				} else {
					$('.radius-value').text(this.options[this.selectedIndex].innerHTML);
				}
				$('.pcontent').html('');
				v.get(API, query).then(callback);
			});
			var page = 1,
				count = 0;
			// var BASE = 'http://www.doore.me', API = BASE + '/cgis/dianping.cgi';
			var BASE = 'http://dooreme.ahasou.com',
				API = BASE + '/cgis/dianping.cgi';
			v.get(API + location.search).then(callback);
			// $('.more').on('click', function(){
			//     query['page'] = page + 1;
			//     $.get(API, query, callback);
			// });
			$('.more').singleTap(function() {
				page++;
				query['page'] = page;
				v.get(API, query).then(callback);
			});
		}
	}
})