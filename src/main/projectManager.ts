import chokidar, { FSWatcher } from "chokidar";
import Path from "path";

const awaitWriteFinish = {
  stabilityThreshold: 1000,
  pollInterval: 100,
};

export default class ProjectManager {
  private projectRoot?: string;
  //Watchers
  private spriteWatcher?: FSWatcher;

  async loadProject(filename: string) {
    await this.closeProject();
    this.projectRoot = Path.dirname(filename);

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

  async closeProject() {
    await this.spriteWatcher?.close();
    this.projectRoot = "";
  }

  getRoot() {
    return this.projectRoot;
  }
}

// @TODO Implement projectManager (or remove it)
// createProject
// etc.
