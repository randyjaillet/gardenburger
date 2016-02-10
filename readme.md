# Gardenburger

A gracefully degrading, mobile-first navigation jQuery plugin.

Gardenburger turns navigation lists into dynamic dropdowns and flyouts. These menus are all keyboard accessible. Gardenburger tries to keep them on-screen at all times. Gardenburger is mobile friendly and will transmogrify in mobile mode (at < 800px by default) into a set of stacked, indented lists that are hidden beneath a "hamburger" icon. Buttons are injected in mobile mode for expanding and collapsing menus, as the "hover" event can't be relied upon in touch screen environments.

## Usage

Include jQuery, jquery.gardenburger.js, and gardenburger.css, then initialize `gardenburger()` on the parent of your navigation UL. Also make sure the base selector that appears throughout the CSS (or once at the top of the Stylus file) targets the correct element.

```
<link rel="stylesheet" type="text/css" href="css/gardenburger.css"/>
<script type="text/javascript" src="https://code.jquery.com/jquery-1.12.0.min.js"></script>
<script type="text/javascript" src="js/jquery.gardenburger.js"></script>
```

```
$("#mynav").gardenburger();
```

## Markup Assumptions

Gardenburger assumes the existence of a `ul.mobileNav` sibling of the nav's top-level `ul`. This mobile nav `ul` should contain list items for menu items that should be visible on the surface in mobile mode, as well as an `li.menuToggle` for toggling the rest of the nav.

* `nav`
	* `ul.mobileNav`
		* list items visible on surface in mobile mode
		* `li.menuToggle`
			* `a`
	* `ul`
		* nav items in the form of `li`s and nested `ul`s 

Since CSS doesn't provide a parent selector or ":has()" pseudo-class, we'll mimic one by applying a class to list items that contain submenus. By default this class is `hasChildMenu`, but this is customizable via the `submenuClass` option.

## Options

### `submenuClass`

Use the option to customize the class applied to navigation list items that contain submenus. The default is `hasChildMenu`.

### `navJSClass`

Use this option to customize the class applied to the nav for styling based on the presence of JS. The default is `yesJS`.

### `injectedTogglerHTML`

Use this option to customize the HTML injected into list items to function as submenu buttons in mobile mode. The default is as follows:

```
<button class="submenuTogglers"><i></i></button>
```