import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfiguratorService {
  
  constructor() { 
  }
  ngOnInit(): void {
  }

  loadConfig(){
    let json = localStorage.getItem("configuration");
    if(json != null)
    {
      let result = JSON.parse(json);
      return result;
    }
    else
      return new AutoAdderConfiguration(false, 80, false, 20);
  }
  saveConfiguration(config: AutoAdderConfiguration){
    localStorage.setItem("configuration", JSON.stringify(config));
  }
  clearData(){
    localStorage.clear();
  }
}
export class AutoAdderConfiguration{
  public autoAdd: boolean = false
  public whenToAdd:number = 80;
  public autoRemove: boolean = false;
  public whenToRemove: number = 20;
  constructor(autoADD: boolean, whenToAdd: number, autoRemove: boolean, whenToRemove: number){
    this.autoAdd = autoADD;
    this.whenToAdd = whenToAdd;
    this.autoRemove = autoRemove;
    this.whenToRemove = whenToRemove;
  }
}