export const mockConfigService = {
    get: jest.fn((key: string) => {
        const env = {
            AZURE_OPENAI_API_KEY: 'mock-openai-key',
            AZURE_OPENAI_URL: 'https://mock-url.com/openai',
            COSMOS_DB_CONNECTION_STRING: 'AccountEndpoint=https://mock-cosmos-db.documents.azure.com:443/;AccountKey=mock-key;',
            AZURE_STORAGE_CONNECTION_STRING: 'DefaultEndpointsProtocol=https;AccountName=mockaccount;AccountKey=mockkey;BlobEndpoint=https://mockaccount.blob.core.windows.net/;',
        };
        return env[key];
    }),
};