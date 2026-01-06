import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CompanyJobService } from '../../../../services/company/job/company-job.service';

@Component({
  selector: 'app-edit-job',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-job.component.html',
  styleUrl: './edit-job.component.css',
})
export class EditJobComponent implements OnInit {
  jobForm!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _http: HttpClient,
    private _companyJobService: CompanyJobService
  ) {}



  ngOnInit(): void {
   this.jobForm=this._fb.group({

title:['',[valid]]


   }) 
  }
}
