import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";

interface Project {
  _id: string;
  title: string;
  category: string;
  date: string;
  desc: string[];
  image?: string;
  tools: string[];
  link?: string;
}

@Component({
  selector: 'app-project',
  imports: [CommonModule, RouterLink],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  projects: Project[] = [];

  ngOnInit(): void {
    // Ideally fetched from your MongoDB via an Angular Service
    this.projects = [
      {
        _id: '1',
        title: 'Portfolio Admin',
        category: 'Web Development',
        date: '2026-01-15',
        desc: ['Modern admin panel with light/dark mode', 'Responsive design'],
        tools: ['Angular', 'Bootstrap', 'MongoDB'],
        link: 'https://example.com'
      }
    ];
  }

  onEdit(project: Project) {
    console.log('Editing project:', project.title);
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      console.log('Deleting project ID:', id);
    }
  }
}