const { test, expect } = require('@playwright/test');

test.describe('To perform NETWORK MOCKING with APIs', function () {

    test('INTERCEPTING a GET request and sending a FAKE request as response', async ({ page }) => {
        let apiResponse = {};
        await page.route('**/breeds**', async (route) => {
            const response = await route.fetch({
                //FAKE Intercepting request
                url: 'https://api.restful-api.dev/objects/7',
            });
            apiResponse.body = await response.json();
            apiResponse.status = response.status();
            await route.fulfill({ response });
        });
        //Original Request
        await page.goto('https://dogapi.dog/api/v2/breeds?page[number]=5&page[size]=5');

        expect(apiResponse.status).toBe(200)
        expect(apiResponse['body'].name).toEqual('Apple MacBook Pro 16');

    })
    test('INTERCEPTING a GET request and sending a FAKE request as response(METHOD 2)', async ({ page }) => {
        await page.route('**/breeds**', async function (route) {
            await route.continue({
                //FAKE Intercepting request
                url: 'https://api.restful-api.dev/objects/1'
            })
        })

        //SENDING THE ORIGINAL REQUEST THROUGH JS FETCH
        const response = await page.evaluate(async () => {
            const res = await fetch('https://dogapi.dog/api/v2/breeds?page[number]=5&page[size]=5');
            return {
                status: res.status,
                body: await res.json()
            };
        });

        expect(response.status).toBe(200)
        expect(response['body'].name).toEqual('Google Pixel 6 Pro');
        expect(response['body'].data['color']).toEqual('Cloudy White');

    })
})