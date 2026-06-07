import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from "@angular/core";
import {
    ConnectionRequested,
    ICECandidate,
    JoinedInterview,
    Participant,
    SocketService,
    UserJoined,
    UserLeft,
    WebRTCAnswer,
    WebRTCOffer,
} from "../../services/socket-service/socket.service";
import { CallState, WebRTCService } from "../../services/Webrtc-service/web-rtc.service";
import { Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { AuthStateService } from "../../../services/authState/auth-state.service";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-video-call",
    imports: [CommonModule,FormsModule],
    templateUrl: "./video-call.component.html",
    styleUrl: "./video-call.component.css",
})
export class VideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private socketService = inject(SocketService);
    private webrtcService = inject(WebRTCService);
    private snackBar = inject(MatSnackBar);
    private _authState = inject(AuthStateService);

    @ViewChild("localVideo") localVideo!: ElementRef<HTMLVideoElement>;
    @ViewChild("remoteVideo") remoteVideo!: ElementRef<HTMLVideoElement>;

    roomId = "";
    applicationId = "";
    interviewId = "";
    userId = "";
    userRole: "user" | "company" | "admin" = "user";
    remoteSocketId = "";

    shouldInitiate = false;
    existingParticipants: Participant[] = [];

    callState: CallState | null = null;
    isCallActive = false;
    callDuration = 0;
    private durationInterval: ReturnType<typeof setInterval> | null = null;

    loading = true;
    error: string | null = null;
    waitingForParticipant = false;

    returnPageUrl = "";

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        // Get auth state first and set user info
        this._authState.authState$.pipe(takeUntil(this.destroy$)).subscribe((authstate) => {
            if (authstate.user) {
                this.userId = authstate.user?.id;
                this.userRole = authstate.user?.role;
                
                // Set return URL after we have the role
                if (this.interviewId) {
                    this.setReturnUrl();
                }
            }
        });

        // Get route params and set return URL
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: Params) => {
            this.applicationId = params["applicationId"] as string;
            this.interviewId = params["interviewId"] as string;
            this.roomId = `interview-${this.applicationId}-${this.interviewId}`;

            // Set return URL with updated params (if userRole is already set)
            if (this.userRole) {
                this.setReturnUrl();
            }
        });

        // Check for return URL from navigation state (highest priority)
        const stateUrl = history.state?.returnUrl;
        if (stateUrl) {
            this.returnPageUrl = stateUrl;
        }

        if (!this.socketService.getConnectionState()) {
            this.socketService.connect();
        }

        this.webrtcService.callState$.pipe(takeUntil(this.destroy$)).subscribe((state: CallState) => {
            this.callState = state;

            if (state.isConnected && !this.isCallActive) {
                this.isCallActive = true;
                this.startDurationCounter();
            }
        });

        this.setupSocketListeners();

        this.initializeCall().catch((err: Error) => {
            console.error("Failed to initialize call:", err);
        });
    }

    ngAfterViewInit(): void {
        if (this.callState) {
            this.updateVideoElements(this.callState);
        }

        this.webrtcService.callState$.pipe(takeUntil(this.destroy$)).subscribe((state: CallState) => {
            this.updateVideoElements(state);
        });
    }

    ngOnDestroy(): void {
        this.endCall();
        this.destroy$.next();
        this.destroy$.complete();
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
        }
    }

    private setReturnUrl(): void {
        if (!this.interviewId) {
            console.warn("Cannot set return URL: interviewId not available");
            return;
        }

        if (this.userRole === "user") {
            this.returnPageUrl = `/user/my-applications/interviews/${this.interviewId}`;
        } else if (this.userRole === "company") {
            this.returnPageUrl = `/company/dashboard/interviews/${this.interviewId}`;
        }

    }

    private updateVideoElements(state: CallState): void {
        if (state.localStream && this.localVideo?.nativeElement) {
            this.localVideo.nativeElement.srcObject = state.localStream;
        }

        if (state.remoteStream && this.remoteVideo?.nativeElement) {
            this.remoteVideo.nativeElement.srcObject = state.remoteStream;
            this.waitingForParticipant = false;
        }
    }

    private setupSocketListeners(): void {
        this.socketService
            .onJoinedInterview()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: JoinedInterview) => {
                this.shouldInitiate = data.shouldInitiate;
                this.existingParticipants = data.existingParticipants;
                this.loading = false;

                if (data.existingParticipants.length > 0) {
                    this.waitingForParticipant = false;

                    const firstParticipant = data.existingParticipants[0];
                    this.remoteSocketId = firstParticipant.socketId;
                    this.webrtcService.setRemoteSocketId(firstParticipant.socketId);

                    this.socketService.requestConnection(this.roomId, firstParticipant.socketId);
                } else {
                    this.waitingForParticipant = true;
                }
            });

        this.socketService
            .onConnectionRequested()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: ConnectionRequested) => {
                this.remoteSocketId = data.from;
                this.webrtcService.setRemoteSocketId(data.from);

                this.webrtcService.initializePeerConnection(this.roomId, true);
                this.createOffer();
            });

        this.socketService
            .onUserJoined()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: UserJoined) => {
                this.remoteSocketId = data.socketId;
                this.webrtcService.setRemoteSocketId(data.socketId);
                this.waitingForParticipant = false;

                if (this.shouldInitiate) {
                    this.createOffer();
                }
            });

        this.socketService
            .onWebRTCOffer()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: WebRTCOffer) => {
                this.remoteSocketId = data.from;
                this.webrtcService.setRemoteSocketId(data.from);
                this.webrtcService.handleOffer(data.offer, this.roomId, data.from).catch((err: Error) => {
                    console.error("Error handling offer:", err);
                });
            });

        this.socketService
            .onWebRTCAnswer()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: WebRTCAnswer) => {
                this.webrtcService.handleAnswer(data.answer).catch((err: Error) => {
                    console.error("Error handling answer:", err);
                });
            });

        this.socketService
            .onICECandidate()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: ICECandidate) => {
                this.webrtcService.handleIceCandidate(data.candidate).catch((err: Error) => {
                    console.error("Error handling ICE candidate:", err);
                });
            });

        this.socketService
            .onUserLeft()
            .pipe(takeUntil(this.destroy$))
            .subscribe((_data: UserLeft) => {
                this.snackBar.open("Other participant left the call", "Close", {
                    duration: 3000,
                });
                this.waitingForParticipant = true;

                if (this.remoteVideo?.nativeElement) {
                    this.remoteVideo.nativeElement.srcObject = null;
                }
            });

        // Interview ended
        this.socketService
            .onInterviewEnded()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.snackBar.open("Interview has been ended", "Close", {
                    duration: 3000,
                });
                
                // Ensure return URL is set before navigation
                if (!this.returnPageUrl) {
                    this.setReturnUrl();
                }
                
                
                setTimeout(() => {
                    this.router.navigate([this.returnPageUrl]);
                }, 2000);
            });

        // Socket errors
        this.socketService
            .onError()
            .pipe(takeUntil(this.destroy$))
            .subscribe((errorMsg: string) => {
                this.snackBar.open(errorMsg, "Close", { duration: 5000 });
            });
    }

    private async initializeCall(): Promise<void> {
        try {
            // Initialize local stream
            await this.webrtcService.initializeLocalStream(true);

            // Initialize peer connection
            this.webrtcService.initializePeerConnection(this.roomId, false);

            // Join interview room via SocketService
            this.socketService.joinInterview(this.applicationId, this.interviewId, this.roomId, this.userId, this.userRole);
        } catch (error) {
            const err = error as Error;
            this.error = err.message;
            this.loading = false;
            this.snackBar.open("Failed to initialize call", "Close", {
                duration: 5000,
            });
        }
    }

    private createOffer(): void {
        this.webrtcService.createOffer(this.roomId, this.remoteSocketId).catch((err: Error) => {
            console.error("Error creating offer:", err);
            this.snackBar.open("Failed to establish connection", "Close", {
                duration: 3000,
            });
        });
    }

    toggleAudio(): void {
        this.webrtcService.toggleAudio();
    }

    toggleVideo(): void {
        this.webrtcService.toggleVideo();
    }

    toggleScreenShare(): void {
        if (this.callState?.isScreenSharing) {
            this.webrtcService.stopScreenShare().catch((err: Error) => {
                console.error("Error stopping screen share:", err);
            });
        } else {
            this.webrtcService.startScreenShare().catch((err: Error) => {
                console.error("Error starting screen share:", err);
                this.snackBar.open("Failed to share screen", "Close", {
                    duration: 3000,
                });
            });
        }
    }

    endCall(): void {
        // Ensure return URL is set before ending call
        if (!this.returnPageUrl) {
            this.setReturnUrl();
        }


        // Leave interview via SocketService
        this.socketService.leaveInterview(this.roomId, this.userId);

        // Cleanup WebRTC
        this.webrtcService.endCall();

        // Navigate back
        if (this.returnPageUrl) {
            this.router.navigate([this.returnPageUrl]);
        } else {
            console.error("No return URL available, navigating to dashboard");
            // Fallback navigation
            if (this.userRole === "user") {
                this.router.navigate(["/user/my-applications"]);
            } else {
                this.router.navigate(["/company/dashboard"]);
            }
        }
    }

    endInterviewForAll(): void {
        if (this.userRole === "company") {
            this.socketService.endInterview(this.roomId);
            this.endCall();
        }
    }

    private startDurationCounter(): void {
        this.durationInterval = setInterval(() => {
            this.callDuration++;
        }, 1000);
    }

    getFormattedDuration(): string {
        const hours = Math.floor(this.callDuration / 3600);
        const minutes = Math.floor((this.callDuration % 3600) / 60);
        const seconds = this.callDuration % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    getConnectionStatusText(): string {
        if (this.waitingForParticipant) {
            return "Waiting for participant...";
        }

        switch (this.callState?.connectionStatus) {
            case "connecting":
                return "Connecting...";
            case "connected":
                return "Connected";
            case "disconnected":
                return "Disconnected";
            case "failed":
                return "Connection Failed";
            default:
                return "Not Connected";
        }
    }
}