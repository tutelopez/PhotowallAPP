import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast"
             [class.toast--error]="t.type === 'error'"
             [class.toast--success]="t.type === 'success'"
             [class.toast--info]="t.type === 'info'"
             (click)="toastService.dismiss(t.id)">
          <i class="bi"
             [class.bi-x-circle-fill]="t.type === 'error'"
             [class.bi-check-circle-fill]="t.type === 'success'"
             [class.bi-info-circle-fill]="t.type === 'info'"></i>
          <span>{{ t.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
      z-index: 9999; display: flex; flex-direction: column-reverse; gap: 0.6rem;
      width: min(380px, calc(100vw - 2rem));
    }
    .toast {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.85rem 1.1rem; border-radius: 12px;
      font-size: 0.875rem; cursor: pointer;
      background: #14141c; border: 1px solid rgba(255,255,255,0.12);
      color: #F8F7FF; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: toast-in 0.25s ease;
    }
    .toast--error   { border-color: rgba(226,75,74,0.45); }
    .toast--error i { color: #f09595; }
    .toast--success { border-color: rgba(74,222,128,0.45); }
    .toast--success i { color: #4ade80; }
    .toast--info    { border-color: rgba(124,58,237,0.45); }
    .toast--info i  { color: #A78BFA; }
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
