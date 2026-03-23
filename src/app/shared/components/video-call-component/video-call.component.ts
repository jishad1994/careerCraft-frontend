import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
} from '../../services/socket-service/socket.service';
import {
  CallState,
  WebRTCService,
} from '../../services/Webrtc-service/web-rtc.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthState } from '../../../models/auth.model';
import { AuthStateService } from '../../../services/authState/auth-state.service';

@Component({
  selector: 'app-video-call',
  imports: [CommonModule],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.css',
})
export class VideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  roomId: string = '';
  applicationId: string = '';
  interviewId: string = '';
  userId: string = '';
  userRole: 'user' | 'company' | 'admin' = 'user';
  remoteSocketId: string = '';

  shouldInitiate: boolean = false;
  existingParticipants: Participant[] = [];

  callState: CallState | null = null;
  isCallActive: boolean = false;
  callDuration: number = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;

  loading: boolean = true;
  error: string | null = null;
  waitingForParticipant: boolean = false;

  returnPageUrl: string = `user/my-applications/${this.applicationId}/interviews/${this.interviewId}`;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private webrtcService: WebRTCService,
    private snackBar: MatSnackBar,
    private _authState: AuthStateService,
  ) {}

  ngOnInit(): void {
    // Get params
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: Params) => {
        this.applicationId = params['applicationId'] as string;
        this.interviewId = params['interviewId'] as string;
        this.roomId = `interview-${this.applicationId}-${this.interviewId}`;
      });

    // Get user info

    this._authState.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((authstate) => {
        if (authstate.user) {
          this.userId = authstate.user?.id;
          this.userRole = authstate.user?.role;
        }
      });

    // Ensure socket is connected
    if (!this.socketService.getConnectionState()) {
      this.socketService.connect();
    }

    // Subscribe to call state
    this.webrtcService.callState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: CallState) => {
        this.callState = state;

        // Start duration counter when connected
        if (state.isConnected && !this.isCallActive) {
          this.isCallActive = true;
          this.startDurationCounter();
        }
      });

    // Setup WebRTC socket listeners
    this.setupSocketListeners();

    // Initialize call
    this.initializeCall().catch((err: Error) => {
      console.error('Failed to initialize call:', err);
    });

    this.returnPageUrl = history.state.returnUrl;
  }

  ngAfterViewInit(): void {
    // Update video elements after view init
    if (this.callState) {
      this.updateVideoElements(this.callState);
    }

    // Subscribe to call state changes for video updates
    this.webrtcService.callState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: CallState) => {
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

  private updateVideoElements(state: CallState): void {
    // Update local video
    if (state.localStream && this.localVideo?.nativeElement) {
      this.localVideo.nativeElement.srcObject = state.localStream;
    }

    // Update remote video
    if (state.remoteStream && this.remoteVideo?.nativeElement) {
      this.remoteVideo.nativeElement.srcObject = state.remoteStream;
      this.waitingForParticipant = false;
    }
  }

  private setupSocketListeners(): void {
    // Joined interview confirmation
    this.socketService
      .onJoinedInterview()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: JoinedInterview) => {
        console.log('Successfully joined interview:', data);
        this.shouldInitiate = data.shouldInitiate;
        this.existingParticipants = data.existingParticipants;
        this.loading = false;

        if (data.existingParticipants.length > 0) {
          console.log(
            'Existing participants found:',
            data.existingParticipants,
          );
          this.waitingForParticipant = false;

          const firstParticipant = data.existingParticipants[0];
          this.remoteSocketId = firstParticipant.socketId;
          this.webrtcService.setRemoteSocketId(firstParticipant.socketId);

          // Request connection
          this.socketService.requestConnection(
            this.roomId,
            firstParticipant.socketId,
          );
        } else {
          console.log('First to join - waiting for participant');
          this.waitingForParticipant = true;
        }
      });

    // Connection requested by late joiner
    this.socketService
      .onConnectionRequested()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ConnectionRequested) => {
        console.log('Connection requested by:', data.from);
        this.remoteSocketId = data.from;
        this.webrtcService.setRemoteSocketId(data.from);

        // Re-initialize peer connection and create offer
        this.webrtcService.initializePeerConnection(this.roomId, true);
        this.createOffer();
      });

    // User joined
    this.socketService
      .onUserJoined()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: UserJoined) => {
        console.log('User joined:', data);
        this.remoteSocketId = data.socketId;
        this.webrtcService.setRemoteSocketId(data.socketId);
        this.waitingForParticipant = false;

        if (this.shouldInitiate) {
          this.createOffer();
        }
      });

    // WebRTC offer received
    this.socketService
      .onWebRTCOffer()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: WebRTCOffer) => {
        console.log('Received offer from:', data.from);
        this.remoteSocketId = data.from;
        this.webrtcService.setRemoteSocketId(data.from);
        this.webrtcService
          .handleOffer(data.offer, this.roomId, data.from)
          .catch((err: Error) => {
            console.error('Error handling offer:', err);
          });
      });

    // WebRTC answer received
    this.socketService
      .onWebRTCAnswer()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: WebRTCAnswer) => {
        console.log('Received answer from:', data.from);
        this.webrtcService.handleAnswer(data.answer).catch((err: Error) => {
          console.error('Error handling answer:', err);
        });
      });

    // ICE candidate received
    this.socketService
      .onICECandidate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ICECandidate) => {
        this.webrtcService
          .handleIceCandidate(data.candidate)
          .catch((err: Error) => {
            console.error('Error handling ICE candidate:', err);
          });
      });

    // User left
    this.socketService
      .onUserLeft()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: UserLeft) => {
        console.log('User left:', data);
        this.snackBar.open('Other participant left the call', 'Close', {
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
        this.snackBar.open('Interview has been ended', 'Close', {
          duration: 3000,
        });
        setTimeout(() => {
          this.router.navigate([this.returnPageUrl]);
        }, 2000);
      });

    // Socket errors
    this.socketService
      .onError()
      .pipe(takeUntil(this.destroy$))
      .subscribe((errorMsg: string) => {
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      });
  }

  private async initializeCall(): Promise<void> {
    try {
      // Initialize local stream
      await this.webrtcService.initializeLocalStream(true);

      // Initialize peer connection
      this.webrtcService.initializePeerConnection(this.roomId, false);

      // Join interview room via SocketService
      this.socketService.joinInterview(
        this.applicationId,
        this.interviewId,
        this.roomId,
        this.userId,
        this.userRole,
      );
    } catch (error) {
      const err = error as Error;
      this.error = err.message;
      this.loading = false;
      this.snackBar.open('Failed to initialize call', 'Close', {
        duration: 5000,
      });
    }
  }

  private createOffer(): void {
    console.log('Creating offer for:', this.remoteSocketId);
    this.webrtcService
      .createOffer(this.roomId, this.remoteSocketId)
      .catch((err: Error) => {
        console.error('Error creating offer:', err);
        this.snackBar.open('Failed to establish connection', 'Close', {
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
        console.error('Error stopping screen share:', err);
      });
    } else {
      this.webrtcService.startScreenShare().catch((err: Error) => {
        console.error('Error starting screen share:', err);
        this.snackBar.open('Failed to share screen', 'Close', {
          duration: 3000,
        });
      });
    }
  }

  endCall(): void {
    // Leave interview via SocketService
    this.socketService.leaveInterview(this.roomId, this.userId);

    // Cleanup WebRTC
    this.webrtcService.endCall();

    // Navigate back
    this.router.navigate([this.returnPageUrl]);
  }

  endInterviewForAll(): void {
    if (this.userRole === 'company') {
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
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getConnectionStatusText(): string {
    if (this.waitingForParticipant) {
      return 'Waiting for participant...';
    }

    switch (this.callState?.connectionStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Not Connected';
    }
  }
}
