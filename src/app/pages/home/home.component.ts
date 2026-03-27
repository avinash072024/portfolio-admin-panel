import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';
import { RouterLink } from '@angular/router';
import { VisitorService } from '../../services/visitor/visitor.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

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

  // visitors = [
  //   {
  //     _id: "69c6523243a7e63d1ac39426",
  //     ip: "2402:8100:22c7:b47c:5806:6285:5fb7:ee9f",
  //     network: "2402:8100:2200::/40",
  //     version: "IPv6",
  //     city: "Kolhāpur",
  //     region: "Maharashtra",
  //     region_code: "MH",
  //     country: "IN",
  //     country_name: "India",
  //     country_code: "IN",
  //     country_code_iso3: "IND",
  //     country_capital: "New Delhi",
  //     country_tld: ".in",
  //     continent_code: "AS",
  //     in_eu: false,
  //     postal: "416205",
  //     latitude: 16.6956,
  //     longitude: 74.2317,
  //     timezone: "Asia/Kolkata",
  //     utc_offset: "+0530",
  //     country_calling_code: "+91",
  //     currency: "INR",
  //     currency_name: "Rupee",
  //     languages: "en-IN,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,bh,sat,ks,ne,sd,kok,doi,mni,…",
  //     country_area: 3287590,
  //     country_population: 1352617328,
  //     asn: "AS45271",
  //     org: "Vodafone Idea Ltd",
  //     status: "success"
  //   },
  //   {
  //     _id: "69c6523243a7e63d1ac39427",
  //     ip: "103.1.2.3",
  //     network: "103.1.2.0/24",
  //     version: "IPv4",
  //     city: "Mumbai",
  //     region: "Maharashtra",
  //     region_code: "MH",
  //     country: "IN",
  //     country_name: "India",
  //     country_code: "IN",
  //     country_code_iso3: "IND",
  //     country_capital: "New Delhi",
  //     country_tld: ".in",
  //     continent_code: "AS",
  //     in_eu: false,
  //     postal: "400001",
  //     latitude: 19.0760,
  //     longitude: 72.8777,
  //     timezone: "Asia/Kolkata",
  //     utc_offset: "+0530",
  //     country_calling_code: "+91",
  //     currency: "INR",
  //     currency_name: "Rupee",
  //     languages: "en-IN,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,bh,sat,ks,ne,sd,kok,doi,mni,…",
  //     country_area: 3287590,
  //     country_population: 1352617328,
  //     asn: "AS12345",
  //     org: "Reliance Jio Infocomm Ltd",
  //     status: "success"
  //   },
  //   {
  //     _id: "69c6523243a7e63d1ac39428",
  //     ip: "192.168.1.1",
  //     network: "192.168.1.0/24",
  //     version: "IPv4",
  //     city: "San Francisco",
  //     region: "California",
  //     region_code: "CA",
  //     country: "US",
  //     country_name: "United States",
  //     country_code: "US",
  //     country_code_iso3: "USA",
  //     country_capital: "Washington DC",
  //     country_tld: ".us",
  //     continent_code: "NA",
  //     in_eu: false,
  //     postal: "94105",
  //     latitude: 37.7749,
  //     longitude: -122.4194,
  //     timezone: "America/Los_Angeles",
  //     utc_offset: "-0800",
  //     country_calling_code: "+1",
  //     currency: "USD",
  //     currency_name: "US Dollar",
  //     languages: "en-US,es-US,haw,fr",
  //     country_area: 9833517,
  //     country_population: 327167434,
  //     asn: "AS7922",
  //     org: "Comcast Cable Communications, LLC",
  //     status: "success"
  //   }
  // ];
  visitors: any[] = [];
  private visitorService = inject(VisitorService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);


  // constructor(private visitorService: VisitorService) { }

  ngOnInit() {
    AOS.init({ duration: 1000, once: true });
    this.getVisitor();
  }

  getVisitor(): void {
    this.spinner.show();
    this.visitorService.getVisitor().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.visitors = res.data;
          this.spinner.hide();
          // this.toastr.success(res?.message);
        } else {
          this.spinner.hide();
          this.toastr.error(res?.message)
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error(err.error.message || 'Failed to load visitor count');
      }
    });
  }
}