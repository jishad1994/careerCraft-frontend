import {
    Component,
    ElementRef,
    Input,
    SimpleChanges,
    ViewChild,
    OnChanges,
} from "@angular/core";
import { ResumeData } from "../../../models/user/user-resume.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-resume-preview",
    imports: [CommonModule],
    templateUrl: "./resume-preview.component.html",
    styleUrl: "./resume-preview.component.css",
})
export class ResumePreviewComponent implements OnChanges {
    @Input() data!: ResumeData;

    @ViewChild("previewContainer")
    previewContainer!: ElementRef<HTMLDivElement>;

    contactLine = "";
    linksLine = "";
    skillNames = "";
    isEmpty = true;

    ngOnChanges(_changes: SimpleChanges): void {
        if (this.data) {
            this.computeDerived();
        }
    }

    private computeDerived(): void {
        const pi = this.data.personalInfo;

        this.contactLine = [pi.email, pi.phone, pi.location]
            .filter(Boolean)
            .join("  |  ");

        this.linksLine = [pi.linkedIn, pi.portfolio]
            .filter(Boolean)
            .join("  |  ");

        this.skillNames = this.data.skills
            .map((s) => s.name)
            .filter(Boolean)
            .join("  •  ");

        this.isEmpty =
            !pi.fullName &&
            !this.data.summary.text &&
            this.data.experience.length === 0 &&
            this.data.education.length === 0 &&
            this.data.skills.length === 0;
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
    }
}