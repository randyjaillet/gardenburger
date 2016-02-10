/*	RJ 3.28.2014
**
**	GardenBurger is a gracefully degrading, mobile-
**	first navigation jQuery plugin.
**	It turns undordered lists into navigation
**	with dynamic dropdowns and flyouts. These
**	menus are all keyboard accessible.
**	GardenBurger is mobile friendly and will
**	transmogrify in mobile mode (at < 800px
**	by default) into a set of stacked,
**	indented lists that are hidden beneath a
**	"garden burger" icon.
**	Buttons are injected in mobile mode for
**	expanding and collapsing menus, as the
**	"hover" event can't be relied upon in
**	touch screen environments.
**
**	GardenBurger relies heavily on advanced CSS
**	techniques such as transitions that are
**	chained using delays. In IE8, these
**	animated effects won't show, but
**	GardenBurger will still function. In <= IE7,
**	forgetaboutit.
**
*/

$.fn.gardenburger = function(options){  

    var defaultOptions = {
    	navJSClass 			: "yesJS", // Class that gets applied to the nav's parent for styling based on presence of JS.
    	injectedTogglerHTML : "<button class=\"submenuTogglers\"><i></i></button>" // The HTML that is injected to function as submenu toggler buttons in mobile mode. Uses buttons by default instead of As to lessen the likelihood of styling conflicts.
    };
    var settings = $.extend({}, defaultOptions, options);
 
    return this.each(function() {

    	var $context = $(this);

		$context


				// Label the context for styling based
				// on presence of JS

				.addClass(settings.navJSClass)


				// Since the focus event doesn't bubble
				// up to the LI tags, use event delegation
				// to apply a class for the CSS to target
				// instead. Also, trigger a custom event
				// for the JS side of things.

    			.on("focus", "li", function(e){
					$(this).addClass("focus");
					$(this).trigger("bubblyfocus");
				})
    			.on("blur", "li", function(e){
					$(this).removeClass("focus");
				})


				// Since CSS doesn't have a parent
				// selector, apply a class to LIs
				// that contain submenus.

				.find("li:has(ul)")
						.addClass("hasChildMenu")
						.end() // Back to $context


				.children("ul:not(.mobileNav)")
						.addClass("hidden")
						.end() // Back to $context


				// Apply click event handling to the mobile
				// menu button to handle visibility of
				// navigation.

				.on("click", ".menuToggle a", function(e){
					e.preventDefault();
					$context.children("ul").not(".mobileNav")
							.toggleClass("hidden");
				})


				// Inject togglers for hiding/showing sub
				// menus in mobile mode.

				.find("li.hasChildMenu")
						.each(function(ind,obj){
				    		$(obj).children("a").after(settings.injectedTogglerHTML);
				    	})
				    	.end() // Back to $context


				// Apply click event handling to the injected
				// togglers to handle hiding/showing of child
				// menus in mobile mode.

				.on("click", ".submenuTogglers", function(e){
					e.preventDefault();
					$(this).closest("li")
							.toggleClass("open");
				})
		;

		$(document).ready(function(){

			window.setTimeout(function(){calculateMenuPositioning();}, 250);
			

			$(window).on("resize", function(){
				calculateMenuPositioning();
			});

		});

		function calculateMenuPositioning() {

			$context
					.find("ul")
							.removeClass("flip")
							.end()
					.find(".menuPositioningWrapper > ul")
							.unwrap()
							.end()
					.find("ul:not(.mobileNav):first > li > ul, ul:not(.mobileNav):first > li > .menuPositioningWrapper > ul")
							.each(function(){
								var neededOffsetRight,
									siblingLinkOffsetLeft
								;

								if ($(this).closest(".menuPositioningWrapper").length) {
									siblingLinkOffsetLeft = $(this).closest(".menuPositioningWrapper").prevAll("a").offset().left;
								} else {
									siblingLinkOffsetLeft = $(this).prevAll("a").offset().left;
								}

								$(this).data("visiblePosX", siblingLinkOffsetLeft);

								neededOffsetRight = $(this).data("visiblePosX") + $(this).outerWidth() - $(window).width();

								if (neededOffsetRight > 0) {

									$(this)
											.wrap("<div class=\"menuPositioningWrapper\"></div>")
											.closest(".menuPositioningWrapper")
													.css({ "transform" : "translateX(-" + neededOffsetRight + "px)" })
													.end() // back to $(this) menu
											.data("visiblePosX", siblingLinkOffsetLeft - neededOffsetRight);
									;
								}

							})
							.find("ul")
									.each(function(){
										var $parentMenu = $(this).parents("ul").first();

										$(this).data("visiblePosX", $parentMenu.data("visiblePosX") + $parentMenu.outerWidth());

										if ($(this).data("visiblePosX") + $(this).outerWidth() > $(window).width()) {
											$(this).addClass("flip");
											$(this).data("visiblePosX", $parentMenu.data("visiblePosX") - $(this).outerWidth());
										} else {
											$(this).removeClass("flip");
											$(this).data("visiblePosX", $parentMenu.data("visiblePosX") + $parentMenu.outerWidth());
										}

									})

		}

	});

};