import { Stagehand } from "@browserbasehq/stagehand";
import { Page } from "@browserbasehq/stagehand";
import { z } from "zod";


export async function main({
    page,
    stagehand,
}: {
    page: Page; // Playwright Page with act, extract, and observe methods
    stagehand: Stagehand; // Stagehand instance
}) {
    console.log("Starting Chart Meme Generation...");
    await stagehand.page.goto("https://imgflip.com/chart-maker", {
        timeout: 0,
        waitUntil: "domcontentloaded"
    })

    try {
        console.log("Selecting Donut Chart Type...");
        await page.act({
            action: 'Click the "Donut" chart type button with seletor "div.cha-type[data-type="donut"]".'
        })

        const title = "Me trying to study "

        console.log("Setting Chart Title...");
        await page.act({
            action: `Enter the text as "${title}" in the input box containing "Chart Title" placeholder`
        })

        console.log("Generating and filling the captions...");
        const { response1, response2 } = await page.extract({
            instruction: `Based on the message "${title}", generate two short, humorous responses which will be used for a chart meme - Response 1 will be 1% of the activity and response 2 will be 99% of the activity based on "${title}" `,
            schema: z.object({
                response1: z.string(),
                response2: z.string()
            })
        })

        console.log(response1, response2);

        const [action1] = await page.observe(`Locate the input box with the placeholder "slice #1"`)

        const [action2] = await page.observe(`Locate the input box with the placeholder "slice #2"`)

        console.log(action1, action2);

        await page.act({
            ...action1,
            arguments: [response2]
        })

        await page.act({
            ...action2,
            arguments: [response1]
        })

        console.log("Clicking 'Make Chart' button...");
        await page.act({
            action: 'Click the "Make Chart" button'
        })

        //wait for the input field to appear
        await page.waitForSelector("input.img-code.link", { timeout: 10000 })

        const imageUrlTag = await page.locator("input.img-code.html").inputValue()

        const imageUrlMatch = imageUrlTag.match(/src="([^"]+)"/)
        const directImageUrl = imageUrlMatch ? imageUrlMatch[1] : null

        if (!directImageUrl) {
            console.error("Failed to extract image Url");
            return
        }

        await page.goto(directImageUrl)

        //Download the image 
        const path = "./downloads/downloaded-chart.png"
        await page.screenshot({ path: path })

        console.log("Image Downloaded successfully to :", path);

    } catch (error) {
        console.log("Error during chart meme generator:", error);
        process.exit(1)
    }
}