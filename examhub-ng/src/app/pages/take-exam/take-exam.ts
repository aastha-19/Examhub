import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './take-exam.html'
})
export default class TakeExam implements OnInit, OnDestroy {
  id: string | null = null;
  exam: any = null;
  questions: any[] = [];
  answers: { [key: number]: string } = {};
  bookmarkedQuestions = new Set<string>();
  result: any = null;
  
  dialogState = { message: null as string | null, onConfirm: null as any, showCancel: false };
  
  timeLeft: number | null = null;
  timerInterval: any;

  tabSwitches: number = 0;
  blurListener: any;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) this.fetchData(this.id);
    });

    this.blurListener = () => {
      if (!this.result && this.exam) {
        this.tabSwitches++;
        alert(`WARNING: You have switched tabs/windows! Total warnings: ${this.tabSwitches}. Further violations may invalidate your exam.`);
      }
    };
    window.addEventListener('blur', this.blurListener);
  }

  fetchData(examId: string) {
    // Lock server-side timer
    this.api.post(`/api/results/start/${examId}`, {}, { responseType: 'text' }).subscribe({
       error: (err) => console.error("Start Timer Warning:", err)
    });

    this.api.get<any>(`/api/exams/${examId}`).subscribe({
      next: (ex) => {
        this.exam = ex;
        if (ex.durationMinutes) {
          this.timeLeft = ex.durationMinutes * 60;
          this.startTimer();
        }
      },
      error: () => this.showDialog("Failed to load exam details.")
    });

    this.api.get<any[]>(`/api/exams/${examId}/questions`).subscribe({
      next: (qs) => this.questions = qs
    });

    this.api.get<any[]>('/api/exams/bookmarks').subscribe({
      next: (marks) => {
        marks.forEach(m => this.bookmarkedQuestions.add(m.questionId.toString()));
      }
    });
  }

  toggleBookmark(qId: number) {
    const qStr = qId.toString();
    if (this.bookmarkedQuestions.has(qStr)) {
       this.bookmarkedQuestions.delete(qStr);
    } else {
       this.bookmarkedQuestions.add(qStr);
    }
    this.api.post(`/api/exams/bookmarks/${this.id}/questions/${qId}`, {}, { responseType: 'text' }).subscribe();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft !== null) {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.executeSubmit();
        }
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.blurListener) window.removeEventListener('blur', this.blurListener);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.result) {
      $event.returnValue = "Are you sure you want to leave? Your progress will be lost.";
    }
  }

  showDialog(message: string, onConfirm: any = null, showCancel = false) {
    this.dialogState = { message, onConfirm, showCancel };
  }

  closeDialog() {
    this.dialogState = { message: null, onConfirm: null, showCancel: false };
  }

  handleSelectAnswer(qId: number, option: string) {
    this.answers[qId] = option;
  }

  executeSubmit() {
    this.closeDialog();
    if (this.timerInterval) clearInterval(this.timerInterval);

    const user = this.auth.getUser();
    let studentName = user?.name || "Unknown";
    let studentEmail = user?.sub || user?.email || "unknown@uni.edu";
    let userId = user?.userId || 1;

    const payload = {
        examId: Number(this.id),
        userId: userId, 
        studentName: studentName,
        studentEmail: studentEmail,
        answers: this.answers,
        tabSwitches: this.tabSwitches
    };

    this.api.post('/api/results/submit', payload).subscribe({
      next: (res) => this.result = res,
      error: (err) => this.showDialog(err.error?.message || err.message)
    });
  }

  handleSubmit() {
    this.showDialog("Are you sure you want to submit?", () => this.executeSubmit(), true);
  }

  formatTime(seconds: number | null): string {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  getAnswersObj() {
    return this.answers;
  }
}
