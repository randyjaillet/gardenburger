/*
** A gracefully degrading, mobile-first navigation jQuery plugin.
** 
** Gardenburger turns navigation lists into dynamic dropdowns and
** flyouts. These menus are all keyboard accessible. Gardenburger
** is mobile friendly and will transmogrify in mobile mode (at
** < 800px by default) into a set of stacked, indented lists that
** are hidden beneath a "hamburger" icon. Buttons are injected in
** mobile mode for expanding and collapsing menus, as the "hover"
** event can't be relied upon in touch screen environments.
*/

// Keep track of our instantiated gardenburgers in case we need
// to manipulate them later
window.gardenburgers = [];

var Gardenburger = function ($e, options) {
	
	options = options || {};

	// If options is a string (as it is when taken from
	// an HTML attribute), parse it into an object
 	typeof options == "string" && (options = $.parseJSON(options));

	this.settings = $.extend(
		{
		    submenuClass		: "hasChildMenu", // Class applied to LIs containing submenus
	    	injectedTogglerHTML : "<button class=\"submenuTogglers\"><i></i></button>", // The HTML that is injected to function as submenu toggler buttons in mobile mode.
	    	mobileNavStyle		: "offscreen",
	    	breakpoint			: 800
		},
		options
	);
	
	var root = this;
	this.i = $(window.gardenburgers).index(this);
	this.e = $e;
	this.mobileMenusMeasured = false;

	window.gardenburgers.push(this);
	
	this.init();
	
}



Gardenburger.prototype.init = function () {
	var root = this;

	this.e
	

			// Since the focus event doesn't bubble
			// up to the LI tags, use event delegation
			// to apply a class for the CSS to target
			// instead. Also, trigger a custom event
			// for the JS side of things.

			.on(
    			"focus",
    			"a",
    			function (e) {
					$(e.target).parents("li").addClass("focus");
					$(e.target).trigger("bubblyfocus");
				}
			)
			.on(
    			"blur",
    			"a",
    			function(e){
					$(e.target).parents("li").removeClass("focus");
				}
			)


			// Since a parent selector (:has()?) in CSS
			// is currently a distant fantasy, apply a
			// class to LIs that contain submenus.

			.find("li:has(ul)")
					.addClass(root.settings.submenuClass)
					.end() // Back to context


			// Touch handling
			// If the link of a menu item with a dropdown
			// is tapped (touch), the first tap will open
			// the menu (via .focus). It will require a
			// second tap to follow the href.
			
			.on(
				"touchend",
				"li." + root.settings.submenuClass + " > a",
				function (e) {
					if (!$(e.target).data("tappedOnce") && $(window).width() >= root.settings.breakpoint) {
						e.preventDefault();

						$(e.target).data("tappedOnce",true);
	
						$(document).on(
							"touchstart.tapCountReset" + root.i,
							function (e2) {
								if ( !$(e2.target).is($(e.target)) && !$(e2.target).closest($(e.target)).length ) {
									$(e.target).data("tappedOnce",false).blur();
									root.e.off("touchstart.tapCountReset" + root.i);
								}
							}
						);

					}
				}
			)


			// Apply click event handling to the mobile
			// menu button to handle visibility of
			// navigation.

			.on(
				"click",
				".burger a",
				function (e) {
					e.preventDefault();
					if (root.settings.mobileNavStyle == "offscreen") {
						$("html").is(".gardenburgerMobileShow") ? root.hideMenuMobileOffscreen.apply(root) : root.showMenuMobileOffscreen.apply(root);
					} else if (root.settings.mobileNavStyle == "inline") {
						root.e.children("ul").is(":visible") ? root.hideMenuMobileInline.apply(root) : root.showMenuMobileInline.apply(root);
					}
				}
			)


			// Inject togglers for hiding/showing sub
			// menus in mobile mode and attach their
			// event handlers.

			.find("li.hasChildMenu")
					.each(
						function (i, el) {
			    			$(this).children("a").after(root.settings.injectedTogglerHTML);
			    		}
			    	)
			    	.end() // Back to context

			.on(
				"click",
				".submenuTogglers",
				function(e){
					var $li = $(e.target).closest("li");
					var $ul = $li.children("ul").eq(0);
					e.preventDefault();

					if ($li.is(".open")) {
						$li.removeClass("open");
						$ul.slideUp("fast");
					} else {
						$li.addClass("open");
						$ul.slideDown("fast");
					}
				}
			)
	;


	if (root.settings.mobileNavStyle == "inline") {
		// Start off with the nav hidden in mobile mode.
		this.e.children("ul").hide();
	}
	
	
	// If the mobile nav is in offscreen mode,
	// we have to keep it positioned with the
	// top of the viewport.

	if (root.settings.mobileNavStyle == "offscreen") {
		$(window).on(
			"scroll",
			function () {
				root.positionOffscreenNavVertically();
			}
		)
	}


	// Position the menus now and on resize.

	root.positionMenus();
	$(window).on(
		"resize",
		function () {
			root.positionMenus()
		}
	);
}



Gardenburger.prototype.showMenuMobileOffscreen = function () {
	var root = this;
	
	$("html").addClass("gardenburgerMobileShow");

	$(document).on(
		"click.gardenburgerOffscreenMobileShow" + root.i + " touchend.gardenburgerOffscreenMobileShow" + root.i,
		function (e2) {
			if ( !$(e2.target).is(root.e) && !$(e2.target).closest(root.e).length ) {
				root.hideMenuMobileOffscreen();
			}
		}
	);
}



Gardenburger.prototype.showMenuMobileInline = function () {
	var root = this;

	root.e.children("ul").slideDown("fast");
	root.e.addClass("mobileShow");
}



Gardenburger.prototype.hideMenuMobileOffscreen = function () {
	var root = this;
	
	$("html").removeClass("gardenburgerMobileShow");
	$(document).off("click.gardenburgerOffscreenMobileShow" + root.i + " touchend.gardenburgerOffscreenMobileShow" + root.i);
}



Gardenburger.prototype.hideMenuMobileInline = function () {
	var root = this;

	root.e.children("ul").slideUp("fast");
	root.e.removeClass("mobileShow");
}



Gardenburger.prototype.positionOffscreenNavVertically = function () {
	var root = this;
	
	root.e.children("ul").css(
		{
			top : $(window).scrollTop()
		}
	)
}



Gardenburger.prototype.positionMenus = function () {
	var root = this;
	
	this.e

			// Reset previously flipped menus.
			.find("ul")
					.removeClass("flip")
					.end()

			// Remove previously injected positioning wrappers.
			.find(".menuPositioningWrapper > ul")
					.unwrap()
					.end()

			// Go through second-level menus and figure out their
			// positioning first, since it's a little different
			// (they get nudged to the sides by the needed number
			// of pixels to keep them fully on-screen) and
			// because lower menus' positions depend on how we
			// adjust these higher ones'.
			// We're storing the horizontal position at which
			// menus would be if they were visible in the
			// "visiblePosX" key on the jQuery data() method for
			// each menu.
			.find("ul:first > li > ul, ul:first > li > .menuPositioningWrapper > ul")
					.each(
						function () {
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

						}
					)

					// Go through third-and-deeper-level menus.
					// They just get flipped if there isn't 
					// enough room for them.
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
	;
}




$.fn.gardenburger = function (options) {

    return this.each(
    	function() {

			new Gardenburger(
				$(this),
				options || $(this).data("gardenburger-options")
			);

		}
	);

};