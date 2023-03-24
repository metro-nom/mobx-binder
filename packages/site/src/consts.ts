export const SITE = {
    title: 'mobx-binder',
    description: 'Form validation framework using MobX',
    defaultLanguage: 'en-us',
} as const;

export const OPEN_GRAPH = {
    image: {
        src: 'https://github.com/withastro/astro/blob/main/.github/assets/banner.png?raw=true',
        alt:
            'astro logo on a starry expanse of space,' +
            ' with a purple saturn-like planet floating in the right foreground',
    },
    twitter: 'astrodotbuild',
};

export const KNOWN_LANGUAGES = {
    English: 'en',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://github.com/withastro/astro/tree/main/examples/docs`;

export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
    indexName: 'XXXXXXXXXX',
    appId: 'XXXXXXXXXX',
    apiKey: 'XXXXXXXXXX',
};

export type Sidebar = Record<
    (typeof KNOWN_LANGUAGE_CODES)[number],
    Record<string, { text: string; link: string }[]>
>;
export const SIDEBAR: Sidebar = {
    en: {
        'Documentation': [
            {text: 'Introduction', link: 'en/introduction'},
            {text: 'Getting Started', link: 'en/start'},
            {text: 'Basic API', link: 'en/usage/basic'},
            {text: '- Prerequisites', link: 'en/usage/prerequisites'},
            {text: '- Preparing a Binder', link: 'en/usage/basic#preparing-a-binder'},
            {text: '- Loading and storing field values', link: 'en/usage/load-store'},
            {text: '- Validation', link: 'en/usage/validation'},
            {text: '- Conversion', link: 'en/usage/conversion'},
            {text: '- Conditional Visibility', link: 'en/usage/visibility'},
            {text: '- Change Events', link: 'en/usage/change-events'},
            {text: '- Submission', link: 'en/usage/submission'},
            {text: '- Rendering', link: 'en/usage/rendering'},
        ],
        'More': [
            {text: 'TODOs', link: 'en/todos'},
            {text: 'Development', link: 'en/development'},
            {text: 'License', link: 'en/license'},
        ],
    },
};
