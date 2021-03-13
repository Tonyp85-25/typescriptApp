// Code goes here!

enum ProjectStatus{
    Active,
    Finished
}
//Project type
class Project{
    constructor(public id:string,public title:string, public description: string, public people: number,
                public status:ProjectStatus){

    }
}
type Listener<T>= (items:T[]) => void

class State <T>{
    protected listeners: Listener<T>[] =[]
    addListener(listenerFn:Listener<T>){
        this.listeners.push(listenerFn)
    }
}
// Project State Management
class ProjectState extends State <Project>{
    private projects: any[] = []
    private static instance: ProjectState;

    private constructor() {
        super()
    }

    static getInstance(){
        if (this.instance){
            return this.instance
        }else{
            this.instance =new ProjectState()
            return this.instance
        }
    }

    addProject(title:string,description:string, numOfPeople:number, status: ProjectStatus = ProjectStatus.Active){
        const newProject =
            new Project(Math.random().toString(),title,description,numOfPeople,status)

        this.projects.push(newProject)
        for (const listenerFn of this.listeners){
            listenerFn(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance()
// validation
interface Validatable {
    value:number|string
    required?: boolean
    minLength?: number
    maxLength?: number
    min?:number
    max?:number
}
function validate(validatableInput:Validatable){
    let isValid=true
    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().length !== 0
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === 'string'){
        isValid =isValid && validatableInput.value.length >= validatableInput.minLength
    }
    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string'){
        isValid =isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if(validatableInput.min != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if(validatableInput.max != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value <= validatableInput.max
    }
    return isValid
}

function autoBind(_:any,
      _2:string,
      descriptor:PropertyDescriptor){
    const originalMethod = descriptor.value
    const adjDescriptor:PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn =originalMethod.bind(this)
            return boundFn
        }
    }
    return adjDescriptor
}

abstract class Component <T extends HTMLElement,U extends HTMLElement> {
    templateElement : HTMLTemplateElement
    hostElement:T
    element:U

    constructor(templateId: string,hostElementId:string,insertAtStart:boolean, newElementId?:string){
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!
        this.hostElement = <T>document.getElementById(hostElementId)!
        const importedNode = document.importNode(this.templateElement.content,true)
        this.element =importedNode.firstElementChild as U
        if(newElementId){
            this.element.id=newElementId
        }
        this.attach(insertAtStart)
    }
    private attach(insertAtBeginning:boolean){
        this.hostElement.insertAdjacentElement(insertAtBeginning? 'afterbegin':'beforeend',this.element)
    }
    abstract configure():void
    abstract renderContent():void

}
//
class ProjectList extends Component <HTMLDivElement,HTMLElement>{

    assignedProjects: any[]

    constructor(private type: 'active'|'finished') {
        super('project-list','app',false, `${type}-projects`)
        this.assignedProjects=[]
        this.configure()
        this.renderContent()
    }

    configure(){
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
            const listItem = document.createElement('li')
            listItem.textContent = prjItem.title
            listEl.appendChild(listItem )
        }
    }
    renderContent(){
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

}

class ProjectInput extends Component<HTMLDivElement,HTMLFormElement >{
    titleInputElement : HTMLInputElement
    descriptionInputElement : HTMLInputElement
    peopleInputElement : HTMLInputElement

    constructor(){
        super('project-input','app',true,'user-input')
        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')
        this.configure()
    }
    private gatherUserInput():[string,string,number] | void{
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titleValidatable :Validatable=
        {value:enteredTitle,required:true,minLength:5}

        const descriptionValidatable : Validatable=
            {value:enteredDescription,required:true, minLength:5}

        const peopleValidatable : Validatable= {value: +enteredPeople,required:true, min:1, max:5}
        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable ) ||
            !validate(peopleValidatable)
        ){
            alert('Invalid input, please try again!')
        }else{
            return [enteredTitle,enteredDescription,+enteredPeople]
        }

    }

    private clearInputs(){
        this.titleInputElement.value =''
        this.peopleInputElement.value =''
        this.descriptionInputElement.value =''
    }

    @autoBind
    private submitHandler(evt:Event){
        evt.preventDefault()
        const userInput = this.gatherUserInput()
        if(Array.isArray(userInput)){
            const [title,desc,people] = userInput
            projectState.addProject(title, desc, people)
            this.clearInputs()
        }

    }
   configure(){
        this.element.addEventListener('submit', this.submitHandler)
    }
    renderContent() {
    }


}
const projectInput= new ProjectInput()
const activePrjLIst = new ProjectList('active')
const finishedPrjLIst = new ProjectList('finished')