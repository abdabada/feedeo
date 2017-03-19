(function($) {
	'use strict';

	/**
	 * Builds the necessary markup for a single field html element
	 * @param  {Array} feedData  The object that has the feed data to present
	 * @return {String}        The full html markup for the feed
	 */
	function buildSingleFeed(feedData) {
		var profile_img;
	    var profile = feedData.user.name;
	   	var profile_link = feedData.user.link;
		var sizes = feedData.user.pictures;				
		var title = feedData.name;
	    var title_link = feedData.link;
	    var description = feedData.description;
	    var plays = feedData.stats.plays;
	    var likes = feedData.metadata.connections.likes.total;
	    var comments = feedData.metadata.connections.comments.total; 

   		/* Making sure that the user has a picture */
	    if (feedData.user.pictures) {
		    $.each(feedData.user.pictures.sizes, function(property, value) {
		    	if (property == 1) profile_img = value.link;
		    });
	    } else profile_img = "default.png";

		return `<ul class="list-group" style="margin-bottom: -1px">
			    <li class="list-group-item">
			   
				    <div class="row">
						<div class="col-md-2">
							<a class="pull-left" href="`+profile_link+`">
								<img class="img-rounded" src="`+profile_img+`">
							</a>
						</div>
						<div class="col-md-10">
							<div class="media-body" style="display: initial;">
								<div class="profile"><a  class="profile-anchor" href="`+profile_link+`">`+profile+`</a></div>
								<div class="video-title"><a href="`+title_link+`">`+title+`</a></div> 
								<div class="content hideContent">
								<div class="video-description">`+description+`</div>
							</div>
							<div class="show-more">
						        <button class="show-text">Show more</button>
						    </div>
							<div class="video-actions row">
								<div class="play col-md-4">
									<i class="glyphicon glyphicon-play glyphicon-fw"></i>&nbsp;`+  plays+`
								</div>
								<div class="heart col-md-4">
									<i class="glyphicon glyphicon-heart-empty glyphicon-fw"></i>&nbsp;` + likes+`
								</div>
								<div class="comment col-md-4">
									<i class="glyphicon glyphicon-comment glyphicon-fw"></i>&nbsp;` + comments+`
								</div>								    		
							</div>
						</div>
					</div>
			    </li>					    
		 </ul>`;
	}

	/**
	 * The array holding feed elements
	 * @param  {Array} feedDataArray
	 * @return {String}
	 */
	function buildAdsFeedMarkup(feedDataArray) {
		var markup = '';
	    $.each(feedDataArray, function(i, feedData) {
	    	markup += buildSingleFeed(feedData);
	    });
	    return markup;
	}


	$(document).ready(function(){	

		/**
		 * An object to gather panel responbosilities
		 * @property {String} element holds in the selector of this element
		 * @property {Function} render Appends 
		 * @type {Object}
		 */
		var scene = {
			element: '.panel',
			render: function(markUp, search) {
				$(this.element).html('');
				$(this.element).html(markUp);
			}
		};

		/**
		 * A utility object to keep track
		 * of pagination data
		 * @type {Object}
		 */
		var paginationWatcher = {
			segmentation: 0,
			currentPage: 0
		};

		var segmentation_helper = 0;

		/**
		 * A utility object to keep track
		 * of likes filtering data
		 * @type {Object}
		 */
		var likesFilter = {
			isLikesFilterChecked: false,
			likesLimit: 10
		};

		/* Markup builder for the feeds-per-page buttons */
		function feedRunderer(c, s, feedsData){
			var feeds = feedsData.slice(c, s);

				if (likesFilter.isLikesFilterChecked) {
					feeds = feeds.filter(function(singleFeed) {
						return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
					});
				}

				scene.render(buildAdsFeedMarkup(feeds));
		}

		/* feeds-per-page handler */
		function feedsDataSlicer(self_, feedsData){
			segmentation_helper = parseInt(self_.attr('id'));
			if (!self_.hasClass('active')) {
					self_.addClass('active');
			}

			switch(segmentation_helper) {
			    case 10:
			        $('#50').removeClass('active');
					$('#25').removeClass('active');
					$('#btn_prev').attr('disabled', true);
					$('#btn_next').attr('disabled', false);
			        break;
			    case 25:
			        $('#50').removeClass('active');
					$('#10').removeClass('active');
					$('#btn_prev').attr('disabled', true);
					$('#btn_next').attr('disabled', false);
			        break;
			    default:
			    	$('#10').removeClass('active');
					$('#25').removeClass('active');
			        $('#btn_prev').attr('disabled', true);
					$('#btn_next').attr('disabled', true);
			}			

			paginationWatcher.segmentation = segmentation_helper - 1;
			paginationWatcher.currentPage = 0;

			feedRunderer(paginationWatcher.segmentation * paginationWatcher.currentPage, paginationWatcher.segmentation, feedsData);

		}


		/* Grabs the data from the json file */
		$.getJSON('./feed.json', function(data) {
			var feedsData = data.data;

			/* 10-per-page button handler */
			$('#10').click(function(e) {
				var self_ = $(this);
				feedsDataSlicer(self_, feedsData);
			});

			/* 25-per-page button handler */
			$('#25').click(function(e) {
				var self_ = $(this);
				test(self_, feedsData);				
			});

			/* 50-per-page button handler */
			$('#50').click(function(e) {
				var self_ = $(this);
				test(self_, feedsData);
			});

			/* Handles the 'next' button click */
			$('#btn_next').click(function(e) {
				$('#btn_prev').attr('disabled', false);

				paginationWatcher.currentPage = paginationWatcher.segmentation + 1 ;
				paginationWatcher.segmentation = paginationWatcher.segmentation + segmentation_helper;

				feedRunderer(paginationWatcher.currentPage , paginationWatcher.segmentation, feedsData);
				
				if(paginationWatcher.segmentation == (feedsData.length - 1)){
					$(this).attr('disabled', true);
					return true;
				}
				
			});

			/* Handles the 'previous' button click */
			$('#btn_prev').click(function(e) {	
				$('#btn_next').attr('disabled', false);

				paginationWatcher.segmentation = paginationWatcher.currentPage - 1;
				paginationWatcher.currentPage = (paginationWatcher.segmentation + 1) - segmentation_helper;
			
				feedRunderer(paginationWatcher.currentPage , paginationWatcher.segmentation, feedsData);

				if (paginationWatcher.currentPage == 0) {
					$(this).attr('disabled', true);
					return true;
				}
			});

			/* Enables or disables filtering by likes */
			$('input[name="likes"]').change(function(){
				likesFilter.isLikesFilterChecked = $(this).prop('checked');
		    	if ($(this).prop('checked')) {
					scene.render(
						buildAdsFeedMarkup(
							feedsData.slice(paginationWatcher.currentPage, paginationWatcher.segmentation).filter(function(singleFeed) {
								return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
							})
						)
					);
		    	} else {
		    		scene.render(
						buildAdsFeedMarkup(
							feedsData.slice(paginationWatcher.currentPage, paginationWatcher.segmentation)
						)
					);
		    	}
		    });

			/* Listesns to the clicking on show-more and shows more */
			$(document).on("click", ".show-more button", function() {
				var $this = $(this); 
				var $content = $this.parent().prev("div.content");
				var linkText = $this.text().toUpperCase();  

				if (linkText === "SHOW MORE") {
					linkText = "Show less";
					$content.switchClass("hideContent", "showContent", 400);
				} else {
					linkText = "Show more";
					$content.switchClass("showContent", "hideContent", 400);
				};

				$this.text(linkText);
			});

			/* Handles the searching through feed */
			$('#search').keyup(function() {
				var query = $('#search').val();
				query = query.replace(/ +(?= )/g,'');

				var feeds = feedsData.slice(
					(paginationWatcher.currentPage * paginationWatcher.segmentation), 
					(paginationWatcher.segmentation * paginationWatcher.currentPage) + paginationWatcher.segmentation
				);

				var $this = $(this); 

				setTimeout(function(){

					if (query != '') {
						if (likesFilter.isLikesFilterChecked) {
							feeds = feeds.filter(function(singleFeed) {
								return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
							});
						}

						feeds = feeds.filter(function(singleFeed) {
							return singleFeed.description.toLowerCase().indexOf(query.toLowerCase()) > -1;
						});

						if (feeds.length > 0) {
							scene.render(buildAdsFeedMarkup(feeds));
						} else {
							$('.panel').fadeOut(200, function(){
				        		var content = `<div class="panel-heading">
									    	<h3 class="panel-title">Nothing found...</h3> 
									    </div>`;

								$('.panel').html(content).fadeIn(10);	
							});
						}
					} else {
						scene.render(buildAdsFeedMarkup(feeds));
					}

				}, 200);	

		    });

			/**
			 * To land on a page where pagination is 10 by default
			 * @return {[type]} [description]
			 */
			(function() {
				$('#10').trigger('click');
			})();
		});
	});
}(jQuery));
