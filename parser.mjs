const REGEXES = {
    emails: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi,
    phones: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    urls: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    socials: {
        twitter: /(?:twitter\.com|x\.com)\/([a-z0-9_]{1,15})/gi,
        linkedin: /linkedin\.com\/in\/([a-zA-Z0-9\-]{3,100})/gi,
        instagram: /instagram\.com\/([a-zA-Z0-9_.]{1,30})/gi
    }
};

function extractData(html, collectOptions) {
    const results = {
        emails: new Set(),
        phones: new Set(),
        urls: new Set(),
        domains: new Set(),
        socials: {
            twitter: new Set(),
            linkedin: new Set(),
            instagram: new Set(),
        },
    };

    if (collectOptions.emails) {
        const matches = html.match(REGEXES.emails) || [];
        matches.forEach(email => results.emails.add(email.toLowerCase()));
    }

    if (collectOptions.phones) {
        const matches = html.match(REGEXES.phones) || [];
        matches.forEach(phone => results.phones.add(phone));
    }

    if (collectOptions.urls) {
        const matches = html.match(REGEXES.urls) || [];
        matches.forEach(url => results.urls.add(url));
    }

    if (collectOptions.socials) {
        for (const platform of collectOptions.socials) {
            if (REGEXES.socials[platform]) {
                const matches = html.match(REGEXES.socials[platform]) || [];
                matches.forEach(match => {
                    // Extract the handle from the full match
                    const handle = match.split('/').pop();
                    results.socials[platform].add(handle);
                });
            }
        }
    }

    if (collectOptions.domains) {
        results.urls.forEach(url => {
            try {
                const hostname = new URL(url).hostname;
                // Basic SLD + TLD extraction, won't handle .co.uk etc. correctly without a proper library
                const parts = hostname.replace('www.', '').split('.');
                if (parts.length >= 2) {
                    results.domains.add(parts.slice(-2).join('.'));
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        });
    }

    // Convert sets to arrays for the final output
    const finalResults = {
        emails: [...results.emails],
        phones: [...results.phones],
        urls: [...results.urls],
        domains: [...results.domains],
        socials: {
            twitter: [...results.socials.twitter],
            linkedin: [...results.socials.linkedin],
            instagram: [...results.socials.instagram],
        }
    };

    return finalResults;
}

export { extractData };
