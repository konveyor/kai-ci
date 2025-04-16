import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type RepoData = Record<
  string,
  {
    repoUrl: string;
    repoName: string;
    branch: string;
    sources: string[];
    targets: string[];
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
