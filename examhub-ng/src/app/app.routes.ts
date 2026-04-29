import { Routes } from '@angular/router';
import AuthPage from './pages/auth-page/auth-page';
import StudentDashboard from './pages/student-dashboard/student-dashboard';
import TeacherDashboard from './pages/teacher-dashboard/teacher-dashboard';
import TakeExam from './pages/take-exam/take-exam';

export const routes: Routes = [
    { path: '', component: AuthPage },
    { path: 'student', component: StudentDashboard },
    { path: 'teacher', component: TeacherDashboard },
    { path: 'exam/:id', component: TakeExam },
    { path: '**', redirectTo: '' }
];
