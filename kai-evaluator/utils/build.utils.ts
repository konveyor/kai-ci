import { exec } from 'node:child_process';

export function isBuildable(path: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec(`cd ${path} && mvn clean install`, (error, stdout, stderr) => {
      console.log('MVN CLEAN INSTALL output: ');
      console.log(stdout);
      if (error) {
        console.error('MVN CLEAN INSTALL error: ');
        console.error(stderr);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
