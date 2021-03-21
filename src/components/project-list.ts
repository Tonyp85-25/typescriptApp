
    // ProjectList Class
    import {Component} from "./base-component";
    import {DragTarget} from "../models/drag-drop";
    import {projectState} from "../state/project-state";
    import {Project, ProjectStatus} from "../models/project";
    import {ProjectItem} from "./project-item";
    import {autoBind} from "../decorators/autobind";

    export class ProjectList extends Component <HTMLDivElement,HTMLElement> implements DragTarget{

        assignedProjects: Project[]

        constructor(private type: 'active'|'finished') {
            super('project-list','app',false, `${type}-projects`)
            this.assignedProjects=[]
            this.configure()
            this.renderContent()
        }

        configure(){
            this.element.addEventListener("dragover",this.dragOverHandler)
            this.element.addEventListener("dragleave",this.dragLeaveHandler)
            this.element.addEventListener("drop",this.dropHandler)
            projectState.addListener((projects:Project[])=> {
                const relevantProjects = projects.filter(prj => {
                    if (this.type === 'active') {
                        return prj.status === ProjectStatus.Active
                    } else {
                        return prj.status === ProjectStatus.Finished
                    }
                })
                this.assignedProjects = relevantProjects
                this.renderProjects()
            })
        }

        private renderProjects(){
            const listEl = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)
            listEl.innerHTML=''
            for (let prjItem of this.assignedProjects){
                new ProjectItem(this.element.querySelector('ul')!.id,prjItem)
            }
        }
        renderContent(){
            const listId = `${this.type}-projects-list`
            this.element.querySelector('ul')!.id = listId
            this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
        }

        @autoBind
        dragLeaveHandler(_: DragEvent) {
            const listEl = this.element.querySelector('ul')!
            listEl.classList.remove('droppable')
        }

        @autoBind
        dragOverHandler(evt: DragEvent) {
            if(evt.dataTransfer && evt.dataTransfer.types[0] === 'text/plain'){
                evt.preventDefault()
                const listEl = this.element.querySelector('ul')!
                listEl.classList.add('droppable')
            }

        }
        @autoBind
        dropHandler(evt: DragEvent) {
            const prjId = evt.dataTransfer!.getData('text/plain')
            projectState.moveProject(prjId, this.type === 'active'? ProjectStatus.Active: ProjectStatus.Finished)
        }

    }

