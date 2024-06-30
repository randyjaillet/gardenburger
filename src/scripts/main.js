/* Keep track of our instantiated Gardenburgers in case
we need to manipulate them later */
window.gardenburgers = [];

class Gardenburger {

	i;	// This GB's index among all GBs
	$n; // The root nav element
	$b; // The mobile nav display toggle button for this GB
	$s; // The screen element for overlay-style mobile navs
	$d; // All dropdowns

	constructor ($nav, options) {

		/* If there are no options, create an empty object
		so we can still use it in the extend code below. */
		options = options || {};

		/* If options is a string (as it is when taken from
		an HTML attribute), parse it into an object. */
		typeof options == "string" && (options = $.parseJSON(options));

		/* Settings can be set here as defaults or at
		instantiation by passing an object of the
		values you wish to set as the second
		argument. Any options set at instantiation
		in this manner will overwrite these
		defaults for the instantiated Gardenburger. */
		this.settings = $.extend(
			{
				
				"breakpoint": 450,
				"mobileNavMode": "overlay",
				"overflowText": ""
				
			},
			options
		);


		const self = this;
		this.$n = $nav;


		/* If this element is already instantiated as
		a Gardenburger, destroy the old one and
		reinstantiate. The new instance will
		replace the old one in its location in
		the window's gardenburgers array.
		Otherwise, push it as a new one onto the
		end of the array. */
		let alreadyInstantiatedIndex = -1;
		
		$.each(
			window.gardenburgers,
			(_i, v) => {
				v && v.$n.is(self.$n) && (alreadyInstantiatedIndex = $.inArray(v, window.gardenburgers));
			}
		);

		if (alreadyInstantiatedIndex >= 0) {
			window.gardenburgers[alreadyInstantiatedIndex].destroy(true);
			window.gardenburgers[alreadyInstantiatedIndex] = this;
		} else {
			const firstUndefinedIndex = window.gardenburgers.findIndex(element => element === undefined);
			if (firstUndefinedIndex >= 0) {
				window.gardenburgers[firstUndefinedIndex] = this;
			} else {
				window.gardenburgers.push(this);
			}
		}


		/* Store each Gardenburger's index relative to one another
		for unique identifiers such as in event listeners.
		Useful for debugging too. */
		this.i = $(window.gardenburgers).index(this);
		this.$b = $($nav.data("gardenburger"));
		this.$d = this.$n.find("ul").first().find("ul, .nav-dropdown");

		//
		// Insert extra elements (svg icons, invisible checkboxes)
		//

		const
			$surfUL = this.$n.find("ul").first(),
			$allLIs = this.$n.find("li"),
			$surfLIs = $surfUL.children("li"),
			$descLIs = $surfLIs.find("li"),
			$surfAs = $surfLIs.children("a, .nav-item"),
			$descAs = $descLIs.children("a, .nav-item"),
			$surfLIsWithULs = $surfLIs.has("ul, .nav-dropdown"),
			$descLIsWithULs = $descLIs.has("ul, .nav-dropdown"),
			
			$arrowRtSvg   = $('<svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'),
			$chevronDnSvg = $('<svg class="icon-chevron icon-chevron-dn" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'),
			$chevronRtSvg = $('<svg class="icon-chevron icon-chevron-rt" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'),
			$chevronDnSvgCompact = $('<svg class="icon-chevron-compact" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'),
			$labelChevronCompact = $('<label class="label-chevron-compact">'),
			$labelChevronCompactCheckbox = $('<input type="checkbox"/>')
		;

		// Add right arrow icons to nav items
		$surfAs.add($descAs).prepend($arrowRtSvg);

		// Add the mobile mode show/reveal controls to each
		// nav item with a submenu
		$labelChevronCompact.append($labelChevronCompactCheckbox, $chevronDnSvgCompact).insertAfter($surfLIsWithULs.add($descLIsWithULs).children("a, .nav-item"));

		// Add the submenu indicator chevrons
		$allLIs.children("a, .nav-item").after($chevronDnSvg, $chevronRtSvg);


		this.$n.find(".nav-item:not(a)").attr("tabIndex", "-1");

		this.$s = this.#getOverlayScreen();


		this.$b.on(
			'click',
			function(e) {
				e.preventDefault();
				if (self.settings.mobileNavMode == "overlay") {
					$("#gardenburger-screen").hasClass("hidden") ? self.#showOverlayNav() : self.#hideOverlayNav();
				} else {
					self.$n.toggleClass("revealed");
				}
			}
		);



		this.$n.filter(".compact").find(".label-chevron-compact > [type=checkbox]").on(
			"keydown",
			e => {
				if (e.which == 13) {
					e.preventDefault();
					$(e.target).trigger("click");
				}
			}
		);

		this.#updateKeyboardHandlersDesktop(this.$n);

		Gardenburger.#recordWidth($surfLIs);
		this.applyPositionalModifiers();
		this.#handleMobileMode();
		if (!this.inMobileMode) {
			this.#manageOverflow();
		}
		$(window).on(
			{
				"resize": $.throttle(
					250,
					() => {
						this.applyPositionalModifiers();
						this.#handleMobileMode();
						if (!this.inMobileMode) {
							this.#manageOverflow();
						}
					}
				)
			}
		);

	}




	#updateKeyboardHandlersMobile ($scope) {

		$scope.on(
			"keydown",
			"a, .nav-item, .label-chevron-compact [type=checkbox]",
			e => {
				const
					self = this,
					$et = $(e.target),
					$etLI = $et.closest("#gardenburger-screen li"),
					$par = $etLI.parents("#gardenburger-screen li").first(),
					$allLIs = $("#gardenburger-screen li"),
					$allVisLIs = $allLIs.filter(
						function () {
							const
								$allParBoxes = $(this).parents("li").find(" > .label-chevron-compact > [type=checkbox]"),
								$allParTicks = $allParBoxes.filter(":checked")
							;
							return $allParTicks.length == $allParBoxes.length;
						}
					),
					ix = $allLIs.index($etLI),
					visix = $allVisLIs.index($etLI),
					$chd = $etLI.children("ul, .nav-dropdown").first().children("li").first()
				;
				let $t = $();
				switch(e.which) {

					// ESC
					case 27:
						e.preventDefault();

						self.#hideOverlayNav();

						break;


					// Left arrow
					case 37:
						e.preventDefault();

						if ($et.is("[type=checkbox]")) $t = $etLI;
						else if ($par.length) {
							$t = $par;
							$par.find(".label-chevron-compact [type=checkbox]").first().prop("checked", false);
						}
						else $etLI.find(".label-chevron-compact [type=checkbox]").first().prop("checked", false);
						
						break;


					// Up arrow
					case 38:
						e.preventDefault();

						if ($allVisLIs.eq(visix-1).length) $t = $allVisLIs.eq(visix-1)
						
						break;


					// Right arrow
					case 39:
						e.preventDefault();

						$t = $allLIs.eq(ix+1);

						if ($chd.length) {
							$etLI.find(".label-chevron-compact [type=checkbox]").first().prop("checked", true);
						}

						break;


					// Down arrow
					case 40:
						e.preventDefault();

						if ($allVisLIs.eq(visix+1).length) $t = $allVisLIs.eq(visix+1);
						else $t = $allVisLIs.first();

						break;
				}
				Gardenburger.#focusOn($t);
			}
		);
		
	}




	#updateKeyboardHandlersDesktop ($scope) {
		$scope.find("a, .nav-item").on(
			"keydown",
			e => {
				if (this.$n.is(":not(.compact)")) {
					const
						$et = $(e.target),
						$surfUL = this.$n.find("ul").first(),
						$surfLIs = $surfUL.children("li"),
						$descLIs = $surfLIs.find("li"),
						$immediateChildLIs = $descLIs.not("li li li"),
						$allNavULs = this.$n.find("ul, .nav-dropdown"),
						$allNavLIs = this.$n.find("li"),
						$allVisNavLIs = $allNavLIs.filter(
							(_ix, el) => $(el).parents("ul, .nav-dropdown").first().css("opacity") == '1'
						),
						$allNavAnchors = this.$n.find("a, .nav-item"),
						$etLI = $et.parents($allNavLIs).first(),
						$nextSib = $etLI.nextAll($allNavLIs).has($allNavAnchors).first(),
						$prevSib = $etLI.prevAll($allNavLIs).has($allNavAnchors).first(),
						$parent = $etLI.parent("ul").parents($allNavLIs).has($allNavAnchors).first(),
						$childFirst = $etLI.find($allNavULs).first(),
						$childLast = $etLI.find($allNavULs).first().children($allNavLIs).last(),
						$nextUncle = $etLI.parent("ul").parents($allNavLIs).has($allNavAnchors).not($descLIs).first().next($allNavLIs),
						$prevUncle = $etLI.parent("ul").parents($allNavLIs).has($allNavAnchors).not($descLIs).first().prev($allNavLIs),

						focusedIsSurf = $etLI.is($surfLIs),
						focusedIsLev2 = $etLI.is($immediateChildLIs),
						horzFlipped = $etLI.closest($allNavULs).is(".flip-h"),
						vertFlipped = this.$n.is(".flip"),
						horzFlippedChild = $etLI.find($allNavULs).first().is(".flip-h")
					;


					let $t;

					switch(e.which) {


						// ESC
						case 27:
							e.preventDefault();
							$(e.target).trigger("blur");
							break;


						// Left arrow
						case 37:
							e.preventDefault();
							if 		(focusedIsSurf)		{ $t = $prevSib; }
							else if ($childFirst.length && horzFlippedChild)	{ $t = $childFirst; }
							else if (focusedIsLev2)		{ $t = $prevUncle; }
							else if (!horzFlipped)		{ $t = $parent; }

							Gardenburger.#focusOn($t);
							break;


						// Up arrow
						case 38:
							e.preventDefault();
							if (focusedIsSurf && vertFlipped)           { $t = $childLast; }
							else if	(!focusedIsSurf && $prevSib.length)	{ $t = $prevSib; }
							else if (focusedIsLev2 && !vertFlipped)     { $t = $parent; }

							Gardenburger.#focusOn($t);
							break;


						// Right arrow
						case 39:
							e.preventDefault();
							if 		(focusedIsSurf)		{ $t = $nextSib; }
							else if ($childFirst.length && !horzFlippedChild)	{ $t = $childFirst; }
							else if (focusedIsLev2) 	{ $t = $nextUncle; }
							else if (horzFlipped)		{ $t = $parent; }
							
							Gardenburger.#focusOn($t);
							break;

						
						// Down arrow
						case 40:
							e.preventDefault();
							if (focusedIsSurf && !vertFlipped)          { $t = $childFirst; }
							else if (!focusedIsSurf && $nextSib.length) { $t = $nextSib; }
							else if (focusedIsLev2 && vertFlipped)      { $t = $parent; }

							Gardenburger.#focusOn($t);
							break;

					}
				}
			}
		);
	}




	static #constructOverflowNavItem (txt) {
		const
			$newLI = $(`<li id="gardenburger-overflow" class="supress-indicator-chevron" data-gardenburger-requires-click>
				<span class="nav-item" tabindex="-1">
					<svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
					${txt} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
				</span>
				<svg class="icon-chevron icon-chevron-dn" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
				<svg class="icon-chevron icon-chevron-rt" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
				<label class="label-chevron-compact">
					<input type="checkbox">
					<svg class="icon-chevron-compact" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
				</label>
				<ul></ul>
			</li>`)
		;
		return $newLI;
	}




	#manageOverflow ($injectAfter = this.$n.find("ul").first().children("li").not("[data-gardenburger-supress-overflow], #gardenburger-overflow").last()) {
		const
			$topUL = this.$n.find("ul").first(),
			overflowLIExists = this.$n.find("#gardenburger-overflow").length
		;
		let $overflowLI = overflowLIExists ? this.$n.find("#gardenburger-overflow").first() : Gardenburger.#constructOverflowNavItem(this.settings.overflowText);
		const $overflowLIUL = $overflowLI.children("ul").first();

		if (this.#hasOverflowingNavItems()) {

			if ($injectAfter.length) {
				$overflowLI.insertAfter($injectAfter);
			} else {
				$overflowLI.appendTo($topUL);
			}
			Gardenburger.#recordWidth($overflowLI);
			this.#updateKeyboardHandlersDesktop($overflowLI);

			// Hide overflowing nav items
			while (this.#hasOverflowingNavItems()) {
				const
					$eligibleLIs = this.$n.find("ul").first().children("li").not("[data-gardenburger-supress-overflow], #gardenburger-overflow, :only-child")
				;
				$eligibleLIs.last().appendTo($overflowLIUL);
			}
		}

		// Show previously hidden nav items that can now fit
		$($overflowLIUL.children("li").get().reverse()).each(
			(_ix, el) => {
				if (this.#hasSpaceForNavItem($(el))) {
					$(el).insertAfter(this.$n.find("ul").first().children("li").not("[data-gardenburger-supress-overflow], #gardenburger-overflow").last());
				} else {
					return false;
				}
			}
		);

		if ($overflowLI.find("li").length) {
			this.applyPositionalModifiers($overflowLI);
		} else {
			$overflowLI.remove();
		}

	}




	#hasSpaceForNavItem ($li) {
		const
			availSpace      = this.#getAvailableNavSpace(),
			liWidth         = $li.data("width")
		;
		return availSpace >= liWidth;
	}




	#getAvailableNavSpace () {
		const
			$topUL          = this.$n.find("ul").first(),
			$firstLI        = $topUL.children("li").first(),
			$lastLI         = $topUL.children("li").last(),
			topULRightEdge  = $topUL.offset().left + $topUL.outerWidth(),
			lastLIRightEdge = $lastLI.offset().left + $lastLI.outerWidth(),
			gaps			= 10 * 2,
			overflowLISpace = this.$n.find("#gardenburger-overflow > ul").has("> li:only-child").length ? this.$n.find("#gardenburger-overflow").data("width") : 0,
			topULLeftEdge   = $topUL.offset().left,
			firstLILeftEdge = $firstLI.offset().left,
			availSpace      = (topULRightEdge - lastLIRightEdge) + (firstLILeftEdge - topULLeftEdge) - gaps + overflowLISpace
		;
		return availSpace;
	}




	#hasOverflowingNavItems () {
		return this.#getAvailableNavSpace() < 0;
	}




	static #recordWidth ($targets) {
		$targets.each(
			(_ix, el) => {
				$(el).data(
					{
						"width": $(el).outerWidth()
					}
				);
			}
		);
	}




	#handleMobileMode () {

		if ($(window).width() > this.settings.breakpoint) {
			this.$b.filter(":hidden").hide();
			if (this.settings.mobileNavMode == "inline" && this.$n.is(".compact")) {
				this.#deactivateInlineMode();
			} else {
				this.#deactivateOverlayMode();
			}
		} else {
			this.$b.filter(":hidden").show();
			if (this.settings.mobileNavMode == "inline" && this.$n.is(":not(.compact)")) {
				this.#activateInlineMode();
			} else {
				this.#activateOverlayMode();
			}
		}

	}




	#getOverlayScreen () {

		let $ovnv = $("#gardenburger-screen");

		if (!$ovnv.length) {
			$ovnv = Gardenburger.#constructOverlayScreen().appendTo("body");

			$ovnv.on(
				"click",
				(e) => {
					if (!$(e.target).closest("#gardenburger-screen ul :is(a, .nav-item, label, input, button)").length) {
						this.#hideOverlayNav();
					}
				}
			);

		}

		return $ovnv;

	}




	#showOverlayNav () {

		const $ovnv = $("#gardenburger-screen");

		$ovnv.removeClass("hidden");
		$ovnv.find("a, .nav-item, input, button").attr("tabindex", "1");
		$ovnv.find("a, .nav-item").first().trigger("focus");

	}




	#hideOverlayNav () {

		const $ovnv = $("#gardenburger-screen");

		$ovnv.addClass("hidden");
		$ovnv.find("a, .nav-item, input, button").attr("tabindex", "-1");
		$ovnv.find(":focus").first().trigger("blur");

	}




	static #constructOverlayScreen () {
		return $(`<div id="gardenburger-screen" class="hidden"><span class="gardenburger-screen-ex"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span></div>`);
	}




	#activateOverlayMode () {
		const $ovnv = this.#getOverlayScreen();
		const $placeholder = $(`<span id="gb-placeholder-${this.i}"/>`).insertBefore(this.$n.find("ul").first()).hide();
		this.$n.find("ul").first().appendTo($ovnv);
		this.#updateKeyboardHandlersMobile($ovnv);
		this.inMobileMode = true;
	}




	#deactivateOverlayMode () {
		this.$s.find("ul").first().insertAfter(`#gb-placeholder-${this.i}`).prev().remove();
		this.#updateKeyboardHandlersDesktop(this.$n)
		this.inMobileMode = false;
	}





	#activateInlineMode () {

		this.$n.filter(":not(.compact)").addClass("compact");

		const
			injectionLocation = $(this.$n.data("gardenburger-mobile-injection-location")),
			injectionType = this.$n.data("gardenburger-mobile-injection-type"),
			$placeholder = $(`<span id="gb-placeholder-${this.i}"/>`).hide()
		;
		if (injectionLocation) {
			if (!$(`#gb-placeholder-${this.i}`).length) $placeholder.insertBefore(this.$n);
			if (injectionType == "prepend") {
				this.$n.prependTo(injectionLocation);
			} else {
				this.$n.appendTo(injectionLocation);
			}
		}

		this.inMobileMode = true;

	}





	#deactivateInlineMode () {

		const
			phStr = `#gb-placeholder-${this.i}`,
			$placeholder = $(phStr)
		;

		this.$n.removeClass("compact revealed");
		this.$n.find(".label-chevron-compact input:checked").prop("checked", false);
		this.$n.insertAfter($placeholder);
		$placeholder.remove();

		this.inMobileMode = false;

	}





	static #focusOn ($t) {

		if ($t !== undefined && $t.length) {
			if ($t.is("a, .nav-item")) {
				$t.trigger("focus");
			} else {
				$t.find("a, .nav-item").first().trigger("focus");
			}
		}

		return $t;

	}



	/*
	There's basically four modifiers that affect the
	positioning of the dropdowns. It's different between
	first-level dropdowns and deeper ones because
	first-level dropdowns appear above or below the nav
	while grandchild dropdowns appear to the side of their
	parent. Thus the same issue (not enough space) requires
	a slightly different fix for each.

	First-level dropdowns:

	  - .justify-right: By default first-level dropdowns are
	  	horizontally aligned on the left edge with their
		parent. If this causes the dropdown to extend off
		the right edge of the viewport, .justify-right
		changes the alignment to the right edge. (Only if 
		there is room on the left.)

	Second-and-deeper-level dropdowns:

	  - .flip-h: By default grandchild dropdowns appear to
	  	the right of its parent dropdown. If this causes the
		dropdown to extend off the right edge of the
		viewport, they are flipped to the left side.

	  - .justify-bottom: By default grandchild dropdowns are
	  	aligned on their top edge with the top of their
		parent LI and they extend downwards. If there isn't
		room for this in the viewport or if we're .flip-v'd
		and they would extend over the nav bar, we change
		the justification to the bottom and they extend
		upwards.

	There is one more modifier that we expect the user to
	add manually when necessary. .flip can go on the root
	element to cause first-level dropdowns to appear above
	the nav instead of below. This is for footer navs and
	other navs near the bottom fold.
	* TODO Make the .flip automatic too if possible

	Note that all of these modifiers affect navigation with
	the keyboard. (For example, normally the down arrow will
	enter a first-level dropdown from its parent; but if the
	dropdown is .flip-v, up arrow will do this instead.)

	*/
	applyPositionalModifiers ($scope = this.$n.find("ul").first()) {
		$scope.addClass("forceAllOpen ignoreHoverFocus");
		const
			self = this,
			$topUL = this.$n.find("ul").first(),
			$allDDs = $scope.find("ul, .nav-dropdown"),
			navIsVertFlipped = this.$n.hasClass("flip"),
			gutter = Number(getComputedStyle(document.body).getPropertyValue('--gutter').replace("px", ""))
		;

		$allDDs.each(
			(_ix, that) => {

				$(that).removeClass("flip-h justify-bottom justify-right");

				let
					ol = $(that).offset().left,
					ot = $(that).offset().top,
					dw = $(that).outerWidth(),
					dh = $(that).outerHeight(),
					or = $(window).width() - (ol + dw),
					ob = $(window).height() - (ot + dh)
				;

				self.#recordMeasurements($(that));

				if (!$(that).parents(".gardenburger ul ul").length) {

					// Top-level dropdowns

					if (or < 0 && ol > dw) $(that).addClass("justify-right");

				} else {

					// Deeper than top-level dropdowns

					const
						$parentDD = $(that).closest($(".gardenburger ul, .gardenburger .nav-dropdown").not(that)),
						pol = $parentDD.data("left"),
						topot = $topUL.offset().top,
						parentIsFlipped = $parentDD.hasClass("flip-h")
					;

					// If the parent is flipped, we prefer
					// flipping this if possible; otherwise
					// we flip only if necessary. In both
					// cases we only flip if there is room
					// to do so. (If we have to choose which
					// side of the viewport the dropdown
					// extends beyond, we prefer the right
					// side so user can at least access it.)
					if (pol >= dw + gutter && (parentIsFlipped || or <= 0)) $(that).addClass("flip-h");

					if (navIsVertFlipped && ot + dh > topot || !navIsVertFlipped && ob < 0) $(that).addClass("justify-bottom");

				}

				// Re-measure with modifiers accounted for
				self.#recordMeasurements($(that));

			}
		);
		$scope.removeClass("forceAllOpen");
		setTimeout(
			() => {
				$scope.removeClass("ignoreHoverFocus");
			}, 100
		);
	}



	
	#recordMeasurements ($targets) {

		$targets.each(
			(_ix, that) => {

				let
					ol = $(that).offset().left,
					ot = $(that).offset().top,
					dw = $(that).outerWidth(),
					dh = $(that).outerHeight(),
					or = $(window).width() - (ol + dw),
					ob = $(window).height() - (ot + dh)
				;

				$(that).data(
					{
						"left"  : ol,
						"top"   : ot,
						"right" : or,
						"bottom": ob,
						"width" : dw,
						"height": dh
					}
				);

			}
		)

	}




	destroy (preserveSlotInWindowArray) {

		preserveSlotInWindowArray = preserveSlotInWindowArray || false;

		/* TODO Disconnect observers */
		// Not implemented yet

		/* Remove inserted elements	*/
		this.$n.find(".icon-arrow, .icon-chevron, .label-chevron-compact").remove();

		/* Remove tabindex's */
		this.$n.find(".nav-item:not(a)").removeAttr("tabindex");

		/* Remove event handling */
		// TODO Namespaces
		$(window).add(this.$n).add(this.$b).off("click resize keydown");

		/* Remove classes */
		this.$n.removeClass("compact revealed");
		this.$n.find("ul, .nav-dropdown").removeClass("justify-right flip-v flip-h");

		/* Remove instance from window array */
		preserveSlotInWindowArray ? window.gardenburgers[this.i] = undefined : window.gardenburgers.splice(this.i, 1);

	}

}





//
//
// Instantiation
//
//

/* Plugin for ease of instantiation.
Priority is on options passed in
argument followed by those in HTML
attribute. */
$.fn.gardenburger = function (options) {

    return this.each(
    	function() {

			const
				attrSetts = $(this).data("gardenburger-options"),
				attrSettsAsJSON = attrSetts && typeof attrSetts == "string" ? $.parseJSON(attrSetts) : attrSetts,
				extendedSetts = $.extend(attrSettsAsJSON, options)
			;

			new Gardenburger($(this), extendedSetts);

		}
	);

};


/* Auto-instantiation based on HTML
attributes */
$(
	function () {
		$("[data-gardenburger]").each(
			function () {
				$(this).gardenburger();
			}
		);		
	}
);