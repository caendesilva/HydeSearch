class HydeSearch {
    searchIndexLocation: string;
    searchIndex;

    constructor(searchIndexLocation: string) {
        this.searchIndexLocation = searchIndexLocation;
    }

    public init(): void {
        console.log("HS/Debug: Initializing...");
        this.loadIndex();
    }

    public loadIndex(): void {
        console.log("HS/Debug: Loading index...");
    }
}