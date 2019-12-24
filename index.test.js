const waitOn = require("wait-on");
const axios = require("axios");
const { API_URL = "http://localhost:8080" } = process.env;

describe("index function", () => {
  beforeAll(() => waitOn({ resources: [API_URL] }));
  test("access denied if auth is wrong", () => {
    expect.assertions(2);
    return axios
      .post(API_URL, {
        auth: process.env.AUTH_KEY.slice(0, -1)
      })
      .catch(error => {
        expect(error.response.status).toEqual(401);
        expect(error.response.data).toMatchInlineSnapshot(`"Access denied"`);
      });
  });
  test("bad request if webhooks is missing", () => {
    expect.assertions(2);
    return axios
      .post(API_URL, {
        auth: process.env.AUTH_KEY
      })
      .catch(error => {
        expect(error.response.status).toEqual(400);
        expect(error.response.data).toMatchInlineSnapshot(
          `"Required argument \\"webhooks\\" is missing or empty"`
        );
      });
  });
  test("bad request if webhooks is empty", () => {
    expect.assertions(2);
    return axios
      .post(API_URL, {
        auth: process.env.AUTH_KEY,
        webhooks: []
      })
      .catch(error => {
        expect(error.response.status).toEqual(400);
        expect(error.response.data).toMatchInlineSnapshot(
          `"Required argument \\"webhooks\\" is missing or empty"`
        );
      });
  });
  test("successfully hits two webhooks", () => {
    expect.assertions(2);
    return axios
      .post(API_URL, {
        auth: process.env.AUTH_KEY,
        webhooks: [
          "https://postman-echo.com/response-headers?value1=someValue&value2=someOtherValue",
          "https://postman-echo.com/response-headers?dog=Salvador"
        ]
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.data).toMatchInlineSnapshot(`
          "{\\"value1\\":\\"someValue\\",\\"value2\\":\\"someOtherValue\\"}
          {\\"dog\\":\\"Salvador\\"}"
        `);
      });
  });
  test("successfully hits one webhook and gets an error from another", () => {
    expect.assertions(2);
    return axios
      .post(API_URL, {
        auth: process.env.AUTH_KEY,
        webhooks: [
          "https://postman-echo.com/status/404",
          "https://postman-echo.com/response-headers?dog=Salvador"
        ]
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.data).toMatchInlineSnapshot(`
          "Error from https://postman-echo.com/status/404: {\\"status\\":404}
          {\\"dog\\":\\"Salvador\\"}"
        `);
      });
  });
});
