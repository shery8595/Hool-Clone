export interface LlmAdapter {
  generateJson<T>(input: {
    system: string;
    user: string;
    schemaName: string;
    schema: object;
  }): Promise<T>;
}
