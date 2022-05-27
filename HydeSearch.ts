class HydeSearch {
    searchIndexLocation: string;
    searchIndex: Array<any>;

    searchInput = document.getElementById("search-input") as HTMLInputElement;

    constructor(searchIndexLocation: string) {
        this.searchIndexLocation = searchIndexLocation;
    }

    public init(): void {
        console.log("HS/Debug: Initializing...");
        this.loadIndex().then(() => {
            console.log(this.searchIndex);
        });

        this.searchInput.addEventListener("input", () => {
            this.search();
        });

        this.createSearchResultsContainer();

        console.log("HS/Debug: Initialized.");
    }

    public async loadIndex(): Promise<void> {
        console.log("HS/Debug: Loading index...");

        const response = await fetch(this.searchIndexLocation, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error(`Could not load search index from ${this.searchIndexLocation}`);
        }

        this.searchIndex = await response.json();
        console.log("HS/Debug: Index loaded.");
    }

    public search() {
        console.log("HS/Debug: Searching... Got input: " + this.searchInput.value);
        const searchTerm = this.searchInput.value;

        // Find indexEntries where the search term is in the title or content
        const searchResults = this.searchIndex.filter((indexEntry) => {
            return indexEntry["title"].toLowerCase().includes(searchTerm.toLowerCase())
                || indexEntry["content"].toLowerCase().includes(searchTerm.toLowerCase());
        });

        return searchResults.length > 0
            ? this.displayResults(searchResults)
            : this.displayNoResults();
    }

    protected displayResults(searchResults: any[]) {
        console.log("HS/Debug: Found "+ searchResults.length +" search results.");
    }

    protected displayNoResults() {
        console.log("HS/Debug: No results.");
    }

    protected createSearchResultsContainer() {
        const searchResultsContainer = document.createElement("div");
        searchResultsContainer.id = "search-results";
        searchResultsContainer.classList.add("hyde-search-results");
        document.getElementById('hyde-search').appendChild(searchResultsContainer);

        const searchResultsList = document.createElement("dl");
        searchResultsContainer.appendChild(searchResultsList);
    }
}