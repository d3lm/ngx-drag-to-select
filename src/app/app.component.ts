import { Component, OnInit, ViewChild } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

const json = require('../lib/package.json');

@Component({
  selector: 'ngx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  documents: Array<any> = [];
  selectedDocuments: Array<any> = [];
  selectOnDrag = true;

  constructor(private titleService: Title, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('apple', sanitizer.bypassSecurityTrustResourceUrl('assets/apple-icon.svg'));
    iconRegistry.addSvgIcon('windows', sanitizer.bypassSecurityTrustResourceUrl('assets/windows-icon.svg'));
  }

  ngOnInit() {
    const currentTitle = this.titleService.getTitle();

    if (json) {
      this.titleService.setTitle(`${currentTitle}: v${json.version}`);
    }

    for (let id = 1; id <= 12; id++) {
      this.documents.push({
        id,
        name: `Document ${id}`
      });
    }
  }

  onSelect(items: Array<any>) {
    console.log('onSelect', items);
  }
}
