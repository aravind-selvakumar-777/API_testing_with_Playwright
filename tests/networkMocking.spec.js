const { test, expect } = require('@playwright/test');
const payload = require('../test-data/data.json');

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
    });

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
    });

    test('INTERCEPTING a GET request and MANUALLY sending a FAKE response', async ({ page }) => {
        await page.route('**/anime', async (route) => {
            //INTERCEPTING & FULFILLING THE REQUEST WITH EXISTING MOCKED DATA AND STATUS
            await route.fulfill({
                status: 404,
                body: JSON.stringify(payload.postPayload)
            });
        });
        //SENDING THE ORIGINAL REQUEST THROUGH JS FETCH
        const response = await page.evaluate(async () => {
            const res = await fetch('https://api.jikan.moe/v4/top/anime');
            return {
                status: res.status,
                body: await res.json()
            };
        });
        expect(response.status).toBe(404)
        expect(response['body'].name).toEqual('Apple MacBook Pro 423');
    });

    test('INTERCEPTING a GET response, modifying it and sending the modified response', async ({ page }) => {
        await page.route('**/books', async (route) => {
            //FETCHING THE RESULT OF THE REQUEST
            const response = await route.fetch();
            const body = await response.json();
            //MOCKING PART OF THE RESPONSE
            body[0].title = "404! ERROR TITLE NOT FOUND!"
            //FULFILLING THE REQUEST WITH MOCKED DATA AND STATUS
            await route.fulfill({
                json: body,
                status: 500
            })
        });
        //SENDING THE ORIGINAL REQUEST THROUGH JS FETCH
        const response = await page.evaluate(async () => {
            const res = await fetch('https://potterapi-fedeperin.vercel.app/en/books');
            return {
                status: res.status,
                body: await res.json()
            };
        });
        expect(response.status).toBe(500)
        expect(response['body'].every(name => name.title != `Harry Potter and the Sorcerer's Stone`)).toBeTruthy();
        expect(response['body'][0].title).toContain('ERROR')
    });

    test('Aborting requests', async ({ page }) => {
        await page.route('**/books', route => route.abort());
        await expect(page.evaluate(() => {
            return fetch('https://potterapi-fedeperin.vercel.app/en/books');
        })).rejects.toThrow('Failed to fetch');
    });


});

