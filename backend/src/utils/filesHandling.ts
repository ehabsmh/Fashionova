import fs from "fs";

export const fileExist = async (path: string) => {
  try {
    await fs.promises.stat(path);
    return true;
  } catch {
    return false;
  }
}
