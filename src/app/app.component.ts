import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MqttService } from './shared/services/mqtt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private translate: TranslateService,
    private mqttSer: MqttService
  ) {
    translate.setDefaultLang('en');
    this.mqttSer.subscribe('TECHNOID/TEST/#');
  }
}
