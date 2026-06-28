import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Photo } from '../../shared/models/Photo.model';

@Injectable({ providedIn: 'root' })
export class PhotosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/photos`;

  getPhotosByEvent(eventSlug: string) {
    return this.http.get<Photo[]>(`${this.base}/event/${eventSlug}`);
  }

  uploadPhoto(eventSlug: string, file: File, caption?: string) {
    const formData = new FormData();
    formData.append('photo', file);
    if (caption) formData.append('caption', caption);

    const req = new HttpRequest(
      'POST',
      `${this.base}/event/${eventSlug}`,
      formData,
      { reportProgress: true }
    );

    return this.http.request<Photo>(req);
  }

  deletePhoto(photoId: string) {
    return this.http.delete<void>(`${this.base}/${photoId}`);
  }

 getLatestPhotos(eventSlug: string, since?: string) {
  let params = new HttpParams();

  if (since) {
    params = params.set('since', since);
  }

  return this.http.get<Photo[]>(
    `${this.base}/event/${eventSlug}/latest`,
    { params }
  );
}
}
