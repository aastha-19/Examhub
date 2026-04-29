import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth';
import ThemeToggle from '../../components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggle],
  templateUrl: './teacher-dashboard.html'
})
export default class TeacherDashboard implements OnInit {
  exams: any[] = [];
  newExam = { title: '', subject: '', description: '', targetClass: '', durationMinutes: 60, positiveMarksPerQuestion: 1, negativeMarksPerQuestion: 0.25 };
  selectedExam: any = null;
  dialogMessage: string | null = null;
  
  selectedSubject: string | null = null;

  examResults: any = null;
  viewingResultsExamName: string = '';
  
  newQuestion = { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', questionType: 'MULTIPLE_CHOICE' };
  imageFile: File | null = null;
  isDarkMode = false;

  constructor(private api: ApiService, public authService: AuthService) {}

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('light-mode') ? false : true;
    this.loadExams();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }

  dismissDialog() {
    this.dialogMessage = null;
  }

  loadExams() {
    this.api.get<any[]>('/api/exams').subscribe({
      next: (data) => this.exams = data,
      error: () => this.dialogMessage = "Failed to load exams"
    });
  }

  handleCreateExam(e: Event, form?: any) {
    e.preventDefault();
    if (form && form.invalid) return;
    this.api.post('/api/exams/create', this.newExam).subscribe({
      next: () => {
        this.dialogMessage = "Exam Created!";
        this.newExam = { ...this.newExam, title: '', description: '' };
        this.loadExams();
      },
      error: (err) => this.dialogMessage = err.error?.message || err.message
    });
  }

  handleDeleteExam(examId: number, e: Event) {
    e.stopPropagation();
    this.api.delete(`/api/exams/${examId}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.dialogMessage = "Exam Deleted!";
        if (this.selectedExam?.id === examId) this.selectedExam = null;
        this.loadExams();
      },
      error: (err) => {
          let msg = err.error?.error || err.error?.message;
          if (!msg && err.error && typeof err.error === 'object') {
              msg = Object.values(err.error).join(', ');
          }
          this.dialogMessage = msg || (typeof err.error === 'string' ? err.error : err.message);
      }
    });
  }

  async handleViewResults(exam: any, e: Event) {
    e.stopPropagation();
    try {
      this.api.get(`/api/results/exam/${exam.id}`).subscribe(res => {
         this.api.get(`/api/results/exam/${exam.id}/analytics`).subscribe(analytics => {
            this.api.get(`/api/results/exam/${exam.id}/leaderboard`).subscribe(leaderboard => {
                this.examResults = { all: res, analytics, leaderboard };
                this.viewingResultsExamName = exam.title;
            });
         });
      });
    } catch (err: any) {
      this.dialogMessage = "Failed to fetch results: " + err.message;
    }
  }

  handleAddQuestion(e: Event, form?: any) {
    e.preventDefault();
    if (form && form.invalid) return;
    this.api.post<any>(`/api/exams/${this.selectedExam.id}/questions`, this.newQuestion).subscribe({
      next: (qData) => {
        if (this.imageFile) {
          const formData = new FormData();
          formData.append('file', this.imageFile);
          this.api.post(`/api/exams/questions/${qData.id}/image`, formData).subscribe();
        }
        this.dialogMessage = "Question Added Successfully!";
        this.newQuestion = { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', questionType: 'MULTIPLE_CHOICE' };
        this.imageFile = null;
      },
      error: (err) => this.dialogMessage = "Failed to add question: " + err.message
    });
  }

  onFileChange(e: any) {
      this.imageFile = e.target.files[0];
  }

  get subjects(): string[] {
    const subs = this.exams.map(e => e.subject || 'Uncategorized');
    return [...new Set(subs)];
  }

  get filteredExams() {
    return this.exams.filter(e => (e.subject || 'Uncategorized') === this.selectedSubject);
  }

  getExamsForSubject(sub: string): any[] {
    return this.exams.filter(e => (e.subject || 'Uncategorized') === sub);
  }

  getQuestionIds(metrics: any): string[] {
    return metrics ? Object.keys(metrics) : [];
  }
}
