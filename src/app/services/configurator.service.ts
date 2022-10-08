import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfiguratorService {

  public configObject: AutoAdderConfiguration;
  constructor() {
    this.configObject = this.loadConfig();
  }
  ngOnInit(): void {
    this.loadConfig();
  }

  private loadConfig() {
    let json = localStorage.getItem("configuration");
    if (json != null) {
      return JSON.parse(json);
    }
    else
      return new AutoAdderConfiguration(false, 80, false, 20, false, false, false);
  }
  saveConfiguration(config: AutoAdderConfiguration) {
    localStorage.setItem("configuration", JSON.stringify(config));
    this.configObject = config;
  }
  clearData() {
    localStorage.clear();
  }
}
export class AutoAdderConfiguration {
  public autoAdd: boolean = false
  public whenToAdd: number = 80;
  public autoRemove: boolean = false;
  public whenToRemove: number = 20;

  public custom_enabled: boolean = false;
  public custom_randomMode: boolean = false;
  public custom_recommendedSongs: boolean = false;

  constructor(autoADD: boolean, whenToAdd: number, autoRemove: boolean, whenToRemove: number, custom_randomMode: boolean, custom_recommendedSongs: boolean, custom_enabled: boolean) {
    this.autoAdd = autoADD;
    this.whenToAdd = whenToAdd;
    this.autoRemove = autoRemove;
    this.whenToRemove = whenToRemove;
    this.custom_randomMode = custom_randomMode;
    this.custom_recommendedSongs = custom_recommendedSongs;
    this.custom_enabled = custom_enabled;
  }
}