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

    if (collectOptions.socials && Array.isArray(collectOptions.socials)) {
        for (const platform of collectOptions.socials) {
            if (REGEXES.socials[platform]) {
                const matches = html.match(REGEXES.socials[platform]) || [];
                matches.forEach(match => {
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
                const parts = hostname.replace('www.', '').split('.');
                if (parts.length >= 2) {
                    results.domains.add(parts.slice(-2).join('.'));
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        });
    }

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

function convertToCSV(data) {
    let csv = 'type,value\n';

    data.emails.forEach(item => csv += `email,${item}\n`);
    data.phones.forEach(item => csv += `phone,${item}\n`);
    data.urls.forEach(item => csv += `url,"${item}"\n`);
    data.domains.forEach(item => csv += `domain,${item}\n`);

    if (data.socials) {
        Object.keys(data.socials).forEach(platform => {
            data.socials[platform].forEach(handle => csv += `social_${platform},${handle}\n`);
        });
    }

    return csv;
}

// --- Main Execution ---

(function() {
    'use strict';

    console.log("Extractor script running...");

    // --- Configuration ---
    const config = {
        outputFormat: 'json', // 'json', 'csv', or 'clipboard'
        storageKey: 'extractedData',
        collect: {
            emails: true,
            urls: true,
            domains: true,
            phones: true,
            socials: ['twitter', 'linkedin', 'instagram']
        }
    };

    // --- Utility to clear stored data ---
    window.clearExtractedData = function() {
        localStorage.removeItem(config.storageKey);
        console.log('Stored extraction data has been cleared.');
    };

    console.log("Run `clearExtractedData()` in the console to reset and start a new session.");

    // --- Load previous results from localStorage ---
    let storedData = JSON.parse(localStorage.getItem(config.storageKey)) || {};

    // --- Scrape current page ---
    const html = document.documentElement.outerHTML;
    const newResults = extractData(html, config.collect);
    console.log("Scraped current page. Found:", newResults);

    // --- Merge and Deduplicate ---
    const combinedResults = {
        emails: [...new Set([...(storedData.emails || []), ...newResults.emails])],
        phones: [...new Set([...(storedData.phones || []), ...newResults.phones])],
        urls: [...new Set([...(storedData.urls || []), ...newResults.urls])],
        domains: [...new Set([...(storedData.domains || []), ...newResults.domains])],
        socials: {
            twitter: [...new Set([...((storedData.socials && storedData.socials.twitter) || []), ...newResults.socials.twitter])],
            linkedin: [...new Set([...((storedData.socials && storedData.socials.linkedin) || []), ...newResults.socials.linkedin])],
            instagram: [...new Set([...((storedData.socials && storedData.socials.instagram) || []), ...newResults.socials.instagram])],
        }
    };

    // --- Save combined results to localStorage ---
    localStorage.setItem(config.storageKey, JSON.stringify(combinedResults));
    console.log("Saved combined results to local storage.");

    // --- Display final combined results ---
    console.log(`Extraction complete! Total unique results found. Formatting as ${config.outputFormat}.`);

    if (config.outputFormat === 'csv') {
        const csvOutput = convertToCSV(combinedResults);
        console.log("--- CSV OUTPUT ---");
        console.log(csvOutput);
        console.log("--- END CSV OUTPUT ---");
    } else if (config.outputFormat === 'clipboard') {
        copy(combinedResults);
        console.log("Results object has been copied to the clipboard.");
        console.log(combinedResults);
    } else { // default to json
        console.log(combinedResults);
    }

})();
