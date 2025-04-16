import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type RepoData = Record<
  string,
  {
    repoUrl: string;
    localFolder: string;
    branch: string;
    source: string[];
    target: string[];
  }
>;

export const test = base.extend<{
  testRepoData: RepoData;
}>({
  testRepoData: async ({}, use) => {
    const jsonPath = path.resolve(__dirname, './test-repos.json');
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data: RepoData = JSON.parse(raw);
    await use(data);
  },
});

export { expect } from '@playwright/test';
