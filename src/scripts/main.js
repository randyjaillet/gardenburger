/* Keep track of our instantiated Gardenburgers in case
we need to manipulate them later */
window.gardenburgers = [];

var Gardenburger = function ($nav, options) {

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
	var alreadyInstantiatedIndex = -1;
	
	$.each(
		window.gardenburgers,
		(i, v) => {
			v && v.s.is($s) && (alreadyInstantiatedIndex = $.inArray(v, window.gardenburgers));
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

	this.$nav = $nav;
	this.$btn = $($nav.data("gardenburger"));

	this.init();

};





Gardenburger.prototype.init = function () {

	const root = this;

	//
	// Insert SVG focus arrows in every anchor
	//

	const
		$allLIs = this.$nav.find("li"),
		$surfUL = this.$nav.find("ul").first(),
		$surfLIs = $surfUL.children("li"),
		$descLIs = $surfLIs.find("li"),
		$immediateChildLIs = $descLIs.not("li li li"),
		$surfAs = $surfLIs.children("a, .nav-item"),
		$descAs = $descLIs.children("a, .nav-item"),
		$surfLIsWithULs = $surfLIs.has("ul, .nav-dropdown"),
		$descLIsWithULs = $descLIs.has("ul, .nav-dropdown"),
		$arrowRtSvg   = $('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>')
				.addClass("icon-arrow"),
		$chevronDnSvg = $('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')
				.addClass("icon-chevron"),
		$chevronDnSvgCompactLabel = $('<label/>')
				.addClass("icon-chevron-compact-label"),
		$chevronDnSvgCompactCheckbox = $('<input/>')
				.attr("type", "checkbox")
				.appendTo($chevronDnSvgCompactLabel),
		$chevronDnSvgCompact = $('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')
				.addClass("icon-chevron-compact")
				.appendTo($chevronDnSvgCompactLabel),
		$chevronRtSvg = $('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>')
				.addClass("icon-chevron")
	;

	$surfAs.add($descAs).prepend($arrowRtSvg);

	$surfLIsWithULs.add($descLIsWithULs).children("a, .nav-item").after($chevronDnSvgCompactLabel);

	$surfLIsWithULs.children("a, .nav-item").after($chevronDnSvg);
	$descLIsWithULs.children("a, .nav-item").after($chevronRtSvg);



	this.$nav.find(".nav-item:not(a)").attr("tabIndex", "-1");



	this.$btn.on(
		'click',
		function(e) {
			event.preventDefault();
			root.$nav.toggleClass("revealed");
		}
	);



	this.handleCompactMode();
	$(window).on(
		'resize',
		e => {
			root.handleCompactMode()
		}
	);



	this.$nav.filter(".compact").find(".icon-chevron-compact-label > [type=checkbox]").on(
		"keydown",
		e => {
			if (e.which == 13) {
				e.preventDefault();
				$(e.target).trigger("click");
			}
		}
	);



	this.$nav.on(
		"keydown",
		e => {
			if ($(e.target).is("a, .nav-item") && root.$nav.is(":not(.compact)")) {
				const
					$focusedEl = $(e.target),
					$allNavULs = this.$nav.find("ul, .nav-dropdown"),
					$allNavLIs = this.$nav.find("li"),
					$allNavAnchors = this.$nav.find("a, .nav-item"),
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


				switch(e.which) {


					// ESC
					case 27:
						e.preventDefault();
						$(e.target).trigger("blur");
						break;

					
					// Left arrow
					case 37:
						let $t1;

						if 		(focusedIsSurf)		{ $t1 = $prevSib; }
						else if ($child.length && horzFlippedChild)	{ $t1 = $child; }
						else if (focusedIsLev2)		{ $t1 = $prevUncle; }
						else if (!horzFlipped)		{ $t1 = $parent; }

						focusOn($t1);
						break;


					// Up arrow
					case 38:
						let $t2;

						if 		($prevSib.length)	{ $t2 = $prevSib; }
						else if (focusedIsLev2)		{ $t2 = $parent; }

						focusOn($t2);
						break;


					// Right arrow
					case 39:
						let $t3;
						
						if 		(focusedIsSurf)		{ $t3 = $nextSib; }
						else if ($child.length && !horzFlippedChild)	{ $t3 = $child; }
						else if (focusedIsLev2) 	{ $t3 = $nextUncle; }
						else if (horzFlipped)		{ $t3 = $parent; }
						
						focusOn($t3);
						break;

					
					// Down arrow
					case 40:
						let $t4;
						
						if 		(focusedIsSurf)		{ $t4 = $child; }
						else						{ $t4 = $nextSib; }
						focusOn($t4);
						
						break;

				}
			}
		}
	);


	
	this.flipAsNeeded();
	$(window).on(
		"resize",
		e => {
			this.flipAsNeeded();
		}
	)


}





Gardenburger.prototype.handleCompactMode = function () {

	if ($(window).width() > this.settings.breakpoint) {
		this.deactivateCompactMode();
	} else {
		this.activateCompactMode();
	}

}





Gardenburger.prototype.activateCompactMode = function () {

	this.$btn.filter(":hidden").show();
	this.$nav.filter(":not(.compact)").addClass("compact");

}





Gardenburger.prototype.deactivateCompactMode = function () {

	this.$btn.filter(":visible").hide();
	this.$nav.filter(".compact").removeClass("compact");
	this.$nav.filter(".revealed").removeClass("revealed");
	this.$nav.find(".icon-chevron-compact-label > input:checked").prop("checked", false);

}





Gardenburger.prototype.reveal = function () {

	this.$nav.show();

}





Gardenburger.prototype.conceal = function () {

	this.$nav.hide();

}





function focusOn ($t) {

	if ($t !== undefined && $t.length) {
		if ($t.is("a, .nav-item")) {
			$t.trigger("focus");
		} else {
			$t.find("a, .nav-item").first().trigger("focus");
		}
	}

	return $t;

}





Gardenburger.prototype.flipAsNeeded = function () {

	const root = this;

	this.$nav.children("ul").find("ul, .nav-dropdown").not("li li *").each(
		function () {
			if ($(this).outerWidth() + $(this).parent().offset().left > $(window).width()) {
				$(this).addClass("justify-right");
			}
			if ($(this).outerHeight() + $(this).parent().offset().top > $(window).height()) {
				$(this).addClass("flip-v");
			}
		}
	);

	this.$nav.children("ul").find("ul, .nav-dropdown").find("ul, .nav-dropdown").each(
		function () {
			const
				$topLevelLI = root.$nav.find("li").has(this).not(".gardenburger li li"),
				$secLevelUL = $topLevelLI.find("ul, .nav-dropdown").first(),
				isJR = $secLevelUL.hasClass("justify-right")
			;

			let
				hSize = $(this).outerWidth() + $topLevelLI.offset().left + $topLevelLI.outerWidth(),
				$ULsToMeasure = root.$nav.find("ul, .nav-dropdown").has(this).filter(".gardenburger li *")
			;
			if (isJR) {
				$ULsToMeasure = root.$nav.find("ul, .nav-dropdown").has(this).filter(".gardenburger li li *");
			}
			console.log($ULsToMeasure);
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
