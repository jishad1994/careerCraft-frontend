// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Socket } from 'socket.io-client';
// import { SocketService } from '../socket-service/socket.service';

// export type ConnectionStatus =
//   | 'connecting'
//   | 'connected'
//   | 'disconnected'
//   | 'failed';

// export interface CallState {
//   isConnected: boolean;
//   isAudioEnabled: boolean;
//   isVideoEnabled: boolean;
//   isScreenSharing: boolean;
//   remoteStream: MediaStream | null;
//   localStream: MediaStream | null;
//   connectionStatus: ConnectionStatus;
// }

// export interface MediaConstraints {
//   video: boolean | MediaTrackConstraints;
//   audio: boolean | MediaTrackConstraints;
// }
// interface ExtendedVideoTrackConstraints extends MediaTrackConstraints {
//   cursor?: 'always' | 'motion' | 'never';
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class WebRTCService {
//   private peerConnection: RTCPeerConnection | null = null;
//   private localStream: MediaStream | null = null;
//   private remoteStream: MediaStream | null = null;
//   private remoteSocketId: string = '';

//   private callStateSubject = new BehaviorSubject<CallState>({
//     isConnected: false,
//     isAudioEnabled: true,
//     isVideoEnabled: true,
//     isScreenSharing: false,
//     remoteStream: null,
//     localStream: null,
//     connectionStatus: 'disconnected',
//   });

//   public callState$: Observable<CallState> =
//     this.callStateSubject.asObservable();

//   private configuration: RTCConfiguration = {
//     iceServers: [
//       { urls: 'stun:stun.l.google.com:19302' },
//       { urls: 'stun:stun1.l.google.com:19302' },
//     ],
//   };

//   constructor(private socketService: SocketService) {}

//   /**
//    * Initialize local media stream
//    */
//   async initializeLocalStream(
//     videoEnabled: boolean = true,
//   ): Promise<MediaStream> {
//     try {
//       const constraints: MediaConstraints = {
//         video: videoEnabled ? { width: 1280, height: 720 } : false,
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       };

//       this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

//       this.updateCallState({ localStream: this.localStream });
//       return this.localStream;
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//       throw new Error('Failed to access camera/microphone');
//     }
//   }

//   /**
//    * Initialize peer connection
//    */
//   initializePeerConnection(
//     roomId: string,
//     isInitiator: boolean,
//   ): RTCPeerConnection {
//     this.peerConnection = new RTCPeerConnection(this.configuration);

//     // Add local stream tracks
//     if (this.localStream) {
//       this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
//         if (this.peerConnection && this.localStream) {
//           this.peerConnection.addTrack(track, this.localStream);
//         }
//       });
//     }

//     // Handle remote stream
//     this.peerConnection.ontrack = (event: RTCTrackEvent) => {
//       if (event.streams && event.streams[0]) {
//         this.remoteStream = event.streams[0];
//         this.updateCallState({
//           remoteStream: this.remoteStream,
//           isConnected: true,
//           connectionStatus: 'connected',
//         });
//       }
//     };

//     // Handle ICE candidates - Use SocketService
//     this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
//       if (event.candidate && this.remoteSocketId) {
//         this.socketService.sendIceCandidate(
//           roomId,
//           event.candidate,
//           this.remoteSocketId,
//         );
//       }
//     };

//     // Handle connection state changes
//     this.peerConnection.onconnectionstatechange = () => {
//       if (!this.peerConnection) return;

//       const state = this.peerConnection.connectionState;
//       console.log('Connection state:', state);

//       if (state === 'connected') {
//         this.updateCallState({
//           connectionStatus: 'connected',
//           isConnected: true,
//         });
//       } else if (state === 'disconnected' || state === 'failed') {
//         this.updateCallState({
//           connectionStatus: state as ConnectionStatus,
//           isConnected: false,
//         });
//       } else if (state === 'connecting') {
//         this.updateCallState({ connectionStatus: 'connecting' });
//       }
//     };

//     // Handle ICE connection state
//     this.peerConnection.oniceconnectionstatechange = () => {
//       if (!this.peerConnection) return;
//       console.log(
//         'ICE connection state:',
//         this.peerConnection.iceConnectionState,
//       );
//     };

//     return this.peerConnection;
//   }

//   /**
//    * Create and send offer - Uses SocketService
//    */
//   async createOffer(roomId: string, remoteSocketId: string): Promise<void> {
//     if (!this.peerConnection) {
//       throw new Error('Peer connection not initialized');
//     }

//     try {
//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);

//       // Use SocketService to send offer
//       this.socketService.sendOffer(roomId, offer, remoteSocketId);
//     } catch (error) {
//       console.error('Error creating offer:', error);
//       throw error;
//     }
//   }

//   /**
//    * Handle incoming offer - Uses SocketService
//    */
//   async handleOffer(
//     offer: RTCSessionDescriptionInit,
//     roomId: string,
//     remoteSocketId: string,
//   ): Promise<void> {
//     if (!this.peerConnection) {
//       throw new Error('Peer connection not initialized');
//     }

//     try {
//       await this.peerConnection.setRemoteDescription(
//         new RTCSessionDescription(offer),
//       );
//       const answer = await this.peerConnection.createAnswer();
//       await this.peerConnection.setLocalDescription(answer);

//       // Use SocketService to send answer
//       this.socketService.sendAnswer(roomId, answer, remoteSocketId);
//     } catch (error) {
//       console.error('Error handling offer:', error);
//       throw error;
//     }
//   }

//   /**
//    * Handle incoming answer
//    */
//   async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
//     if (!this.peerConnection) {
//       throw new Error('Peer connection not initialized');
//     }

//     try {
//       await this.peerConnection.setRemoteDescription(
//         new RTCSessionDescription(answer),
//       );
//     } catch (error) {
//       console.error('Error handling answer:', error);
//       throw error;
//     }
//   }

//   /**
//    * Handle incoming ICE candidate
//    */
//   async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
//     if (!this.peerConnection) {
//       console.warn('Peer connection not initialized');
//       return;
//     }

//     try {
//       await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//     } catch (error) {
//       console.error('Error adding ICE candidate:', error);
//     }
//   }

//   /**
//    * Toggle audio
//    */
//   toggleAudio(): boolean {
//     if (!this.localStream) return false;

//     const audioTrack = this.localStream.getAudioTracks()[0];
//     if (audioTrack) {
//       audioTrack.enabled = !audioTrack.enabled;
//       this.updateCallState({ isAudioEnabled: audioTrack.enabled });
//       return audioTrack.enabled;
//     }
//     return false;
//   }

//   /**
//    * Toggle video
//    */
//   toggleVideo(): boolean {
//     if (!this.localStream) return false;

//     const videoTrack = this.localStream.getVideoTracks()[0];
//     if (videoTrack) {
//       videoTrack.enabled = !videoTrack.enabled;
//       this.updateCallState({ isVideoEnabled: videoTrack.enabled });
//       return videoTrack.enabled;
//     }
//     return false;
//   }

//   /**
//    * Start screen sharing
//    */
//   async startScreenShare(): Promise<void> {
//     try {
//       const displayMediaOptions: DisplayMediaStreamOptions = {
//         video: {
//           cursor: 'always' as 'always' | 'motion' | 'never',
//         } as ExtendedVideoTrackConstraints ,
//         audio: false,
//       };

//       const screenStream =
//         await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

//       const videoTrack = screenStream.getVideoTracks()[0];
//       const sender = this.peerConnection
//         ?.getSenders()
//         .find((s: RTCRtpSender) => s.track?.kind === 'video');

//       if (sender && videoTrack) {
//         await sender.replaceTrack(videoTrack);
//         this.updateCallState({ isScreenSharing: true });

//         // Restore camera when screen share stops
//         videoTrack.onended = () => {
//           this.stopScreenShare().catch((err) => {
//             console.error('Error stopping screen share:', err);
//           });
//         };
//       }
//     } catch (error) {
//       console.error('Error sharing screen:', error);
//       throw error;
//     }
//   }

//   /**
//    * Stop screen sharing
//    */
//   async stopScreenShare(): Promise<void> {
//     if (!this.localStream) return;

//     const videoTrack = this.localStream.getVideoTracks()[0];
//     const sender = this.peerConnection
//       ?.getSenders()
//       .find((s: RTCRtpSender) => s.track?.kind === 'video');

//     if (sender && videoTrack) {
//       await sender.replaceTrack(videoTrack);
//       this.updateCallState({ isScreenSharing: false });
//     }
//   }

//   /**
//    * End call and cleanup
//    */
//   endCall(): void {
//     // Stop all tracks
//     if (this.localStream) {
//       this.localStream
//         .getTracks()
//         .forEach((track: MediaStreamTrack) => track.stop());
//       this.localStream = null;
//     }

//     if (this.remoteStream) {
//       this.remoteStream
//         .getTracks()
//         .forEach((track: MediaStreamTrack) => track.stop());
//       this.remoteStream = null;
//     }

//     // Close peer connection
//     if (this.peerConnection) {
//       this.peerConnection.close();
//       this.peerConnection = null;
//     }

//     // Reset state
//     this.callStateSubject.next({
//       isConnected: false,
//       isAudioEnabled: true,
//       isVideoEnabled: true,
//       isScreenSharing: false,
//       remoteStream: null,
//       localStream: null,
//       connectionStatus: 'disconnected',
//     });

//     // Clear remote socket ID
//     this.remoteSocketId = '';
//   }

//   /**
//    * Get current call state
//    */
//   getCallState(): CallState {
//     return this.callStateSubject.value;
//   }

//   /**
//    * Update call state
//    */
//   private updateCallState(updates: Partial<CallState>): void {
//     this.callStateSubject.next({
//       ...this.callStateSubject.value,
//       ...updates,
//     });
//   }

//   /**
//    * Set remote socket ID
//    */
//   setRemoteSocketId(socketId: string): void {
//     this.remoteSocketId = socketId;
//   }

//   /**
//    * Get remote socket ID
//    */
//   getRemoteSocketId(): string {
//     return this.remoteSocketId;
//   }
// }




import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from '../socket-service/socket.service';

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed';

export interface CallState {
  isConnected: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  connectionStatus: ConnectionStatus;
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

interface ExtendedVideoTrackConstraints extends MediaTrackConstraints {
  cursor?: 'always' | 'motion' | 'never';
}

@Injectable({
  providedIn: 'root',
})
export class WebRTCService {
  private socketService = inject(SocketService);

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;       // always holds the CAMERA stream
  private remoteStream: MediaStream | null = null;
  private screenShareStream: MediaStream | null = null; // holds the screen capture stream
  private remoteSocketId = '';

  private callStateSubject = new BehaviorSubject<CallState>({
    isConnected: false,
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    remoteStream: null,
    localStream: null,
    connectionStatus: 'disconnected',
  });

  public callState$: Observable<CallState> =
    this.callStateSubject.asObservable();

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  /**
   * Initialize local media stream
   */
  async initializeLocalStream(videoEnabled = true): Promise<MediaStream> {
    try {
      const constraints: MediaConstraints = {
        video: videoEnabled ? { width: 1280, height: 720 } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.updateCallState({ localStream: this.localStream });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  /**
   * Initialize peer connection
   */
  initializePeerConnection(roomId: string, _isInitiator: boolean): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.updateCallState({
          remoteStream: this.remoteStream,
          isConnected: true,
          connectionStatus: 'connected',
        });
      }
    };

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && this.remoteSocketId) {
        this.socketService.sendIceCandidate(roomId, event.candidate, this.remoteSocketId);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return;
      const state = this.peerConnection.connectionState;
      console.log('Connection state:', state);

      if (state === 'connected') {
        this.updateCallState({ connectionStatus: 'connected', isConnected: true });
      } else if (state === 'disconnected' || state === 'failed') {
        this.updateCallState({ connectionStatus: state as ConnectionStatus, isConnected: false });
      } else if (state === 'connecting') {
        this.updateCallState({ connectionStatus: 'connecting' });
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      if (!this.peerConnection) return;
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    };

    return this.peerConnection;
  }

  async createOffer(roomId: string, remoteSocketId: string): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socketService.sendOffer(roomId, offer, remoteSocketId);
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async handleOffer(
    offer: RTCSessionDescriptionInit,
    roomId: string,
    remoteSocketId: string,
  ): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socketService.sendAnswer(roomId, answer, remoteSocketId);
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      console.warn('Peer connection not initialized');
      return;
    }
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.updateCallState({ isAudioEnabled: audioTrack.enabled });
      return audioTrack.enabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.updateCallState({ isVideoEnabled: videoTrack.enabled });
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * Start screen sharing.
   *
   * Key fixes vs original:
   * 1. Save the screen stream reference so we can stop its tracks later.
   * 2. Build a `previewStream` (screen video + camera audio) and push it into
   *    callState.localStream so the local <video> element shows the screen.
   * 3. Keep `this.localStream` pointing at the CAMERA stream so we can
   *    restore it cleanly when sharing stops.
   */
  async startScreenShare(): Promise<void> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        } as ExtendedVideoTrackConstraints,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace the video track sent to the remote peer
      const sender = this.peerConnection
        ?.getSenders()
        .find((s: RTCRtpSender) => s.track?.kind === 'video');

      if (!sender || !screenTrack) {
        screenStream.getTracks().forEach(t => t.stop());
        return;
      }

      await sender.replaceTrack(screenTrack);

      // Build a preview stream for the local <video>:
      // screen video + original audio (so mute state still works)
      const previewStream = new MediaStream([screenTrack]);
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(t => previewStream.addTrack(t));
      }

      // Keep a reference to stop the screen capture later
      this.screenShareStream = screenStream;

      this.updateCallState({
        isScreenSharing: true,
        localStream: previewStream, // <-- local preview now shows screen
      });

      // Browser "Stop sharing" button — auto-restore camera
      screenTrack.onended = () => {
        this.stopScreenShare().catch(err =>
          console.error('Error auto-stopping screen share:', err)
        );
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing — restore the camera track on the peer connection
   * and restore the camera preview in callState.localStream.
   */
  async stopScreenShare(): Promise<void> {
    // Stop all screen capture tracks
    this.screenShareStream?.getTracks().forEach(t => t.stop());
    this.screenShareStream = null;

    if (!this.localStream) return;

    // If the camera video track was lost (e.g. ended), re-acquire it
    if (!this.localStream.getVideoTracks().some(t => t.readyState === 'live')) {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });
        // Replace dead video track with fresh one
        this.localStream.getVideoTracks().forEach(t => {
          this.localStream!.removeTrack(t);
          t.stop();
        });
        cameraStream.getVideoTracks().forEach(t => this.localStream!.addTrack(t));
      } catch (err) {
        console.error('Could not re-acquire camera:', err);
      }
    }

    const cameraVideoTrack = this.localStream.getVideoTracks()[0];
    const sender = this.peerConnection
      ?.getSenders()
      .find((s: RTCRtpSender) => s.track?.kind === 'video');

    if (sender && cameraVideoTrack) {
      await sender.replaceTrack(cameraVideoTrack);
    }

    // Restore camera preview — re-emit localStream so the template reacts
    this.updateCallState({
      isScreenSharing: false,
      localStream: this.localStream,
    });
  }

  endCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.localStream = null;
    }

    this.screenShareStream?.getTracks().forEach(t => t.stop());
    this.screenShareStream = null;

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.callStateSubject.next({
      isConnected: false,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      remoteStream: null,
      localStream: null,
      connectionStatus: 'disconnected',
    });

    this.remoteSocketId = '';
  }

  getCallState(): CallState {
    return this.callStateSubject.value;
  }

  private updateCallState(updates: Partial<CallState>): void {
    this.callStateSubject.next({
      ...this.callStateSubject.value,
      ...updates,
    });
  }

  setRemoteSocketId(socketId: string): void {
    this.remoteSocketId = socketId;
  }

  getRemoteSocketId(): string {
    return this.remoteSocketId;
  }
}