import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage, deleteFromStorage } from "../utils";
import { appState } from "../app";

export class Task extends BaseModel {
    constructor(description, state) {
        super();
        this.description = description;
        this.user = appState.currentUser == null ? -1 : appState.currentUser.id;
        this.login = appState.currentUser == null ? '' : appState.currentUser.login;
        this.state = state;
        this.storage = "tasks";
    }

    static save(task) {
        try {
            addToStorage(task, task.storage);
            return true;
        } catch (e) {
            throw new Error(e);
        }
    }
    
    static delete(task) {
        try {
            deleteFromStorage(task, task.storage);
            return true;
        } catch (e) {
            throw new Error(e);
        }
    }

}