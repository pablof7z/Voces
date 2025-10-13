// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Module declarations for packages without types
declare module 'shakespeare' {
	export function contentToDTag(content: string): string;
	export function hashtagsFromText(text: string): string[];
	// Add other exports as needed
}

export {};
