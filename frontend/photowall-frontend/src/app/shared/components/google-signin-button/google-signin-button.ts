import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { environment } from '../../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-google-signin-button',
  standalone: true,
  template: `<div #btn class="google-btn-wrap"></div>`,
  styles: [`.google-btn-wrap { display: flex; justify-content: center; }`]
})
export class GoogleSigninButtonComponent implements AfterViewInit {
  @ViewChild('btn', { static: true }) btnRef!: ElementRef<HTMLDivElement>;
  @Output() credential = new EventEmitter<string>();

  ngAfterViewInit(): void {
    this.renderWhenReady();
  }

  private renderWhenReady(retries = 20): void {
    if (typeof google === 'undefined' || !google.accounts?.id) {
      if (retries <= 0) return;
      setTimeout(() => this.renderWhenReady(retries - 1), 150);
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => this.credential.emit(response.credential)
    });

    google.accounts.id.renderButton(this.btnRef.nativeElement, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      width: 320,
      text: 'continue_with'
    });
  }
}
