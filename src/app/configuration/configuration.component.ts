import { Component, OnInit } from '@angular/core';
import { AutoAdderConfiguration, ConfiguratorService } from '../services/configurator.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  
  protected currentConfig: AutoAdderConfiguration;
  constructor(private config: ConfiguratorService) { 
    this.currentConfig = config.loadConfig();
  }

  ngOnInit(): void {
  }

  saveConfiguration(){
    this.config.saveConfiguration(this.currentConfig);
  }
}
