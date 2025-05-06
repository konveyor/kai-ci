import { LLMProviders } from '../enums/llm-providers.enum';

export interface ProviderConfig {
  model: string;
  provider: LLMProviders;
  config: string;
}

export const DEFAULT_PROVIDER: ProviderConfig = {
  provider: LLMProviders.awsBedrock,
  model: 'meta.llama3-70b-instruct-v1:0',
  config: [
    'models:',
    '  AmazonBedrock: &active',
    '    provider: "ChatBedrock"',
    '    args:',
    '      model_id: "meta.llama3-70b-instruct-v1:0"',
    'active: *active',
  ].join('\n'),
};
export const OPENAI_PROVIDER: ProviderConfig = {
  provider: LLMProviders.openAI,
  model: 'gpt-4o-mini',
  config: [
    'models:',
    '  OpenAI: &active',
    '    environment:',
    `      OPENAI_API_KEY: "${process.env.OPENAI_API_KEY}"`,
    '    provider: "ChatOpenAI"',
    '    args:',
    '      model: "gpt-4o-mini"',
    'active: *active',
  ].join('\n'),
};

export const providerConfigs: ProviderConfig[] = [
  OPENAI_PROVIDER,
  DEFAULT_PROVIDER,
];
