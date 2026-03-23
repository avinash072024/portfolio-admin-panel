import { Routes } from '@angular/router';
import { Constants } from './models/constants';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: `Login | ${Constants.APP_NAME}`
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: `Forgot Password | ${Constants.APP_NAME}`
    },
    {
        path: '',
        component: LayoutComponent,
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
            }
        ]
    },
    {
        path: '**',
        component: NotFoundComponent,
        title: '404 - Page not found'
    }
];
