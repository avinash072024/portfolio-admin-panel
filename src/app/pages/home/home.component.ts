import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Analytics Data
  stats = [
    { label: 'Total Projects', count: 42, icon: 'bi-kanban', color: 'primary' },
    { label: 'Skills Mastered', count: 18, icon: 'bi-award', color: 'success' },
    { label: 'Site Visitors', count: 1250, icon: 'bi-people', color: 'info' },
    { label: 'Resume Downloads', count: 89, icon: 'bi-cloud-download', color: 'warning' }
  ];

  visitors = [
    { status: "success", country: "India", countryCode: "IN", region: "MH", regionName: "Maharashtra", city: "Kolhapur", zip: "416122", lat: 16.6956, lon: 74.2317, timezone: "Asia/Kolkata", isp: "Idea Cellular Ltd", org: "", as: "AS45271 Vodafone Idea Ltd", query: "106.76.78.161" },
    { status: "success", country: "United States", countryCode: "US", region: "CA", regionName: "California", city: "San Francisco", zip: "94105", lat: 37.7749, lon: -122.4194, timezone: "America/Los_Angeles", isp: "Comcast Cable", org: "", as: "AS7922 Comcast Cable", query: "73.223.11.21" },
    { status: "success", country: "United Kingdom", countryCode: "GB", region: "ENG", regionName: "England", city: "London", zip: "EC1A", lat: 51.5074, lon: -0.1278, timezone: "Europe/London", isp: "BT", org: "", as: "AS2856 BT", query: "81.134.202.29" },
    { status: "success", country: "Germany", countryCode: "DE", region: "BE", regionName: "Berlin", city: "Berlin", zip: "10115", lat: 52.52, lon: 13.405, timezone: "Europe/Berlin", isp: "Deutsche Telekom", org: "", as: "AS3320 Deutsche Telekom", query: "79.200.120.45" },
    { status: "success", country: "Australia", countryCode: "AU", region: "NSW", regionName: "New South Wales", city: "Sydney", zip: "2000", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney", isp: "Telstra", org: "", as: "AS1221 Telstra", query: "120.140.20.10" }
  ];

  ngOnInit() {
    AOS.init({ duration: 1000, once: true });
  }
}