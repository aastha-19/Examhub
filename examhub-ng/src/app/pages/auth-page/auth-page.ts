import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import ThemeToggle from '../../components/theme-toggle/theme-toggle';
import { AuthService } from '../../core/auth';
import { ApiService } from '../../core/api';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggle],
  templateUrl: './auth-page.html'
})
export default class AuthPage implements OnInit {
  isLogin = true;
  formData = { name: '', email: '', password: '', confirmPassword: '', role: '', sapid: '' };
  error = '';
  showPassword = false;
  isDarkMode = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('light-mode') ? false : true;
    if (this.auth.isLoggedIn()) {
      const user = this.auth.getUser();
      if (user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN') {
        this.router.navigate(['/teacher']);
      } else {
        this.router.navigate(['/student']);
      }
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }

  toggleLoginMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
  }

  async handleSubmit(e: Event, form?: any) {
    e.preventDefault();
    if (form && form.invalid) return;
    this.error = '';

    if (!this.isLogin) {
      if (!this.formData.role) { this.error = 'Please select a role.'; return; }
      if (this.formData.password !== this.formData.confirmPassword) { this.error = 'Passwords do not match!'; return; }
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
      if (!passwordRegex.test(this.formData.password)) {
        this.error = 'Password must contain at least one number and one special character (!@#$%^&*).';
        return;
      }
    }

    try {
      if (this.isLogin) {
        this.api.post<any>('/auth/login', { email: this.formData.email, password: this.formData.password }, { responseType: 'text' }).subscribe({
          next: (token) => this.onAuthSuccess(token),
          error: (err) => this.error = err.error?.error || err.error?.message || 'Login failed'
        });
      } else {
        this.api.post('/auth/register', this.formData).subscribe({
          next: () => {
            this.api.post<any>('/auth/login', { email: this.formData.email, password: this.formData.password }, { responseType: 'text' }).subscribe({
              next: (token) => this.onAuthSuccess(token),
              error: (err) => this.error = 'Registration succeeded, but auto-login failed. Please sign in.'
            });
          },
          error: (err) => {
            if (typeof err.error === 'object' && err.error !== null) {
              this.error = Object.values(err.error).join(', ');
            } else {
              this.error = err.error?.error || err.error?.message || 'Registration failed';
            }
          }
        });
      }
    } catch (err: any) {
      this.error = 'An unexpected error occurred.';
    }
  }

  onAuthSuccess(token: string) {
    this.auth.setToken(token);
    const user = this.auth.getUser();
    if (user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN') {
      this.router.navigate(['/teacher']);
    } else {
      this.router.navigate(['/student']);
    }
  }
}
