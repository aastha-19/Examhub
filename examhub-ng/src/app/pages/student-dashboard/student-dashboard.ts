import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth';
import { BaseChartDirective } from 'ng2-charts';
import ThemeToggle from '../../components/theme-toggle/theme-toggle';
import { forkJoin } from 'rxjs';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, ThemeToggle],
  templateUrl: './student-dashboard.html'
})
export default class StudentDashboard implements OnInit, AfterViewChecked {
  activeTab: 'subjects' | 'results' | 'progress' = 'subjects';
  @ViewChild('progressChart') progressChartRef!: ElementRef;
  exams: any[] = [];
  results: any[] = [];
  selectedSubject: string | null = null;
  loading: boolean = true;
  examResults: any = null;
  performanceData: any = null;
  chartInstance: any = null;
  isDarkMode = false;

  constructor(private api: ApiService, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('light-mode') ? false : true;
    this.loadData();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }

  loadData() {
    this.loading = true;
    const user = this.authService.getUser();
    const userId = user?.userId || 1;

    forkJoin({
      exams: this.api.get<any[]>('/api/exams'),
      results: this.api.get<any[]>(`/api/results/user/${userId}`)
    }).subscribe({
      next: (data) => {
        this.exams = data.exams;
        this.results = data.results;
        this.loading = false;
      },
      error: (err) => {
        console.error("Failed to load dashboard data", err);
        this.loading = false;
      }
    });
  }

  get subjects(): string[] {
    const subs = this.exams.map(e => e.subject || 'Uncategorized');
    return [...new Set(subs)];
  }

  get richResults(): any[] {
    return this.results.map(res => {
      const examMatch = this.exams.find(e => e.id === res.examId);
      return {
        ...res,
        examTitle: examMatch ? examMatch.title : 'Unknown Exam',
        examSubject: examMatch ? examMatch.subject : 'Unknown Subject'
      };
    }).sort((a, b) => b.id - a.id);
  }

  getExamsForSubject(subject: string): any[] {
    return this.exams.filter(e => (e.subject || 'Uncategorized') === subject);
  }

  formatDateTime(dateVal: any): string {
    if (!dateVal) return "N/A";
    if (Array.isArray(dateVal)) {
      const [y, m, d, h, min] = dateVal;
      return new Date(y, m - 1, d, h, min).toLocaleString();
    }
    return new Date(dateVal).toLocaleString();
  }

  ngAfterViewChecked() {
    if (this.activeTab === 'progress' && this.progressChartRef && !this.chartInstance) {
      this.renderProgressChart();
    }
  }

  renderProgressChart() {
    const ctx = this.progressChartRef.nativeElement.getContext('2d');
    const chartData = [...this.richResults].reverse(); // oldest first for chron graph
    
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.map(r => this.formatDateTime(r.attemptedAt).split(',')[0]), // dates
        datasets: [{
          label: 'Score Percentage',
          data: chartData.map(r => (r.correctAnswers / r.totalQuestions) * 100),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }

  getPassStatus(res: any) {
    const percentage = (res.correctAnswers / res.totalQuestions) * 100;
    return percentage >= 50 ? { label: 'Passed', color: 'var(--success)' } : { label: 'Needs Improvement', color: 'var(--danger)' };
  }

  startExam(examId: number) {
    this.router.navigate([`/exam/${examId}`]);
  }
}
