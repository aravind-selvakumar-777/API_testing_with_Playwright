const { test, expect, request } = require('@playwright/test');
const payload = require('../test-data/data.json');

test.describe('REST API TESTS', function () {
    let apiContext;
    test.beforeEach(async function () {
        apiContext = await request.newContext({
            baseURL: 'https://api.restful-api.dev'
        });
    });
    test.afterEach(async function () {
        await apiContext.dispose();
    });
    test('GET all request', async () => {
        const response = await apiContext.get('/objects');
        const responseJSON = await response.json();
        expect(await response.status()).toBe(200)
        expect(responseJSON.some(itemName => itemName.name === 'Apple iPhone 12 Pro Max')).toBeTruthy();
    });

    test('GET single request with search paramter', async () => {
        const response = await apiContext.get('/objects', {
            params: {
                id: 7
            }
        });
        const responseJSON = await response.json();
        expect(response.ok()).toBeTruthy()
        expect(await response.status()).toBe(200)
        expect(responseJSON[0].name).toEqual('Apple MacBook Pro 16');
    });

    test('POST request', async () => {
        const response = await apiContext.post('/objects', {
            data: JSON.stringify(payload.postPayload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const responseJSON = await response.json();
        expect(await response.status()).toBe(200)
        expect(responseJSON).toHaveProperty('id');
        expect(responseJSON).toHaveProperty('name', 'Apple MacBook Pro 423');
        const currentDate = new Date().toISOString().split('T')[0];
        expect(responseJSON.createdAt).toContain(currentDate)
    });

    test('PUT request', async () => {
        //CREATING DATA TO BE UPDATED WITH PUT
        const postResponse = await apiContext.post('/objects', {
            data: JSON.stringify(payload.postPayload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const postResponseJSON = await postResponse.json();
        expect(postResponse.ok()).toBeTruthy();
        const id = postResponseJSON.id;

        const response = await apiContext.put(`/objects/${id}`, {
            data: JSON.stringify(payload.putpayload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const responseJSON = await response.json();
        expect(await response.status()).toBe(200)
        expect(responseJSON).toHaveProperty('id', id);
        expect(responseJSON.data).toHaveProperty('RAM', '512 mb');
        const currentDate = new Date().toISOString().split('T')[0];
        expect(responseJSON.updatedAt).toContain(currentDate)
    });

    test('PATCH request', async () => {
        //CREATING DATA TO BE UPDATED WITH PATCH
        const postResponse = await apiContext.post('/objects', {
            data: JSON.stringify(payload.postPayload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const postResponseJSON = await postResponse.json();
        expect(postResponse.ok()).toBeTruthy();
        const id = postResponseJSON.id;

        const response = await apiContext.patch(`/objects/${id}`, {
            data: JSON.stringify(payload.patchPayload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const responseJSON = await response.json();
        expect(await response.status()).toBe(200)
        expect(responseJSON).toHaveProperty('id', id);
        expect(responseJSON).toHaveProperty('name', 'Apple MacBook Pro 420(UPDATED NOW)');
        const currentDate = new Date().toISOString().split('T')[0];
        expect(responseJSON.updatedAt).toContain(currentDate)
    });

    test('DELETE request', async () => {
        //CREATING DATA TO BE DELETED
        const postResponse = await apiContext.post('/objects', {
            data: JSON.stringify(payload.postPayload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const postResponseJSON = await postResponse.json();
        expect(postResponse.ok()).toBeTruthy();
        const id = postResponseJSON.id;

        const response = await apiContext.delete(`/objects/${id}`);
        const responseJSON = await response.json();
        expect(await response.status()).toBe(200)
        expect(responseJSON.message).toContain(id)

        //ADDITIONAL ASSERTION WITH GET TO ENSURE DELETION
        const getResponse = await apiContext.get('/objects', {
            params: {
                id: id
            }
        });
        const res = await getResponse.json();
        expect(res).toEqual([])
    });
});

