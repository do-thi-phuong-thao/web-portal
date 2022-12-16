import executeRequest from 'src/modules/api/executeRequest';

const responseData = {
  test: 'test',
};

beforeAll(() => {
  global.fetch = jest.fn((url: string) =>
    Promise.resolve({
      ...(url.includes('error')
        ? {
            ok: false,
            status: 500,
          }
        : {
            ok: true,
            status: 200,
          }),
      headers: {},
      blob: () => Promise.resolve(url.includes('bad-data') ? null : responseData),
      json: () => Promise.resolve(url.includes('bad-data') ? null : responseData),
    })
  ) as unknown as typeof fetch;
});

describe('executeRequest', () => {
  it('Should execute successfully request', async () => {
    const { data } = await executeRequest({
      url: 'https://samsung.com/test',
      query: responseData,
    });

    expect(data).toEqual(responseData);
  });

  it('[NEGATIVE] Should execute failure request', async () => {
    expect.assertions(1);

    try {
      const response = await executeRequest({
        url: 'https://samsung.com/error',
      });

      response.data;
    } catch (e) {
      expect(String(e)).toMatch('500');
    }
  });

  it('[NEGATIVE] Should execute failure request with manual check error', async () => {
    expect.assertions(1);

    try {
      const response = await executeRequest({
        url: 'https://samsung.com/error',
      });

      response.checkError();
    } catch (e) {
      expect(String(e)).toMatch('500');
    }
  });

  it('[NEGATIVE] Should execute successfully request with broken response data', async () => {
    const { data } = await executeRequest({
      url: 'https://samsung.com/bad-data',
      query: responseData,
    });

    expect(data).toBeNull();
  });
});
