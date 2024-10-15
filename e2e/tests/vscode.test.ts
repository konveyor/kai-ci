import { test } from "@playwright/test";
import { LaunchVSCodePage } from "../pages/vscode.pages";

test.describe("VSCode Extension Installation from VSIX", () => {
  const vscodePage = new LaunchVSCodePage();

  test("VSCode launches and has correct window title", async () => {
    const executablePath = process.env.VSCODE_EXECUTABLE_PATH;
    await vscodePage.launchVSCode(executablePath);
  });

  test("should install extension from a VSIX file in VSCode", async ({
    page,
  }) => {
    const vsixFilePath = process.env.VSIX_FILE_PATH;
    await vscodePage.installExtensionFromVSIX(vsixFilePath);
    await page.pause();
  });
});
