// src/app/core/user.model.ts
export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'super_admin' | 'organizer' | 'guest';
  eventId?: string; // 👈 opcional, porque solo los invitados lo tienen

}
