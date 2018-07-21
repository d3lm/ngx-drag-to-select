import { Component, OnInit } from '@angular/core';
import { trigger, transition, stagger, animate, style, query } from '@angular/animations';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss'],
  animations: [
    trigger('editButtons', [
      transition('void => *', [
        query('button', style({ opacity: 0 }), { optional: true }),
        query('button', stagger('100ms', [animate('100ms ease-in', style({ opacity: 1 }))]), { optional: true })
      ]),
      transition('* => void', [
        query('button', style({ opacity: 1 }), { optional: true }),
        query('button', stagger('-100ms', [animate('100ms ease-in', style({ opacity: 0 }))]), { optional: true })
      ])
    ]),
    trigger('selectCount', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('150ms 100ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)' }),
        animate('150ms ease-in-out', style({ opacity: 1, transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms 150ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('200ms ease-in', style({ opacity: 0 }))])
    ])
  ]
})
export class PhoneComponent implements OnInit {
  contacts: Array<any> = [];
  selectMode = false;
  selectedContacts = [];

  ngOnInit() {
    for (let id = 1; id <= 12; id++) {
      this.addContact();
    }
  }

  addContact() {
    const contact = this.getRandomContact();

    this.contacts.push({
      initials: contact.name[0].toUpperCase(),
      ...contact
    });
  }

  deleteContacts(contacts: Array<any>) {
    this.contacts = this.contacts.filter(contact => !contacts.includes(contact));
    this.selectMode = false;
  }

  toggleSelectMode() {
    this.selectMode = !!this.selectedContacts.length;
  }

  private getRandomContact() {
    const names = [
      { name: 'Melba Watkins', color: '#fc5c65' },
      { name: 'Alton Johnson', color: '#fd9644' },
      { name: 'Marguerite Andrews', color: '#45aaf2' },
      { name: 'Orlando Aguilar', color: '#26de81' },
      { name: 'Larry Delgado', color: '#2bcbba' },
      { name: 'Elena Matthews', color: '#778ca3' },
      { name: 'Kurt	Neal', color: '#a55eea' },
      { name: 'Peter Gardner', color: '#a5b1c2' }
    ];

    return names[this.getRandomNumber(names.length)];
  }

  private getRandomNumber(max: number, min = 0) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
