class HydeSearch {
    searchIndexLocation: string;
    searchIndex: object;

    constructor(searchIndexLocation: string) {
        this.searchIndexLocation = searchIndexLocation;
    }

    public init(): void {
        console.log("HS/Debug: Initializing...");
        this.loadIndex().then(() => {
            console.log(this.searchIndex);
        });
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
}