import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AutoAdderConfiguration, ConfiguratorService } from '../services/configurator.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  
  @Output() closedEvent = new EventEmitter();

  protected currentConfig: AutoAdderConfiguration;
  constructor(private config: ConfiguratorService) { 
    this.currentConfig = config.loadConfig();
  }

  ngOnInit(): void {
  }

  saveConfiguration(){
    this.config.saveConfiguration(this.currentConfig);
  }

  clearData(){
    this.config.clearData();
    window.location.href = "";
  }

  close(){
    this.closedEvent.emit();
  }
}
