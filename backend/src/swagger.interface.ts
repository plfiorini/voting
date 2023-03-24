interface SwaggerDocument {
    openapi: string;
    info: {
      title: string;
      version: string;
    };
    paths: {
      [key: string]: {
        [key: string]: {
          summary: string;
          requestBody: {
            required: boolean;
            content: {
              [key: string]: {
                schema: {
                  type: string;
                  properties: {
                    [key: string]: {
                      type: string;
                    };
                  };
                };
              };
            };
          };
          responses: {
            [key: string]: {
              description: string;
            };
          };
        };
      };
    };
  }

  export default SwaggerDocument;