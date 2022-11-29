import chokidar, { FSWatcher } from "chokidar";
import Path from "path";

const awaitWriteFinish = {
  stabilityThreshold: 1000,
  pollInterval: 100,
};

export default class Project {
  private filename: string;
  private projectRoot: string;
  //Watchers
  private spriteWatcher?: FSWatcher;

  constructor(filename: string) {
    this.filename = filename;
    this.projectRoot = Path.dirname(filename);
  }

  async watch() {
    const onAddSprite = (n: string) => console.log(`watch:add:${n}`);
    const onChangedSprite = (n: string) => console.log(`watch:update:${n}`);
    const onRemoveSprite = (n: string) => console.log(`watch:remove:${n}`);

    // Init Watchers
    const spritesRoot = `${this.projectRoot}/assets/sprites`;
    this.spriteWatcher = chokidar
      .watch(`${spritesRoot}/**/*.{png,PNG}`, {
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish,
      })
      .on("add", onAddSprite)
      .on("change", onChangedSprite)
      .on("unlink", onRemoveSprite);
  }

  async close() {
    console.log("STOP WATCHING", this.filename);
    await this.spriteWatcher?.close();
    this.projectRoot = "";
  }

  getFilename() {
    return this.filename;
  }

  getRoot() {
    return this.projectRoot;
  }
}
