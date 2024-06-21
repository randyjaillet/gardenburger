/* Keep track of our instantiated Gardenburgers in case
we need to manipulate them later */
window.gardenburgers = [];

class Gardenburger {

	i;	// This GB's index among all GBs
	$n; // The root nav element
	$b; // The mobile nav display toggle button for this GB

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
				
				"breakpoint": 600
				
			},
			options
		);


		/* If this select is already instantiated as
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
				v && v.is(this) && (alreadyInstantiatedIndex = $.inArray(v, window.gardenburgers));
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
		this.$n = $nav;
		this.$b = $($nav.data("gardenburger"));

		//
		// Insert SVG focus arrows in every anchor
		//

		const
			self = this,
			$surfUL = this.$n.find("ul").first(),
			$surfLIs = $surfUL.children("li"),
			$descLIs = $surfLIs.find("li"),
			$immediateChildLIs = $descLIs.not("li li li"),
			$surfAs = $surfLIs.children("a, .nav-item"),
			$descAs = $descLIs.children("a, .nav-item"),
			$surfLIsWithULs = $surfLIs.has("ul, .nav-dropdown"),
			$descLIsWithULs = $descLIs.has("ul, .nav-dropdown"),
			
			$arrowRtSvg   = $('<svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'),
			$chevronDnSvg = $('<svg class="icon-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'),
			$chevronDnSvgCompactLabel = $('<label class="icon-chevron-compact-label">'),
			$chevronDnSvgCompactCheckbox = $('<input type="checkbox"/>'),
			$chevronDnSvgCompact = $('<svg class="icon-chevron-compact" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'),
			$chevronRtSvg = $('<svg class="icon-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>')
		;

		// Add right arrow icons to nav items
		$surfAs.add($descAs).prepend($arrowRtSvg);

		// Add the mobile mode show/reveal controls to each
		// nav item with a submenu
		$chevronDnSvgCompactLabel.append($chevronDnSvgCompactCheckbox, $chevronDnSvgCompact).appendTo($surfLIsWithULs.add($descLIsWithULs).children("a, .nav-item"));

		// Add the submenu indicator chevrons
		$surfLIsWithULs.children("a, .nav-item").after($chevronDnSvg);
		$descLIsWithULs.children("a, .nav-item").after($chevronRtSvg);



		this.$n.find(".nav-item:not(a)").attr("tabIndex", "-1");



		this.$b.on(
			'click',
			function(e) {
				e.preventDefault();
				self.$n.toggleClass("revealed");
			}
		);



		this.$n.filter(".compact").find(".icon-chevron-compact-label > [type=checkbox]").on(
			"keydown",
			e => {
				if (e.which == 13) {
					e.preventDefault();
					$(e.target).trigger("click");
				}
			}
		);



		this.$n.on(
			"keydown",
			e => {
				if ($(e.target).is("a, .nav-item") && self.$n.is(":not(.compact)")) {
					const
						$focusedEl = $(e.target),
						$allNavULs = this.$n.find("ul, .nav-dropdown"),
						$allNavLIs = this.$n.find("li"),
						$allNavAnchors = this.$n.find("a, .nav-item"),
						$focusedLI = $focusedEl.parents($allNavLIs).first(),
						$nextSib = $focusedLI.nextAll($allNavLIs).has($allNavAnchors).first(),
						$prevSib = $focusedLI.prevAll($allNavLIs).has($allNavAnchors).first(),
						$parent = $focusedLI.parent("ul").parents($allNavLIs).has($allNavAnchors).first(),
						$child = $focusedLI.find($allNavULs).first(),
						$nextUncle = $focusedLI.parent("ul").parents($allNavLIs).has($allNavAnchors).not($descLIs).first().next($allNavLIs),
						$prevUncle = $focusedLI.parent("ul").parents($allNavLIs).has($allNavAnchors).not($descLIs).first().prev($allNavLIs),

						focusedIsSurf = $focusedLI.is($surfLIs),
						focusedIsLev2 = $focusedLI.is($immediateChildLIs),
						horzFlipped = $focusedLI.closest($allNavULs).is(".flip-h"),
						horzFlippedChild = $focusedLI.find($allNavULs).first().is(".flip-h")
					;


					let $t1, $t2, $t3, $t4;

					switch(e.which) {


						// ESC
						case 27:
							e.preventDefault();
							$(e.target).trigger("blur");
							break;

						
						// Left arrow
						case 37:
							if 		(focusedIsSurf)		{ $t1 = $prevSib; }
							else if ($child.length && horzFlippedChild)	{ $t1 = $child; }
							else if (focusedIsLev2)		{ $t1 = $prevUncle; }
							else if (!horzFlipped)		{ $t1 = $parent; }

							Gardenburger.#focusOn($t1);
							break;


						// Up arrow
						case 38:
							if 		($prevSib.length)	{ $t2 = $prevSib; }
							else if (focusedIsLev2)		{ $t2 = $parent; }

							Gardenburger.#focusOn($t2);
							break;


						// Right arrow
						case 39:
							if 		(focusedIsSurf)		{ $t3 = $nextSib; }
							else if ($child.length && !horzFlippedChild)	{ $t3 = $child; }
							else if (focusedIsLev2) 	{ $t3 = $nextUncle; }
							else if (horzFlipped)		{ $t3 = $parent; }
							
							Gardenburger.#focusOn($t3);
							break;

						
						// Down arrow
						case 40:
							if 		(focusedIsSurf)		{ $t4 = $child; }
							else						{ $t4 = $nextSib; }
							Gardenburger.#focusOn($t4);
							
							break;

					}
				}
			}
		);


		// REVIEW Are we supporting vertical flipping yet?
		this.#flipAsNeeded();
		this.#handleCompactMode();
		$(window).on(
			"resize",
			() => {
				self.#flipAsNeeded();
				self.#handleCompactMode();
			}
		);
	}




	#handleCompactMode () {

		if ($(window).width() > this.settings.breakpoint) {
			this.#deactivateCompactMode();
		} else {
			this.#activateCompactMode();
		}

	}





	#activateCompactMode () {

		this.$b.filter(":hidden").show();
		this.$n.filter(":not(.compact)").addClass("compact");

	}





	#deactivateCompactMode () {

		this.$b.filter(":visible").hide();
		this.$n.filter(".compact").removeClass("compact");
		this.$n.filter(".revealed").removeClass("revealed");
		this.$n.find(".icon-chevron-compact-label > input:checked").prop("checked", false);

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





	#flipAsNeeded () {

		const
			self = this
		;

		this.$n.children("ul").find("ul, .nav-dropdown").not("li li *").each(
			function () {
				const
					noSpaceRight = $(this).outerWidth() + $(this).parent().offset().left > $(window).width(),
					hasSpaceLeft = $(this).parent().offset().left > $(this).outerWidth(),
					noSpaceBelow = $(this).outerHeight() + $(this).parent().offset().top > $(window).height(),
					hasSpaceAbove = $(this).parent().offset().top > $(this).outerWidth()
				;
				if (noSpaceRight && hasSpaceLeft) {
					$(this).addClass("justify-right");
				}
				if (noSpaceBelow && hasSpaceAbove) {
					$(this).addClass("flip-v");
				}
			}
		);

		this.$n.children("ul").find("ul, .nav-dropdown").find("ul, .nav-dropdown").each(
			function () {
				const
					$topLevelLI = self.$n.find("li").has(this).not(".gardenburger li li"),
					$secLevelUL = $topLevelLI.find("ul, .nav-dropdown").first(),
					isJR = $secLevelUL.hasClass("justify-right")
				;

				let
					hSize = $(this).outerWidth() + $topLevelLI.offset().left + $topLevelLI.outerWidth(),
					$ULsToMeasure = self.$n.find("ul, .nav-dropdown").has(this).filter(".gardenburger li *")
				;
				if (isJR) {
					$ULsToMeasure = self.$n.find("ul, .nav-dropdown").has(this).filter(".gardenburger li li *");
				}

				$ULsToMeasure.each(
					(ix, el) => {
						hSize += $(el).outerWidth()
					}
				);
				if (hSize > $(window).width()) {
					$(this).addClass("flip-h");
				}
			}
		);
	}




	destroy (preserveSlotInWindowArray) {

		preserveSlotInWindowArray = preserveSlotInWindowArray || false;

		/* TODO Disconnect observers */
		// Not implemented yet

		/* Remove inserted elements	*/
		this.$n.find(".icon-arrow, .icon-chevron, .icon-chevron-compact-label").remove();

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
				attrSettsAsJSON = attrSetts && typeof attrSetts == "string" ? $.parseJSON(attrSetts) : attrSetts
			;
			
			$.extend(options, attrSettsAsJSON);

			new Gardenburger($(this), options);

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