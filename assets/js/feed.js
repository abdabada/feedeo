(function($) {
	'use strict';

	/**
	 * Builds the necessary markup for a single field html element
	 * @param  {Array} adData  The object that has the feed data to present
	 * @return {String}        The full html markup for the feed
	 */
	function buildSingleFeed(adData) {
		var profile_img;
	    var profile = adData.user.name;
	   	var profile_link = adData.user.link;
		var sizes = adData.user.pictures;				
		var title = adData.name;
	    var title_link = adData.link;
	    var description = adData.description;
	    var plays = adData.stats.plays;
	    var likes = adData.metadata.connections.likes.total;
	    var comments = adData.metadata.connections.comments.total; 

   		/* Making sure that the user has a picture */
	    if (adData.user.pictures) {
		    $.each(adData.user.pictures.sizes, function(property, value) {
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
	 * @param  {Array} adsDataArr
	 * @return {String}
	 */
	function buildAdsFeedMarkup(adsDataArr) {
		var markup = '';
	    $.each(adsDataArr, function(i, adData) {
	    	markup += buildSingleFeed(adData);
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

		/* Grabs the data from the json file */
		$.getJSON('./feed.json', function(data) {
			var adsData = data.data;

			/* 10-per-page button handler */
			$('#10').click(function(e) {
				if (!$(this).hasClass('active')) {
					$(this).addClass('active');
				}

				$('#50').removeClass('active');
				$('#25').removeClass('active');

				$('#btn_prev').attr('disabled', true);
				$('#btn_next').attr('disabled', false);

				segmentation_helper = parseInt($(this).attr('id'));

				paginationWatcher.segmentation = segmentation_helper - 1;
				paginationWatcher.currentPage = 0;

				var feeds = adsData.slice(paginationWatcher.segmentation * paginationWatcher.currentPage, paginationWatcher.segmentation);

				if (likesFilter.isLikesFilterChecked) {
					feeds = feeds.filter(function(singleFeed) {
						return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
					});
				}

				scene.render(buildAdsFeedMarkup(feeds));
			});

			/* 25-per-page button handler */
			$('#25').click(function(e) {
				if (!$(this).hasClass('active')) {
					$(this).addClass('active');
				}

				$('#50').removeClass('active');
				$('#10').removeClass('active');

				$('#btn_prev').attr('disabled', true);
				$('#btn_next').attr('disabled', false);

				segmentation_helper = parseInt($(this).attr('id'));

				paginationWatcher.segmentation = segmentation_helper - 1;
				paginationWatcher.currentPage = 0;

				var feeds = adsData.slice(paginationWatcher.segmentation * paginationWatcher.currentPage, paginationWatcher.segmentation);

				if (likesFilter.isLikesFilterChecked) {
					feeds = feeds.filter(function(singleFeed) {
						return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
					});
				}

				scene.render(buildAdsFeedMarkup(feeds));

			});

			/* 50-per-page button handler */
			$('#50').click(function(e) {
				if (!$(this).hasClass('active')) {
					$(this).addClass('active');
				}

				$('#10').removeClass('active');
				$('#25').removeClass('active');

				$('#btn_prev').attr('disabled', true);
				$('#btn_next').attr('disabled', true);

				segmentation_helper = parseInt($(this).attr('id'));

				paginationWatcher.segmentation = segmentation_helper - 1;
				paginationWatcher.currentPage = 0;

				var feeds = adsData.slice(paginationWatcher.segmentation * paginationWatcher.currentPage, paginationWatcher.segmentation);
				
				if (likesFilter.isLikesFilterChecked) {
					feeds = feeds.filter(function(singleFeed) {
						return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
					});
				}

				scene.render(buildAdsFeedMarkup(feeds));
			});

			/* Handles the 'next' button click */
			$('#btn_next').click(function(e) {
				$('#btn_prev').attr('disabled', false);

				paginationWatcher.currentPage = paginationWatcher.segmentation + 1 ;
				paginationWatcher.segmentation = paginationWatcher.segmentation + segmentation_helper;

				var feeds = adsData.slice((paginationWatcher.currentPage), paginationWatcher.segmentation);

				if (likesFilter.isLikesFilterChecked) {
					feeds = feeds.filter(function(singleFeed) {
						return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
					});
				}

				scene.render(buildAdsFeedMarkup(feeds));

				if(paginationWatcher.segmentation == (adsData.length - 1)){
					$(this).attr('disabled', true);
					return true;
				}
				
			});

			/* Handles the 'previous' button click */
			$('#btn_prev').click(function(e) {	
				$('#btn_next').attr('disabled', false);

				paginationWatcher.segmentation = paginationWatcher.currentPage - 1;
				paginationWatcher.currentPage = (paginationWatcher.segmentation + 1) - segmentation_helper;
			
				var feeds = adsData.slice((paginationWatcher.currentPage), paginationWatcher.segmentation);

				if (likesFilter.isLikesFilterChecked) {
					feeds = feeds.filter(function(singleFeed) {
						return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
					});
				}

				scene.render(buildAdsFeedMarkup(feeds));

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
							adsData.slice((paginationWatcher.currentPage), paginationWatcher.segmentation).filter(function(singleFeed) {
								return singleFeed.user.metadata.connections.likes.total >= likesFilter.likesLimit;
							})
						)
					);
		    	} else {
		    		scene.render(
						buildAdsFeedMarkup(
							adsData.slice((paginationWatcher.currentPage), paginationWatcher.segmentation)
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

				var feeds = adsData.slice(
					(paginationWatcher.currentPage * paginationWatcher.itemsPerPage), 
					(paginationWatcher.itemsPerPage * paginationWatcher.currentPage) + paginationWatcher.itemsPerPage
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
									    	<h3 class="panel-title">Nothing found :/</h3> 
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