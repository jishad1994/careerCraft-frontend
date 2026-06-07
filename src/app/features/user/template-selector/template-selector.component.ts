import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
    ResumeTemplate,
    ResumeTemplateId,
} from "../../../models/user/user-resume.model";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-template-selector",
    imports: [CommonModule],
    templateUrl: "./template-selector.component.html",
    styleUrl: "./template-selector.component.css",
})
export class TemplateSelectorComponent {
    @Input() templates: ResumeTemplate[] = [];
    @Input() selectedId: ResumeTemplateId = "classic";
    @Output() templateSelected = new EventEmitter<ResumeTemplateId>();

    onSelect(id: ResumeTemplateId): void {
        this.templateSelected.emit(id);
    }
}