import { Routes } from '@angular/router';
import { Constants } from './models/constants';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { ProjectComponent } from './pages/project/project.component';
import { AddEditProjectComponent } from './pages/add-edit-project/add-edit-project.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { AddEditSkillsComponent } from './pages/add-edit-skills/add-edit-skills.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { ForgotPasswordFormComponent } from './pages/forgot-password-form/forgot-password-form.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginFormComponent,
        title: `Login | ${Constants.APP_NAME}`
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordFormComponent,
        title: `Forgot Password | ${Constants.APP_NAME}`
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'home',
                component: HomeComponent,
                title: `Home | ${Constants.APP_NAME}`
            },
            {
                path: 'about',
                component: AboutComponent,
                title: `About | ${Constants.APP_NAME}`
            },
            {
                path: 'contact',
                component: ContactComponent,
                title: `Contact | ${Constants.APP_NAME}`
            },
            {
                path: 'projects',
                component: ProjectComponent,
                title: `Projects | ${Constants.APP_NAME}`
            },
            {
                path: 'add-project',
                component: AddEditProjectComponent,
                title: `Add Project | ${Constants.APP_NAME}`
            },
            {
                path: 'edit-project/:id',
                component: AddEditProjectComponent,
                title: `Edit Project | ${Constants.APP_NAME}`
            },
            {
                path: 'skills',
                component: SkillsComponent,
                title: `Skills | ${Constants.APP_NAME}`
            },
            {
                path: 'add-skill',
                component: AddEditSkillsComponent,
                title: `Add Skill | ${Constants.APP_NAME}`
            },
            {
                path: 'edit-skill/:id',
                component: AddEditSkillsComponent,
                title: `Edit Skill | ${Constants.APP_NAME}`
            },
        ]
    },
    {
        path: '**',
        component: NotFoundComponent,
        title: '404 - Page not found'
    }
];
