import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.html'
})
export default class ThemeToggle {
  @Input() isDarkMode: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  get containerStyle() {
    return {
      'width': '74px',
      'height': '38px',
      'border-radius': '38px',
      'background': this.isDarkMode ? '#222' : '#f0f0f0',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'space-between',
      'padding': '0 8px',
      'position': 'relative',
      'cursor': 'pointer',
      'border': `1px solid ${this.isDarkMode ? '#444' : '#ddd'}`,
      'box-shadow': 'inset 0 2px 4px rgba(0,0,0,0.1)'
    };
  }

  get knobStyle() {
    return {
      'position': 'absolute',
      'top': '3px',
      'left': '3px',
      'width': '30px',
      'height': '30px',
      'border-radius': '50%',
      'background': '#3b82f6',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'transition': 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      'transform': this.isDarkMode ? 'translateX(36px)' : 'translateX(0)',
      'box-shadow': '0 2px 5px rgba(0,0,0,0.2)'
    };
  }

  toggleTheme() {
    this.toggle.emit();
  }
}
