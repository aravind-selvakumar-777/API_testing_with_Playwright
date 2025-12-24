const { test, expect, request } = require('@playwright/test');
const payload = require('../test-data/data.json');

test.describe('GraphQL API TESTS', function () {
    let apiContext;
    test.beforeEach(async function () {
        apiContext = await request.newContext({
            baseURL: 'https://graphqlplaceholder.vercel.app',
            extraHTTPHeaders: {
                'content-type': 'application/json'
            }
        });
    });
    test.afterEach(async function () {
        await apiContext.dispose();
    });

    test('GraphQL query request to FETCH(GET) name and email specifically', async () => {
        const response = await apiContext.post('/graphql', {
            data: JSON.stringify(payload.getQuery)
        });
        expect(await response.status()).toEqual(200);
        const responseJSON = await response.json();
        expect(responseJSON.data.userById.name).toEqual('Leanne Graham');
        expect(responseJSON.data.userById.email).toEqual('Sincere@april.biz');
        expect(await response.headers()).toHaveProperty('server', 'Vercel');
    });

    test('GraphQL mutation request to CREATE(POST) a new post resource', async () => {
        const response = await apiContext.post('/graphql', {
            data: JSON.stringify(payload.postQuery)
        });
        expect(await response.status()).toEqual(200);
        const responseJSON = await response.json();
        expect(responseJSON.data.createPost.title).toEqual('Green');
        expect(responseJSON.data.createPost.body).toEqual('Grass is greener in this side');
        expect(await response.headers()).toHaveProperty('server', 'Vercel');
    });

    test('GraphQL mutation request to UPDATE(PUT) an existing post resource', async () => {
        const response = await apiContext.post('/graphql', {
            data: JSON.stringify(payload.putQuery)
        });
        expect(await response.status()).toEqual(200);
        const responseJSON = await response.json();
        expect(responseJSON.data.updatePost.title).toEqual('Greeny');
        expect(await response.headers()).toHaveProperty('server', 'Vercel');
    });

    test('GraphQL mutation request to DELETE an existing post resource', async () => {
        const response = await apiContext.post('/graphql', {
            data: JSON.stringify(payload.deleteQuery)
        });
        expect(await response.status()).toEqual(200);
        const responseJSON = await response.json();
        expect(responseJSON.data.deletePost).toContain('successfully deleted');
        expect(await response.headers()).toHaveProperty('server', 'Vercel');
    });


});