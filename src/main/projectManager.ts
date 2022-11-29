import Project from "./project";

export default class ProjectManager {
  private static instance?: ProjectManager;
  private projects: Record<number, Project> = {};

  static getInstance(): ProjectManager {
    if (this.instance) {
      return this.instance;
    }
    const projectManager = (this.instance = new ProjectManager());
    return projectManager;
  }

  registerProject(processId: number, project: Project) {
    this.projects[processId] = project;
  }

  getProject(processId: number): Project | undefined {
    return this.projects[processId];
  }

  closeProject(processId: number) {
    const project = this.projects[processId];
    if (project) {
      project.close();
      delete this.projects[processId];
    }
  }
}
