var ErrorPage = View.extend({

	statics: {
		popup: function() {
			$('.errorpage').remove();

			$(document.body).append(
				<div class="errorpage">
					<img src="images/open-shop-banner.jpg"/>
					<div class="txt">您还没有权限！</div>
				</div>
			)
		},
		close: function() {
			$('.errorpage').remove();
		}
	}

})