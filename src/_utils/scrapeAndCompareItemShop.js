import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

export const scrapeAndCompareItemShop = async ({ client, channelId }) => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const filePath = path.resolve(__dirname, '../../kruna.json')

    let previousScrape = null

    try {
        const data = await fs.readFile(filePath, 'utf8')
        previousScrape = JSON.parse(data)
    } catch (err) {
        console.log('No previous scrape found, creating a new one.')
    }

    const fetchScrape = async () => {
        try {
            const response = await fetch('https://secure.kru.com/itemshop/data/itemshop.json')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        } catch (error) {
            console.error('Error fetching data:', error.message)
            client.channels.cache.get(channelId).send(`Error fetching data: ${error.message}`)
            return null
        }
    }

    const compareScrapes = (previous, current) => {
        const changes = {}

        for (const category in current) {
            if (Array.isArray(current[category])) {
                const prevNames = previous && previous[category] ? previous[category].map((item) => item.name) : []
                const currNames = current[category].map((item) => item.name)

                const addedNames = currNames.filter((name) => !prevNames.includes(name))
                const removedNames = prevNames.filter((name) => !currNames.includes(name))

                changes[category] = { added: addedNames, removed: removedNames }
            }
        }

        return changes
    }

    const reportChanges = (versionChanged, changes) => {
        const channel = client.channels.cache.get(channelId);
        if (versionChanged) {
            // channel.send(`Version has changed from ${previousScrape.version} to ${currentScrape.version}`);
            console.log(`Version has changed from ${previousScrape.version} to ${currentScrape.version}`);
        }

        for (const [category, { added, removed }] of Object.entries(changes)) {
            if (added.length > 0 || removed.length > 0) {
                let message = `**__${category}__**\n\`\`\`diff\n`;
                if (added.length > 0) {
                    message += `${added.map((name) => `+ ${name}`).join('\n')}\n`;
                }
                if (removed.length > 0) {
                    message += `${removed.map((name) => `- ${name}`).join('\n')}\n`;
                }
                message += `\`\`\``; // Close the diff code block
                channel.send(message);
            }
        }
    };

    const currentScrape = await fetchScrape()

    if (!currentScrape) return

    if (previousScrape) {
        const versionChanged = previousScrape.version !== currentScrape.version
        const diff = compareScrapes(previousScrape, currentScrape)

        reportChanges(versionChanged, diff)
        console.log('Differences reported to Discord')
    }

    await fs.writeFile(filePath, JSON.stringify(currentScrape, null, 2))
    console.log('Current scrape saved to kruna.json')
}
