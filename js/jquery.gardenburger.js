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

$.fn.gardenburger = function(options){  

    var defaultOptions = {
	    submenuClass		: "hasChildMenu", // Class applied to LIs containing submenus
    	injectedTogglerHTML : "<button class=\"submenuTogglers\"><i></i></button>", // The HTML that is injected to function as submenu toggler buttons in mobile mode.
    	mobileNavStyle		: "offscreen"
    };
    var settings = $.extend({}, defaultOptions, options);

    return this.each(function() {
	    
	    var $g = $(this);

		$(this)


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
						.addClass(settings.submenuClass)
						.end() // Back to context


				// Apply click event handling to the mobile
				// menu button to handle visibility of
				// navigation.

				.on(
					"click",
					".burger",
					function (e) {
						e.preventDefault();
						$("html").toggleClass("gardenburgerMobileShow");
					}
				)

				.on(
					"click",
					".menuToggle a",
					function (e) {
						e.preventDefault();
						console.log("this is ", $(this));
						$g.children("ul:not(.mobileNav)")
								.toggleClass("hidden");
					}
				)


				// Inject togglers for hiding/showing sub
				// menus in mobile mode and attach their
				// event handlers.

				.find("li.hasChildMenu")
						.each(
							function (i, el) {
				    			$(this).children("a").after(settings.injectedTogglerHTML);
				    		}
				    	)
				    	.end() // Back to context

				.on(
					"click",
					".submenuTogglers",
					function(e){
						e.preventDefault();
						$(e.target).closest("li")
								.toggleClass("open");
					}
				)
		;
		
		if (settings.mobileNavStyle == "inline") {
			// Start off with the nav hidden in mobile
			// mode.

			$(this).children("ul:not(.mobileNav)")
					.addClass("hidden")
					.end() // Back to context
		}

		$(
			function(){

				window.setTimeout(calculateMenuPositioning, 250);

				$(window).on("resize", calculateMenuPositioning);

			}
		);

		function calculateMenuPositioning() {

			$(this)
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
					.find("ul:not(.mobileNav):first > li > ul, ul:not(.mobileNav):first > li > .menuPositioningWrapper > ul")
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

		}

	});

};