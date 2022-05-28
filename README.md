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
		// Note that HydeSearch assumes the JSON is safe and trusted. Use strict CORS policies.
		const searchIndexLocation = 'tests/search.json';
		const Search = new HydeSearch(searchIndexLocation);

		Search.init();
	});
</script>
```

## Contributing

PRs, issues, and feedback are welcome! I'd especially love to get help writing tests!

## License

The MIT License

## Extra

<a href="https://validator.w3.org/nu/#textarea">
<img src="https://cdn.jsdelivr.net/gh/bradleytaunt/html5-valid-badge@68b012b5c19b26f75d9bee2409420c916b2d451a/html5-validator-badge-blue.svg" alt="Valid HTML5">
</a>
