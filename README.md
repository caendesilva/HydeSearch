# Experimental Frontend Search Engine for Hyde Documentation Sites

## #CodingInPublic

Contains both the frontend interface and the TypeScript source code for the plugin.

## Usage

Add the following snippet to your HTML to define the position of the search input:

```html
<div id="hyde-search">
	<noscript>
		The search feature requires JavaScript to be enabled in your browser.
	</noscript>
	<input type="search" name="search" id="search-input" placeholder="Search..." autocomplete="off">
</div>
```

Then, load and initialize the plugin:

```html
<script src="dist/HydeSearch.js" defer></script>

<script>
	window.addEventListener('load', function() {
		// Replace with the HTTP location of your JSON search index.
		const searchIndexLocation = 'tests/search.json';
		const Search = new HydeSearch(searchIndexLocation);

		Search.init();
	});
</script>
```