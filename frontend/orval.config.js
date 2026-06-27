export default {
  itamApi: {
    input: {
      target: 'http://localhost:8080/api-docs',
    },
    output: {
      mode: 'tags-split',
      target: './src/api-generated/endpoints',
      schemas: './src/api-generated/models',
      client: 'axios-functions',
      override: {
        mutator: {
          path: './src/api/axiosInstance.ts',
          name: 'customAxiosInstance',
        },
      },
    },
  },
};
