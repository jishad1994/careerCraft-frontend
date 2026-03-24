import { Component } from "@angular/core";
import { Conversation } from "../../../../models/chat.model";
import { CommonModule } from "@angular/common";
import { ChatListComponent } from "../chat-list/chat-list.component";
import { ChatWindowComponent } from "../chat-window/chat-window.component";

@Component({
    selector: "app-chat-page",
    imports: [CommonModule, ChatListComponent, ChatWindowComponent],
    templateUrl: "./chat-page.component.html",
    styleUrl: "./chat-page.component.css",
})
export class ChatPageComponent {
    selectedConversation: Conversation | null = null;
    showMobileChat = false;

    onConversationSelected(conversation: Conversation): void {
        this.selectedConversation = conversation;
        this.showMobileChat = true;
    }

    closeMobileChat(): void {
        this.showMobileChat = false;
    }
}
